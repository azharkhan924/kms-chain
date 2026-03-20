package com.kms.repository;

import com.kms.model.VerificationLog;
import com.kms.model.User;
import com.kms.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VerificationLogRepository extends JpaRepository<VerificationLog, Long> {
    List<VerificationLog> findByVerifiedByOrderByVerifiedAtDesc(User user);
    List<VerificationLog> findByDocumentOrderByVerifiedAtDesc(Document document);
    List<VerificationLog> findAllByOrderByVerifiedAtDesc();
}
