package com.kms.service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import com.kms.blockchain.BlockchainManager;
import com.kms.dto.DocumentDto;
import com.kms.exception.ResourceNotFoundException;
import com.kms.model.*;
import com.kms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VerificationService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final VerificationLogRepository verificationLogRepository;
    private final BlockchainManager blockchainManager;
    private final AuditService auditService;

    public VerificationService(DocumentRepository documentRepository,
                                UserRepository userRepository,
                                VerificationLogRepository verificationLogRepository,
                                BlockchainManager blockchainManager,
                                AuditService auditService) {
        this.documentRepository        = documentRepository;
        this.userRepository            = userRepository;
        this.verificationLogRepository = verificationLogRepository;
        this.blockchainManager         = blockchainManager;
        this.auditService              = auditService;
    }

    public DocumentDto.VerificationResponse verifyDocument(Long documentId,
                                                            MultipartFile file,
                                                            String verifierEmail,
                                                            String remarks) throws IOException {
        Document document = documentRepository.findByIdAndDeletedFalse(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        User verifier = userRepository.findByEmail(verifierEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Verifier not found"));

        String computedHash  = BlockchainManager.generateSHA256(file.getBytes());
        String storedHash    = document.getSha256Hash();
        boolean hashMatch    = computedHash.equals(storedHash);
        boolean chainMatch   = blockchainManager.verifyDocument(document.getStoredFileName(), storedHash);
        boolean fullyVerified = hashMatch && chainMatch;

        document.setStatus(fullyVerified
            ? Document.DocumentStatus.VERIFIED
            : Document.DocumentStatus.TAMPERED);
        document.setLastVerifiedAt(java.time.LocalDateTime.now());
        if (fullyVerified) { document.incrementVerificationCount(); }
        else               { document.incrementTamperAttempts();    }
        documentRepository.save(document);

        String remark = remarks != null ? remarks
            : (fullyVerified ? "Document is authentic" : "Document may be tampered");

        VerificationLog log = VerificationLog.builder()
            .document(document).verifiedBy(verifier)
            .computedHash(computedHash).storedHash(storedHash)
            .verified(fullyVerified).remarks(remark).build();
        verificationLogRepository.save(log);

        auditService.log("VERIFY", verifierEmail,
            "Document " + documentId + " → " + (fullyVerified ? "VERIFIED" : "TAMPERED"));

        return DocumentDto.VerificationResponse.builder()
            .documentId(documentId)
            .originalFileName(document.getOriginalFileName())
            .computedHash(computedHash).storedHash(storedHash)
            .verified(fullyVerified)
            .status(fullyVerified ? "VERIFIED" : "TAMPERED")
            .blockchainTxId(document.getBlockchainTxId())
            .verifiedBy(verifier.getFullName())
            .remarks(log.getRemarks())
            .verifiedAt(log.getVerifiedAt())
            .build();
    }

    public List<DocumentDto.VerificationResponse> getVerificationHistory(String verifierEmail) {
        User verifier = userRepository.findByEmail(verifierEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Verifier not found"));
        return verificationLogRepository.findByVerifiedByOrderByVerifiedAtDesc(verifier)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DocumentDto.VerificationResponse> getAllVerificationLogs() {
        return verificationLogRepository.findAllByOrderByVerifiedAtDesc()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private DocumentDto.VerificationResponse toResponse(VerificationLog vl) {
        return DocumentDto.VerificationResponse.builder()
            .documentId(vl.getDocument().getId())
            .originalFileName(vl.getDocument().getOriginalFileName())
            .computedHash(vl.getComputedHash()).storedHash(vl.getStoredHash())
            .verified(vl.isVerified())
            .status(vl.isVerified() ? "VERIFIED" : "TAMPERED")
            .blockchainTxId(vl.getDocument().getBlockchainTxId())
            .verifiedBy(vl.getVerifiedBy().getFullName())
            .remarks(vl.getRemarks())
            .verifiedAt(vl.getVerifiedAt())
            .build();
    }
}
