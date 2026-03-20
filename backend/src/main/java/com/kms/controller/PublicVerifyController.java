package com.kms.controller;

import com.kms.blockchain.BlockchainManager;
import com.kms.dto.ApiResponse;
import com.kms.dto.DocumentDto;
import com.kms.model.Document;
import com.kms.repository.DocumentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public Verification", description = "Public document verification — no authentication required")
public class PublicVerifyController {

    private final DocumentRepository documentRepository;
    private final BlockchainManager blockchainManager;

    public PublicVerifyController(DocumentRepository documentRepository,
                                   BlockchainManager blockchainManager) {
        this.documentRepository = documentRepository;
        this.blockchainManager   = blockchainManager;
    }

    @GetMapping("/verify/hash")
    @Operation(summary = "Look up a document by SHA-256 hash")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyByHash(
            @RequestParam String hash) {

        var docOpt = documentRepository.findByHash(hash);

        if (docOpt.isEmpty()) {
            Map<String, Object> m = new HashMap<>();
            m.put("found", false);
            return ResponseEntity.ok(ApiResponse.success(m));
        }

        Document doc = docOpt.get();
        boolean chainMatch = blockchainManager.verifyDocument(
            doc.getStoredFileName(), doc.getSha256Hash());

        Map<String, Object> result = new HashMap<>();
        result.put("found",            true);
        result.put("verified",         chainMatch);
        result.put("originalFileName", doc.getOriginalFileName());
        result.put("uploadedBy",       doc.getUploadedBy().getFullName());
        result.put("uploadedAt",       doc.getUploadedAt());
        result.put("sha256Hash",       doc.getSha256Hash());
        result.put("status",           doc.getStatus().name());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping(value = "/verify/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Verify a file by computing its hash and checking blockchain")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyByFile(
            @RequestParam("file") MultipartFile file) throws IOException {

        String computedHash = BlockchainManager.generateSHA256(file.getBytes());

        var docOpt = documentRepository.findByHash(computedHash);

        if (docOpt.isEmpty()) {
            Map<String, Object> m = new HashMap<>();
            m.put("found", false);
            m.put("computedHash", computedHash);
            return ResponseEntity.ok(ApiResponse.success(m));
        }

        Document doc = docOpt.get();
        boolean chainMatch = blockchainManager.verifyDocument(
            doc.getStoredFileName(), doc.getSha256Hash());

        Map<String, Object> result = new HashMap<>();
        result.put("found",            true);
        result.put("verified",         chainMatch);
        result.put("computedHash",     computedHash);
        result.put("originalFileName", doc.getOriginalFileName());
        result.put("uploadedBy",       doc.getUploadedBy().getFullName());
        result.put("uploadedAt",       doc.getUploadedAt());
        result.put("sha256Hash",       doc.getSha256Hash());
        result.put("status",           doc.getStatus().name());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("KMS Chain is running"));
    }
}
