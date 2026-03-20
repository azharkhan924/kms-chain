package com.kms.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false)
    private String performedBy;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(length = 50)
    private String ipAddress;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public AuditLog() {}

    private AuditLog(Builder b) {
        this.action      = b.action;
        this.performedBy = b.performedBy;
        this.details     = b.details;
        this.ipAddress   = b.ipAddress;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String action;
        private String performedBy;
        private String details;
        private String ipAddress;

        public Builder action(String v)      { this.action      = v; return this; }
        public Builder performedBy(String v) { this.performedBy = v; return this; }
        public Builder details(String v)     { this.details     = v; return this; }
        public Builder ipAddress(String v)   { this.ipAddress   = v; return this; }
        public AuditLog build()              { return new AuditLog(this); }
    }

    public Long getId()                  { return id; }
    public String getAction()            { return action; }
    public String getPerformedBy()       { return performedBy; }
    public String getDetails()           { return details; }
    public String getIpAddress()         { return ipAddress; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
}
