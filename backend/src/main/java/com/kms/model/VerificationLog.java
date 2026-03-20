package com.kms.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_logs")
@EntityListeners(AuditingEntityListener.class)
public class VerificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by", nullable = false)
    private User verifiedBy;

    @Column(nullable = false, length = 64)
    private String computedHash;

    @Column(nullable = false, length = 64)
    private String storedHash;

    @Column(nullable = false)
    private boolean verified;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime verifiedAt;

    public VerificationLog() {}

    private VerificationLog(Builder b) {
        this.document     = b.document;
        this.verifiedBy   = b.verifiedBy;
        this.computedHash = b.computedHash;
        this.storedHash   = b.storedHash;
        this.verified     = b.verified;
        this.remarks      = b.remarks;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Document document;
        private User verifiedBy;
        private String computedHash;
        private String storedHash;
        private boolean verified;
        private String remarks;

        public Builder document(Document v)     { this.document     = v; return this; }
        public Builder verifiedBy(User v)       { this.verifiedBy   = v; return this; }
        public Builder computedHash(String v)   { this.computedHash = v; return this; }
        public Builder storedHash(String v)     { this.storedHash   = v; return this; }
        public Builder verified(boolean v)      { this.verified     = v; return this; }
        public Builder remarks(String v)        { this.remarks      = v; return this; }
        public VerificationLog build()          { return new VerificationLog(this); }
    }

    public Long getId()                  { return id; }
    public Document getDocument()        { return document; }
    public User getVerifiedBy()          { return verifiedBy; }
    public String getComputedHash()      { return computedHash; }
    public String getStoredHash()        { return storedHash; }
    public boolean isVerified()          { return verified; }
    public String getRemarks()           { return remarks; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
}
