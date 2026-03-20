package com.kms.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@EntityListeners(AuditingEntityListener.class)
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String storedFileName;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false, length = 64)
    private String sha256Hash;

    @Column(nullable = false)
    private String blockchainTxId;

    @Column(nullable = false)
    private long fileSize;

    @Column(nullable = false)
    private String contentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean deleted = false;

    // ── NEW FIELDS ─────────────────────────────────────────────

    /** Document category for organisation */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DocumentCategory category = DocumentCategory.OTHER;

    /** Optional expiry date — null means no expiry */
    @Column
    private LocalDate expiryDate;

    /** Version number — starts at 1 for every original document */
    @Column(nullable = false)
    private int versionNumber = 1;

    /** Points to the original (v1) document if this is a newer version */
    @Column
    private Long parentDocumentId;

    /** Number of times this document has been successfully verified */
    @Column(nullable = false)
    private int verificationCount = 0;

    /** Number of times this document failed verification (tampered attempts) */
    @Column(nullable = false)
    private int tamperAttempts = 0;

    // ── TIMESTAMPS ──────────────────────────────────────────────

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime uploadedAt;

    @Column
    private LocalDateTime lastVerifiedAt;

    // ── ENUMS ───────────────────────────────────────────────────

    public enum DocumentStatus {
        PENDING, VERIFIED, TAMPERED, REJECTED, EXPIRED
    }

    public enum DocumentCategory {
        LEGAL, ACADEMIC, FINANCIAL, MEDICAL, CONTRACT, CERTIFICATE, IDENTITY, OTHER
    }

    // ── CONSTRUCTOR + BUILDER ────────────────────────────────────

    protected Document() {}

    private Document(Builder b) {
        this.originalFileName = b.originalFileName;
        this.storedFileName   = b.storedFileName;
        this.filePath         = b.filePath;
        this.sha256Hash       = b.sha256Hash;
        this.blockchainTxId   = b.blockchainTxId;
        this.fileSize         = b.fileSize;
        this.contentType      = b.contentType;
        this.status           = b.status;
        this.uploadedBy       = b.uploadedBy;
        this.description      = b.description;
        this.category         = b.category != null ? b.category : DocumentCategory.OTHER;
        this.expiryDate       = b.expiryDate;
        this.versionNumber    = b.versionNumber > 0 ? b.versionNumber : 1;
        this.parentDocumentId = b.parentDocumentId;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String originalFileName, storedFileName, filePath, sha256Hash, blockchainTxId, contentType, description;
        private long fileSize;
        private DocumentStatus status;
        private User uploadedBy;
        private DocumentCategory category;
        private LocalDate expiryDate;
        private int versionNumber = 1;
        private Long parentDocumentId;

        public Builder originalFileName(String v)  { this.originalFileName = v; return this; }
        public Builder storedFileName(String v)    { this.storedFileName   = v; return this; }
        public Builder filePath(String v)          { this.filePath         = v; return this; }
        public Builder sha256Hash(String v)        { this.sha256Hash       = v; return this; }
        public Builder blockchainTxId(String v)    { this.blockchainTxId   = v; return this; }
        public Builder fileSize(long v)            { this.fileSize         = v; return this; }
        public Builder contentType(String v)       { this.contentType      = v; return this; }
        public Builder status(DocumentStatus v)    { this.status           = v; return this; }
        public Builder uploadedBy(User v)          { this.uploadedBy       = v; return this; }
        public Builder description(String v)       { this.description      = v; return this; }
        public Builder category(DocumentCategory v){ this.category         = v; return this; }
        public Builder expiryDate(LocalDate v)     { this.expiryDate       = v; return this; }
        public Builder versionNumber(int v)        { this.versionNumber    = v; return this; }
        public Builder parentDocumentId(Long v)    { this.parentDocumentId = v; return this; }
        public Document build() { return new Document(this); }
    }

    // ── GETTERS ─────────────────────────────────────────────────

    public Long getId()               { return id; }
    public String getOriginalFileName(){ return originalFileName; }
    public String getStoredFileName() { return storedFileName; }
    public String getFilePath()       { return filePath; }
    public String getSha256Hash()     { return sha256Hash; }
    public String getBlockchainTxId() { return blockchainTxId; }
    public long getFileSize()         { return fileSize; }
    public String getContentType()    { return contentType; }
    public DocumentStatus getStatus() { return status; }
    public User getUploadedBy()       { return uploadedBy; }
    public String getDescription()    { return description; }
    public boolean isDeleted()        { return deleted; }
    public DocumentCategory getCategory()   { return category; }
    public LocalDate getExpiryDate()  { return expiryDate; }
    public int getVersionNumber()     { return versionNumber; }
    public Long getParentDocumentId() { return parentDocumentId; }
    public int getVerificationCount() { return verificationCount; }
    public int getTamperAttempts()    { return tamperAttempts; }
    public LocalDateTime getUploadedAt()    { return uploadedAt; }
    public LocalDateTime getLastVerifiedAt(){ return lastVerifiedAt; }

    // ── SETTERS ─────────────────────────────────────────────────

    public void setStatus(DocumentStatus status)               { this.status = status; }
    public void setDeleted(boolean deleted)                    { this.deleted = deleted; }
    public void setCategory(DocumentCategory category)         { this.category = category; }
    public void setExpiryDate(LocalDate expiryDate)            { this.expiryDate = expiryDate; }
    public void setLastVerifiedAt(LocalDateTime v)             { this.lastVerifiedAt = v; }
    public void incrementVerificationCount()                   { this.verificationCount++; }
    public void incrementTamperAttempts()                      { this.tamperAttempts++; }

    /** Returns true if an expiry date is set and is in the past */
    public boolean isExpiredByDate() {
        return expiryDate != null && LocalDate.now().isAfter(expiryDate);
    }
}
