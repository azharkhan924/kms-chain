package com.kms.service;

import com.kms.dto.DocumentDto;
import com.kms.dto.UserDto;
import com.kms.exception.ResourceNotFoundException;
import com.kms.model.User;
import com.kms.repository.DocumentRepository;
import com.kms.repository.UserRepository;
import com.kms.blockchain.BlockchainManager;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final BlockchainManager blockchainManager;
    private final AuditService auditService;

    public UserService(UserRepository userRepository,
                       DocumentRepository documentRepository,
                       BlockchainManager blockchainManager,
                       AuditService auditService) {
        this.userRepository     = userRepository;
        this.documentRepository = documentRepository;
        this.blockchainManager  = blockchainManager;
        this.auditService       = auditService;
    }

    public List<UserDto.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserDto::toResponse).collect(Collectors.toList());
    }

    public UserDto.UserResponse getUserById(Long id) {
        return userRepository.findById(id)
            .map(UserDto::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public UserDto.UserResponse updateUserRole(Long id, User.Role newRole, String adminEmail) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setRole(newRole);
        userRepository.save(user);
        auditService.log("ROLE_CHANGE", adminEmail,
            "Changed role of " + user.getEmail() + " to " + newRole);
        return UserDto.toResponse(user);
    }

    public UserDto.UserResponse toggleUserStatus(Long id, String adminEmail) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setActive(!user.isActive());
        userRepository.save(user);
        auditService.log("STATUS_CHANGE", adminEmail,
            "Changed status of " + user.getEmail() + " to " + (user.isActive() ? "ACTIVE" : "INACTIVE"));
        return UserDto.toResponse(user);
    }

    public DocumentDto.AdminStatsResponse getAdminStats() {
        List<User> allUsers     = userRepository.findAll();
        long totalVerifiers     = allUsers.stream().filter(u -> u.getRole() == User.Role.VERIFIER).count();
        long totalAdmins        = allUsers.stream().filter(u -> u.getRole() == User.Role.ADMIN).count();
        long totalDocuments     = documentRepository.countActive();
        long verifiedDocuments  = documentRepository.countVerified();
        long tamperedDocuments  = documentRepository.countTampered();
        long expiredDocuments   = documentRepository.countExpired();
        long pendingDocuments   = totalDocuments - verifiedDocuments - tamperedDocuments - expiredDocuments;

        // Category breakdown
        List<DocumentDto.CategoryStat> categoryStats = documentRepository.countByCategory()
            .stream()
            .map(row -> new DocumentDto.CategoryStat(
                row[0] != null ? row[0].toString() : "OTHER",
                ((Number) row[1]).longValue()))
            .collect(java.util.stream.Collectors.toList());

        DocumentDto.AdminStatsResponse r = new DocumentDto.AdminStatsResponse();
        r.setTotalDocuments(totalDocuments);
        r.setVerifiedDocuments(verifiedDocuments);
        r.setTamperedDocuments(tamperedDocuments);
        r.setExpiredDocuments(expiredDocuments);
        r.setPendingDocuments(Math.max(pendingDocuments, 0));
        r.setTotalUsers(allUsers.size());
        r.setTotalVerifiers(totalVerifiers);
        r.setTotalAdmins(totalAdmins);
        r.setBlockchainSize(blockchainManager.getChainSize());
        r.setChainValid(blockchainManager.isChainValid());
        r.setCategoryStats(categoryStats);
        return r;
    }
}
