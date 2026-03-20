package com.kms.controller;

import com.kms.dto.ApiResponse;
import com.kms.exception.BadRequestException;
import com.kms.exception.ResourceNotFoundException;
import com.kms.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Profile", description = "Profile and password management")
@SecurityRequirement(name = "BearerAuth")
public class UserProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PutMapping("/password")
    @Operation(summary = "Change your own password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody PasswordChangeRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        var user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword()))
            throw new BadRequestException("Current password is incorrect");

        if (req.getNewPassword() == null || req.getNewPassword().length() < 6)
            throw new BadRequestException("New password must be at least 6 characters");

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password updated successfully", null));
    }

    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;
        public String getCurrentPassword() { return currentPassword; }
        public String getNewPassword()     { return newPassword;     }
        public void setCurrentPassword(String v) { this.currentPassword = v; }
        public void setNewPassword(String v)     { this.newPassword     = v; }
    }
}
