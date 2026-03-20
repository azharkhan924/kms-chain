package com.kms.service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.stream.Collectors;
import com.kms.model.Document;
import com.kms.model.User;
import com.kms.model.VerificationLog;
import com.kms.repository.DocumentRepository;
import com.kms.repository.UserRepository;
import com.kms.repository.VerificationLogRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Computes a "Trust Score" (0–100) for every user.
 *
 * Scoring formula (USER perspective):
 *   +5  per document uploaded                         (max +30)
 *   +15 per document that gets VERIFIED               (max +45)
 *   -20 per document marked TAMPERED                  (max -40)
 *   -10 per document marked EXPIRED without renewal
 *   +5  for account age > 30 days
 *
 * Scoring formula (VERIFIER perspective):
 *   +5  per verification performed                    (max +25)
 *   +10 per correct verification (honest result)
 *   -15 if tamper rate on own uploads > 30%
 *
 * Score is clamped to [0, 100].
 */
@Service
public class TrustScoreService {

    private final UserRepository          userRepository;
    private final DocumentRepository      documentRepository;
    private final VerificationLogRepository verificationLogRepository;

    public TrustScoreService(UserRepository userRepository,
                             DocumentRepository documentRepository,
                             VerificationLogRepository verificationLogRepository) {
        this.userRepository           = userRepository;
        this.documentRepository       = documentRepository;
        this.verificationLogRepository = verificationLogRepository;
    }

    /** Compute trust score for a single user by email */
    public Map<String, Object> computeScore(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return buildScoreReport(user);
    }

    /** Compute trust scores for ALL users (used in admin panel) */
    public List<Map<String, Object>> computeAllScores() {
        return userRepository.findAll().stream()
            .map(this::buildScoreReport)
            .collect(java.util.stream.Collectors.toList());
    }

    private Map<String, Object> buildScoreReport(User user) {
        List<Document> myDocs      = documentRepository.findByUploadedByAndDeletedFalse(user);
        List<VerificationLog> myVerifications = verificationLogRepository.findByVerifiedByOrderByVerifiedAtDesc(user);

        int score        = 50;   // everyone starts at 50 (neutral)
        int uploadBonus  = 0;
        int verifiedBonus= 0;
        int tamperPenalty= 0;
        int expiredPenalty=0;
        int verifyBonus  = 0;
        int agencyBonus  = 0;

        // ── Document-based scoring ─────────────────────────────
        int uploads  = myDocs.size();
        int verified = (int) myDocs.stream().filter(d -> d.getStatus() == Document.DocumentStatus.VERIFIED).count();
        int tampered = (int) myDocs.stream().filter(d -> d.getStatus() == Document.DocumentStatus.TAMPERED).count();
        int expired  = (int) myDocs.stream().filter(d -> d.getStatus() == Document.DocumentStatus.EXPIRED).count();

        uploadBonus   = Math.min(uploads * 3, 15);
        verifiedBonus = Math.min(verified * 10, 30);
        tamperPenalty = Math.min(tampered * 15, 35);
        expiredPenalty= Math.min(expired * 3,  10);

        // ── Verification history scoring ───────────────────────
        int verifyCount   = myVerifications.size();
        int correctVerify = (int) myVerifications.stream().filter(VerificationLog::isVerified).count();
        verifyBonus = Math.min(verifyCount * 2, 15);

        // Penalty if most of user's own documents are tampered (suspicious pattern)
        if (uploads > 2 && (double) tampered / uploads > 0.3) {
            tamperPenalty += 10;
        }

        // Account age bonus
        if (user.getCreatedAt() != null) {
            long daysSince = java.time.temporal.ChronoUnit.DAYS.between(
                user.getCreatedAt(), java.time.LocalDateTime.now());
            if (daysSince > 30)  agencyBonus += 3;
            if (daysSince > 90)  agencyBonus += 2;
            if (daysSince > 180) agencyBonus += 3;
        }

        score += uploadBonus + verifiedBonus + verifyBonus + agencyBonus;
        score -= tamperPenalty + expiredPenalty;
        score = Math.max(0, Math.min(100, score));

        // Grade label
        String grade;
        String description;
        if      (score >= 85) { grade = "Excellent";  description = "Highly trusted — clean document history"; }
        else if (score >= 70) { grade = "Good";        description = "Reliable user with minor concerns"; }
        else if (score >= 50) { grade = "Fair";        description = "Average trust — some irregularities"; }
        else if (score >= 30) { grade = "Low";         description = "Frequent tampered documents detected"; }
        else                  { grade = "Critical";    description = "Multiple tamper incidents — manual review recommended"; }

        Map<String, Object> report = new HashMap<>();
        report.put("userId",       user.getId());
        report.put("fullName",     user.getFullName());
        report.put("email",        user.getEmail());
        report.put("role",         user.getRole().name());
        report.put("trustScore",   score);
        report.put("grade",        grade);
        report.put("description",  description);
        report.put("uploads",      uploads);
        report.put("verified",     verified);
        report.put("tampered",     tampered);
        report.put("expired",      expired);
        report.put("verifications",verifyCount);
        report.put("breakdown", Map.of(
            "base",           50,
            "uploadBonus",    uploadBonus,
            "verifiedBonus",  verifiedBonus,
            "verifyBonus",    verifyBonus,
            "agencyBonus",    agencyBonus,
            "tamperPenalty",  -tamperPenalty,
            "expiredPenalty", -expiredPenalty
        ));
        return report;
    }
}
