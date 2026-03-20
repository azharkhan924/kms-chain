package com.kms.service;

import com.kms.model.AuditLog;
import com.kms.repository.AuditLogRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository repo;

    public AuditService(AuditLogRepository repo) { this.repo = repo; }

    public void log(String action, String performedBy, String details) {
        repo.save(AuditLog.builder()
            .action(action).performedBy(performedBy).details(details).build());
    }

    public List<AuditLog> getRecentLogs(int limit) {
        return repo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }

    public List<AuditLog> getAllLogs() {
        return repo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 1000));
    }

    public List<AuditLog> getLogsByUser(String email) {
        return repo.findByPerformedByOrderByCreatedAtDesc(email);
    }
}
