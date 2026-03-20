package com.kms.controller;

import com.kms.dto.ApiResponse;
import com.kms.service.TrustScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trust")
@Tag(name = "Trust Score", description = "User credibility and trust scoring")
@SecurityRequirement(name = "BearerAuth")
public class TrustScoreController {

    private final TrustScoreService trustScoreService;

    public TrustScoreController(TrustScoreService trustScoreService) {
        this.trustScoreService = trustScoreService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get your own trust score and breakdown")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myScore(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> score = trustScoreService.computeScore(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(score));
    }

    @GetMapping("/all")
    @Operation(summary = "Get trust scores for all users (ADMIN only)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> allScores() {
        List<Map<String, Object>> scores = trustScoreService.computeAllScores();
        return ResponseEntity.ok(ApiResponse.success(scores));
    }

    @GetMapping("/user/{email}")
    @Operation(summary = "Get trust score for a specific user by email (ADMIN only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> userScore(@PathVariable String email) {
        Map<String, Object> score = trustScoreService.computeScore(email);
        return ResponseEntity.ok(ApiResponse.success(score));
    }
}
