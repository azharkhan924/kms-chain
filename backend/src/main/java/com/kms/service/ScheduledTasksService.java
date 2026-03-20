package com.kms.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Scheduled tasks that run automatically in the background.
 */
@Service
public class ScheduledTasksService {

    private final DocumentService documentService;

    public ScheduledTasksService(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Run every day at midnight: mark documents whose expiry date has passed.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void checkDocumentExpiry() {
        documentService.markExpiredDocuments();
    }

    /**
     * Run every hour during business hours as a fallback.
     */
    @Scheduled(fixedRate = 3_600_000)
    public void hourlyExpiryCheck() {
        documentService.markExpiredDocuments();
    }
}
