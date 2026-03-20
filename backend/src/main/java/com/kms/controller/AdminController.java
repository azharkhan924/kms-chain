package com.kms.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import com.kms.blockchain.BlockchainManager;
import com.kms.dto.*;
import com.kms.model.AuditLog;
import com.kms.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin panel — users, documents, audit logs, blockchain")
@SecurityRequirement(name = "BearerAuth")
public class AdminController {

    private final UserService userService;
    private final DocumentService documentService;
    private final VerificationService verificationService;
    private final AuditService auditService;
    private final BlockchainManager blockchainManager;

    public AdminController(UserService userService,
                           DocumentService documentService,
                           VerificationService verificationService,
                           AuditService auditService,
                           BlockchainManager blockchainManager) {
        this.userService         = userService;
        this.documentService     = documentService;
        this.verificationService = verificationService;
        this.auditService        = auditService;
        this.blockchainManager   = blockchainManager;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get system-wide statistics")
    public ResponseEntity<ApiResponse<DocumentDto.AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAdminStats()));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<UserDto.UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Change a user's role")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> updateRole(
            @PathVariable Long id,
            @RequestBody UserDto.UpdateRoleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Role updated",
            userService.updateUserRole(id, request.getRole(), userDetails.getUsername())));
    }

    @PutMapping("/users/{id}/toggle-status")
    @Operation(summary = "Activate or deactivate a user")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> toggleStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("User status updated",
            userService.toggleUserStatus(id, userDetails.getUsername())));
    }

    @GetMapping("/documents")
    @Operation(summary = "Get all documents")
    public ResponseEntity<ApiResponse<List<DocumentDto.DocumentResponse>>> getAllDocuments() {
        return ResponseEntity.ok(ApiResponse.success(documentService.getAllDocuments()));
    }

    @GetMapping("/verification-logs")
    @Operation(summary = "Get all verification logs")
    public ResponseEntity<ApiResponse<List<DocumentDto.VerificationResponse>>> getAllVerifications() {
        return ResponseEntity.ok(ApiResponse.success(verificationService.getAllVerificationLogs()));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get system audit logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditService.getRecentLogs(200)));
    }

    @GetMapping("/blockchain/status")
    @Operation(summary = "Get full blockchain explorer data")
    public ResponseEntity<ApiResponse<Object>> blockchainStatus() {
        Map<String, Object> data = new HashMap<>();
        data.put("chainSize", blockchainManager.getChainSize());
        data.put("isValid",   blockchainManager.isChainValid());
        data.put("blocks", blockchainManager.getFullChain().stream().map(b -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("index",        b.getIndex());
            m.put("hash",         b.getHash());
            m.put("previousHash", b.getPreviousHash());
            m.put("documentId",   b.getDocumentId());
            m.put("documentHash", b.getDocumentHash());
            m.put("timestamp",    b.getTimestamp());
            return m;
        }).toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
