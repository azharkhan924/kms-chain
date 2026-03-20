package com.kms.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Role { USER, VERIFIER, ADMIN }

    public User() {}

    private User(Builder b) {
        this.fullName = b.fullName;
        this.email    = b.email;
        this.password = b.password;
        this.role     = b.role;
        this.active   = b.active;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String fullName;
        private String email;
        private String password;
        private Role role;
        private boolean active = true;

        public Builder fullName(String v)  { this.fullName = v; return this; }
        public Builder email(String v)     { this.email    = v; return this; }
        public Builder password(String v)  { this.password = v; return this; }
        public Builder role(Role v)        { this.role     = v; return this; }
        public Builder active(boolean v)   { this.active   = v; return this; }
        public User build()                { return new User(this); }
    }

    public Long getId()                  { return id; }
    public String getFullName()          { return fullName; }
    public String getEmail()             { return email; }
    public String getPassword()          { return password; }
    public Role getRole()                { return role; }
    public boolean isActive()            { return active; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    public void setFullName(String v)    { this.fullName = v; }
    public void setEmail(String v)       { this.email    = v; }
    public void setPassword(String v)    { this.password = v; }
    public void setRole(Role v)          { this.role     = v; }
    public void setActive(boolean v)     { this.active   = v; }
}
