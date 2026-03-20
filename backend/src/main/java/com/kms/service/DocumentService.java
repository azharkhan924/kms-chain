package com.kms.service;

import com.kms.blockchain.Block;

import java.util.ArrayList;
import java.util.List;
import com.kms.blockchain.BlockchainManager;
import com.kms.dto.DocumentDto;
import com.kms.exception.BadRequestException;
import com.kms.exception.ResourceNotFoundException;
import com.kms.model.Document;
import com.kms.model.User;
import com.kms.repository.DocumentRepository;
import com.kms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final BlockchainManager blockchainManager;
    private final AuditService auditService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of(
        "application/pdf", "image/jpeg", "image/png", "image/gif",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    );
    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    public DocumentService(DocumentRepository documentRepository,
                           UserRepository userRepository,
                           BlockchainManager blockchainManager,
                           AuditService auditService) {
        this.documentRepository = documentRepository;
        this.userRepository     = userRepository;
        this.blockchainManager  = blockchainManager;
        this.auditService       = auditService;
    }

    // ── Upload original document ───────────────────────────────────

    public DocumentDto.DocumentResponse uploadDocument(MultipartFile file,
                                                       String userEmail,
                                                       String description,
                                                       String categoryStr,
                                                       String expiryDateStr) {
        validateFile(file);

        User user = findUser(userEmail);
        byte[] bytes = readBytes(file);
        String hash  = BlockchainManager.generateSHA256(bytes);
        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String filePath   = saveFile(bytes, storedName);
        Block block       = blockchainManager.storeDocumentHash(hash, storedName, userEmail);
        String txId       = block.getHash();

        Document.DocumentCategory category = parseCategory(categoryStr);
        LocalDate expiryDate = parseDate(expiryDateStr);

        Document doc = Document.builder()
            .originalFileName(file.getOriginalFilename())
            .storedFileName(storedName)
            .filePath(filePath)
            .sha256Hash(hash)
            .blockchainTxId(txId)
            .fileSize(file.getSize())
            .contentType(file.getContentType())
            .status(Document.DocumentStatus.PENDING)
            .uploadedBy(user)
            .description(description)
            .category(category)
            .expiryDate(expiryDate)
            .build();

        Document saved = documentRepository.save(doc);
        auditService.log("DOCUMENT_UPLOADED", userEmail, "Uploaded: " + file.getOriginalFilename());
        return DocumentDto.toResponse(saved);
    }

    // ── Upload new version of an existing document ─────────────────

    public DocumentDto.DocumentResponse uploadNewVersion(Long originalDocId,
                                                         MultipartFile file,
                                                         String userEmail,
                                                         String description) {
        validateFile(file);

        Document original = documentRepository.findByIdAndDeletedFalse(originalDocId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (!original.getUploadedBy().getEmail().equals(userEmail)) {
            throw new BadRequestException("You can only version your own documents");
        }

        // Find the root (parentDocumentId == null means it IS the root)
        Long rootId = original.getParentDocumentId() != null
            ? original.getParentDocumentId() : original.getId();

        // Determine next version number
        List<Document> allVersions = documentRepository.findAllVersions(rootId);
        int nextVersion = allVersions.stream()
            .mapToInt(Document::getVersionNumber).max().orElse(1) + 1;

        User user    = findUser(userEmail);
        byte[] bytes = readBytes(file);
        String hash  = BlockchainManager.generateSHA256(bytes);
        String storedName = UUID.randomUUID() + "_v" + nextVersion + "_" + file.getOriginalFilename();
        String filePath   = saveFile(bytes, storedName);
        Block block       = blockchainManager.storeDocumentHash(hash, storedName, userEmail);
        String txId       = block.getHash();

        Document newVersion = Document.builder()
            .originalFileName(file.getOriginalFilename())
            .storedFileName(storedName)
            .filePath(filePath)
            .sha256Hash(hash)
            .blockchainTxId(txId)
            .fileSize(file.getSize())
            .contentType(file.getContentType())
            .status(Document.DocumentStatus.PENDING)
            .uploadedBy(user)
            .description(description)
            .category(original.getCategory())
            .expiryDate(original.getExpiryDate())
            .versionNumber(nextVersion)
            .parentDocumentId(rootId)
            .build();

        Document saved = documentRepository.save(newVersion);
        auditService.log("DOCUMENT_VERSIONED", userEmail,
            "v" + nextVersion + " of: " + file.getOriginalFilename());
        return DocumentDto.toResponse(saved);
    }

    // ── Batch upload ───────────────────────────────────────────────

    public DocumentDto.BatchUploadResult batchUpload(MultipartFile[] files,
                                                     String userEmail,
                                                     String categoryStr) {
        List<DocumentDto.DocumentResponse> results = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                DocumentDto.DocumentResponse r =
                    uploadDocument(file, userEmail, null, categoryStr, null);
                results.add(r);
            } catch (Exception e) {
                errors.add(file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        return new DocumentDto.BatchUploadResult(
            files.length, results.size(), errors.size(), results, errors
        );
    }

    // ── Get version history ────────────────────────────────────────

    public List<DocumentDto.DocumentResponse> getVersionHistory(Long documentId) {
        Document doc = documentRepository.findByIdAndDeletedFalse(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        Long rootId = doc.getParentDocumentId() != null
            ? doc.getParentDocumentId() : doc.getId();

        return documentRepository.findAllVersions(rootId)
            .stream().map(DocumentDto::toResponse).collect(Collectors.toList());
    }

    // ── Get certificate data ───────────────────────────────────────

    public DocumentDto.CertificateData getCertificateData(Long documentId) {
        Document doc = documentRepository.findByIdAndDeletedFalse(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        DocumentDto.CertificateData cert = new DocumentDto.CertificateData();
        cert.setDocumentId(doc.getId());
        cert.setDocumentName(doc.getOriginalFileName());
        cert.setUploadedBy(doc.getUploadedBy().getFullName());
        cert.setCategory(doc.getCategory() != null ? doc.getCategory().name() : "OTHER");
        cert.setStatus(doc.getStatus().name());
        cert.setUploadedAt(doc.getUploadedAt());
        cert.setLastVerifiedAt(doc.getLastVerifiedAt());
        cert.setSha256Hash(doc.getSha256Hash());
        cert.setBlockchainTxId(doc.getBlockchainTxId());
        cert.setVerificationCount(doc.getVerificationCount());
        cert.setChainValid(blockchainManager.verifyDocument(doc.getStoredFileName(), doc.getSha256Hash()));
        cert.setExpiryDate(doc.getExpiryDate());
        return cert;
    }

    // ── Standard CRUD ──────────────────────────────────────────────

    public List<DocumentDto.DocumentResponse> getMyDocuments(String userEmail) {
        User user = findUser(userEmail);
        return documentRepository.findByUploadedByAndDeletedFalse(user)
            .stream().map(DocumentDto::toResponse).collect(Collectors.toList());
    }

    public List<DocumentDto.DocumentResponse> getAllDocuments() {
        return documentRepository.findByDeletedFalse()
            .stream().map(DocumentDto::toResponse).collect(Collectors.toList());
    }

    public DocumentDto.DocumentResponse getDocumentById(Long id) {
        return DocumentDto.toResponse(
            documentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found")));
    }

    public void softDeleteDocument(Long id, String userEmail) {
        Document doc = documentRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        doc.setDeleted(true);
        documentRepository.save(doc);
        auditService.log("DOCUMENT_DELETED", userEmail, "Deleted: " + doc.getOriginalFileName());
    }

    public Document getDocumentEntityById(Long id) {
        return documentRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    // ── Expiry scheduler ───────────────────────────────────────────

    public void markExpiredDocuments() {
        List<Document> expired = documentRepository.findExpiredDocuments(LocalDate.now());
        expired.forEach(d -> d.setStatus(Document.DocumentStatus.EXPIRED));
        documentRepository.saveAll(expired);
        if (!expired.isEmpty()) {
            auditService.log("SYSTEM", "scheduler", "Marked " + expired.size() + " document(s) as expired");
        }
    }

    // ── Private helpers ────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("No file provided");
        if (file.getSize() > MAX_SIZE) throw new BadRequestException("File exceeds 10 MB limit");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new BadRequestException("Unsupported file type: " + file.getContentType());
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private byte[] readBytes(MultipartFile file) {
        try { return file.getBytes(); }
        catch (IOException e) { throw new BadRequestException("Failed to read file"); }
    }

    private String saveFile(byte[] bytes, String storedName) {
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            Path dest = dir.resolve(storedName);
            Files.write(dest, bytes, StandardOpenOption.CREATE_NEW);
            return dest.toAbsolutePath().toString();
        } catch (IOException e) {
            throw new BadRequestException("Failed to save file: " + e.getMessage());
        }
    }

    private Document.DocumentCategory parseCategory(String s) {
        if (s == null || s.isBlank()) return Document.DocumentCategory.OTHER;
        try { return Document.DocumentCategory.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) { return Document.DocumentCategory.OTHER; }
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); }
        catch (Exception e) { return null; }
    }
}
