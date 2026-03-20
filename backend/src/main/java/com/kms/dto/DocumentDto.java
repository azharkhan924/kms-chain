package com.kms.dto;

import com.kms.model.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class DocumentDto {

    public static class DocumentResponse {
        private Long   id;
        private String originalFileName;
        private String fileSize;
        private String contentType;
        private String status;
        private String category;
        private String uploadedBy;
        private String description;
        private LocalDateTime uploadedAt;
        private LocalDateTime lastVerifiedAt;
        private LocalDate expiryDate;
        private boolean isExpired;
        private int versionNumber;
        private Long parentDocumentId;
        private int verificationCount;
        private int tamperAttempts;
        // Hashes exposed only in detail view (frontend hides them by default)
        private String sha256Hash;
        private String blockchainTxId;

        // Getters
        public Long getId()               { return id; }
        public String getOriginalFileName(){ return originalFileName; }
        public String getFileSize()       { return fileSize; }
        public String getContentType()    { return contentType; }
        public String getStatus()         { return status; }
        public String getCategory()       { return category; }
        public String getUploadedBy()     { return uploadedBy; }
        public String getDescription()    { return description; }
        public LocalDateTime getUploadedAt()     { return uploadedAt; }
        public LocalDateTime getLastVerifiedAt() { return lastVerifiedAt; }
        public LocalDate getExpiryDate()  { return expiryDate; }
        public boolean isExpired()        { return isExpired; }
        public int getVersionNumber()     { return versionNumber; }
        public Long getParentDocumentId() { return parentDocumentId; }
        public int getVerificationCount() { return verificationCount; }
        public int getTamperAttempts()    { return tamperAttempts; }
        public String getSha256Hash()     { return sha256Hash; }
        public String getBlockchainTxId() { return blockchainTxId; }
    }

    public static DocumentResponse toResponse(Document d) {
        DocumentResponse r = new DocumentResponse();
        r.id               = d.getId();
        r.originalFileName = d.getOriginalFileName();
        r.fileSize         = formatSize(d.getFileSize());
        r.contentType      = d.getContentType();
        r.status           = d.getStatus().name();
        r.category         = d.getCategory() != null ? d.getCategory().name() : "OTHER";
        r.uploadedBy       = d.getUploadedBy().getFullName();
        r.description      = d.getDescription();
        r.uploadedAt       = d.getUploadedAt();
        r.lastVerifiedAt   = d.getLastVerifiedAt();
        r.expiryDate       = d.getExpiryDate();
        r.isExpired        = d.isExpiredByDate();
        r.versionNumber    = d.getVersionNumber();
        r.parentDocumentId = d.getParentDocumentId();
        r.verificationCount = d.getVerificationCount();
        r.tamperAttempts   = d.getTamperAttempts();
        r.sha256Hash       = d.getSha256Hash();
        r.blockchainTxId   = d.getBlockchainTxId();
        return r;
    }

    private static String formatSize(long bytes) {
        if (bytes < 1024)           return bytes + " B";
        if (bytes < 1048576)        return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1073741824)     return String.format("%.2f MB", bytes / 1048576.0);
        return String.format("%.2f GB", bytes / 1073741824.0);
    }

    // ── Verification Response ──────────────────────────────────

    public static class VerificationResponse {
        private Long   documentId;
        private String originalFileName;
        private boolean verified;
        private String  computedHash;
        private String  storedHash;
        private String  remarks;
        private String  status;
        private String  blockchainTxId;
        private String  verifiedBy;
        private java.time.LocalDateTime verifiedAt;

        // No-arg constructor for builder-style setters
        public VerificationResponse() {}

        // Getters
        public Long   getDocumentId()       { return documentId; }
        public String getOriginalFileName() { return originalFileName; }
        public boolean isVerified()         { return verified; }
        public String getComputedHash()     { return computedHash; }
        public String getStoredHash()       { return storedHash; }
        public String getRemarks()          { return remarks; }
        public String getStatus()           { return status; }
        public String getBlockchainTxId()   { return blockchainTxId; }
        public String getVerifiedBy()       { return verifiedBy; }
        public java.time.LocalDateTime getVerifiedAt() { return verifiedAt; }

        // Setters
        public VerificationResponse documentId(Long v)        { this.documentId        = v; return this; }
        public VerificationResponse originalFileName(String v){ this.originalFileName   = v; return this; }
        public VerificationResponse verified(boolean v)       { this.verified           = v; return this; }
        public VerificationResponse computedHash(String v)    { this.computedHash       = v; return this; }
        public VerificationResponse storedHash(String v)      { this.storedHash         = v; return this; }
        public VerificationResponse remarks(String v)         { this.remarks            = v; return this; }
        public VerificationResponse status(String v)          { this.status             = v; return this; }
        public VerificationResponse blockchainTxId(String v)  { this.blockchainTxId     = v; return this; }
        public VerificationResponse verifiedBy(String v)      { this.verifiedBy         = v; return this; }
        public VerificationResponse verifiedAt(java.time.LocalDateTime v) { this.verifiedAt = v; return this; }

        // Static factory — replaces .builder()
        public static VerificationResponse builder() { return new VerificationResponse(); }
        public VerificationResponse build()           { return this; }
    }

    // ── Admin Stats Response ───────────────────────────────────

    public static class AdminStatsResponse {
        private long totalDocuments;
        private long verifiedDocuments;
        private long tamperedDocuments;
        private long expiredDocuments;
        private long pendingDocuments;
        private long totalUsers;
        private long totalVerifiers;
        private long totalAdmins;
        private long blockchainSize;
        private boolean chainValid;
        private List<CategoryStat> categoryStats;

        public long getTotalDocuments()   { return totalDocuments; }
        public long getVerifiedDocuments(){ return verifiedDocuments; }
        public long getTamperedDocuments(){ return tamperedDocuments; }
        public long getExpiredDocuments() { return expiredDocuments; }
        public long getPendingDocuments() { return pendingDocuments; }
        public long getTotalUsers()       { return totalUsers; }
        public long getTotalVerifiers()   { return totalVerifiers; }
        public long getTotalAdmins()      { return totalAdmins; }
        public long getBlockchainSize()   { return blockchainSize; }
        public boolean isChainValid()     { return chainValid; }
        public List<CategoryStat> getCategoryStats() { return categoryStats; }

        public void setTotalDocuments(long v)    { this.totalDocuments   = v; }
        public void setVerifiedDocuments(long v) { this.verifiedDocuments = v; }
        public void setTamperedDocuments(long v) { this.tamperedDocuments = v; }
        public void setExpiredDocuments(long v)  { this.expiredDocuments  = v; }
        public void setPendingDocuments(long v)  { this.pendingDocuments  = v; }
        public void setTotalUsers(long v)        { this.totalUsers    = v; }
        public void setTotalVerifiers(long v)    { this.totalVerifiers = v; }
        public void setTotalAdmins(long v)       { this.totalAdmins   = v; }
        public void setBlockchainSize(long v)    { this.blockchainSize = v; }
        public void setChainValid(boolean v)     { this.chainValid     = v; }
        public void setCategoryStats(List<CategoryStat> v) { this.categoryStats = v; }
    }

    public static class CategoryStat {
        private String category;
        private long count;
        public CategoryStat(String category, long count) { this.category = category; this.count = count; }
        public String getCategory() { return category; }
        public long getCount()      { return count; }
    }

    // ── Batch Upload Result ─────────────────────────────────────

    public static class BatchUploadResult {
        private int total;
        private int succeeded;
        private int failed;
        private List<DocumentResponse> documents;
        private List<String> errors;

        public BatchUploadResult(int total, int succeeded, int failed,
                                 List<DocumentResponse> docs, List<String> errors) {
            this.total     = total;
            this.succeeded = succeeded;
            this.failed    = failed;
            this.documents = docs;
            this.errors    = errors;
        }

        public int getTotal()       { return total; }
        public int getSucceeded()   { return succeeded; }
        public int getFailed()      { return failed; }
        public List<DocumentResponse> getDocuments() { return documents; }
        public List<String> getErrors() { return errors; }
    }

    // ── Certificate Data ────────────────────────────────────────

    public static class CertificateData {
        private Long   documentId;
        private String documentName;
        private String uploadedBy;
        private String category;
        private String status;
        private LocalDateTime uploadedAt;
        private LocalDateTime lastVerifiedAt;
        private String sha256Hash;
        private String blockchainTxId;
        private int verificationCount;
        private boolean chainValid;
        private LocalDate expiryDate;

        public Long getDocumentId()        { return documentId; }
        public String getDocumentName()    { return documentName; }
        public String getUploadedBy()      { return uploadedBy; }
        public String getCategory()        { return category; }
        public String getStatus()          { return status; }
        public LocalDateTime getUploadedAt()     { return uploadedAt; }
        public LocalDateTime getLastVerifiedAt() { return lastVerifiedAt; }
        public String getSha256Hash()      { return sha256Hash; }
        public String getBlockchainTxId()  { return blockchainTxId; }
        public int getVerificationCount()  { return verificationCount; }
        public boolean isChainValid()      { return chainValid; }
        public LocalDate getExpiryDate()   { return expiryDate; }

        public void setDocumentId(Long v)        { this.documentId      = v; }
        public void setDocumentName(String v)    { this.documentName    = v; }
        public void setUploadedBy(String v)      { this.uploadedBy      = v; }
        public void setCategory(String v)        { this.category        = v; }
        public void setStatus(String v)          { this.status          = v; }
        public void setUploadedAt(LocalDateTime v)     { this.uploadedAt     = v; }
        public void setLastVerifiedAt(LocalDateTime v) { this.lastVerifiedAt = v; }
        public void setSha256Hash(String v)      { this.sha256Hash      = v; }
        public void setBlockchainTxId(String v)  { this.blockchainTxId  = v; }
        public void setVerificationCount(int v)  { this.verificationCount = v; }
        public void setChainValid(boolean v)     { this.chainValid      = v; }
        public void setExpiryDate(LocalDate v)   { this.expiryDate      = v; }
    }
}
