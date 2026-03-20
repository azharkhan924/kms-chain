package com.kms.controller;

import com.kms.dto.ApiResponse;
import com.kms.dto.DocumentDto;
import com.kms.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents", description = "Document upload, management, and versioning")
@SecurityRequirement(name = "BearerAuth")
public class DocumentController {

    private final DocumentService documentService;
    public DocumentController(DocumentService documentService) { this.documentService = documentService; }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document and register on blockchain")
    public ResponseEntity<ApiResponse<DocumentDto.DocumentResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "expiryDate", required = false) String expiryDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        DocumentDto.DocumentResponse r = documentService.uploadDocument(
            file, userDetails.getUsername(), description, category, expiryDate);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded and registered on blockchain", r));
    }

    @PostMapping(value = "/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Batch upload multiple documents at once")
    public ResponseEntity<ApiResponse<DocumentDto.BatchUploadResult>> batchUpload(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "category", required = false) String category,
            @AuthenticationPrincipal UserDetails userDetails) {
        DocumentDto.BatchUploadResult r = documentService.batchUpload(
            files, userDetails.getUsername(), category);
        return ResponseEntity.ok(ApiResponse.success("Batch upload complete", r));
    }

    @PostMapping(value = "/{id}/new-version", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a new version of an existing document")
    public ResponseEntity<ApiResponse<DocumentDto.DocumentResponse>> uploadNewVersion(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserDetails userDetails) {
        DocumentDto.DocumentResponse r = documentService.uploadNewVersion(
            id, file, userDetails.getUsername(), description);
        return ResponseEntity.ok(ApiResponse.success("New version uploaded", r));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all documents uploaded by the current user")
    public ResponseEntity<ApiResponse<List<DocumentDto.DocumentResponse>>> getMyDocuments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
            documentService.getMyDocuments(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a document by ID")
    public ResponseEntity<ApiResponse<DocumentDto.DocumentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getDocumentById(id)));
    }

    @GetMapping("/{id}/versions")
    @Operation(summary = "Get full version history of a document")
    public ResponseEntity<ApiResponse<List<DocumentDto.DocumentResponse>>> getVersions(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getVersionHistory(id)));
    }

    @GetMapping("/{id}/certificate")
    @Operation(summary = "Get verification certificate data for a document")
    public ResponseEntity<ApiResponse<DocumentDto.CertificateData>> getCertificate(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getCertificateData(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a document")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        documentService.softDeleteDocument(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
    }
}
