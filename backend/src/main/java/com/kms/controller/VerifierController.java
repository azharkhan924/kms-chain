package com.kms.controller;

import com.kms.dto.ApiResponse;
import com.kms.dto.DocumentDto;
import com.kms.service.DocumentService;
import com.kms.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/verifier")
@Tag(name = "Verification", description = "Document verification using blockchain")
@SecurityRequirement(name = "BearerAuth")
public class VerifierController {

    private final VerificationService verificationService;
    private final DocumentService documentService;

    public VerifierController(VerificationService verificationService,
                               DocumentService documentService) {
        this.verificationService = verificationService;
        this.documentService     = documentService;
    }

    @PostMapping(value = "/verify/{documentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Verify a document by comparing its SHA-256 hash with the blockchain record")
    public ResponseEntity<ApiResponse<DocumentDto.VerificationResponse>> verify(
            @PathVariable Long documentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "remarks", required = false) String remarks,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        return ResponseEntity.ok(ApiResponse.success("Verification complete",
            verificationService.verifyDocument(documentId, file, userDetails.getUsername(), remarks)));
    }

    @GetMapping("/all-documents")
    @Operation(summary = "Get all documents available for verification")
    public ResponseEntity<ApiResponse<List<DocumentDto.DocumentResponse>>> getAllDocuments() {
        return ResponseEntity.ok(ApiResponse.success(documentService.getAllDocuments()));
    }

    @GetMapping("/my-logs")
    @Operation(summary = "Get this verifier's verification history")
    public ResponseEntity<ApiResponse<List<DocumentDto.VerificationResponse>>> myLogs(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
            verificationService.getVerificationHistory(userDetails.getUsername())));
    }
}
