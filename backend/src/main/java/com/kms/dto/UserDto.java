package com.kms.dto;

import com.kms.model.User;
import java.time.LocalDateTime;

public class UserDto {

    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private boolean active;
        private LocalDateTime createdAt;

        private UserResponse() {}

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String fullName;
            private String email;
            private String role;
            private boolean active;
            private LocalDateTime createdAt;

            public Builder id(Long v)               { this.id        = v; return this; }
            public Builder fullName(String v)       { this.fullName  = v; return this; }
            public Builder email(String v)          { this.email     = v; return this; }
            public Builder role(String v)           { this.role      = v; return this; }
            public Builder active(boolean v)        { this.active    = v; return this; }
            public Builder createdAt(LocalDateTime v){ this.createdAt= v; return this; }
            public UserResponse build() {
                UserResponse r = new UserResponse();
                r.id        = this.id;
                r.fullName  = this.fullName;
                r.email     = this.email;
                r.role      = this.role;
                r.active    = this.active;
                r.createdAt = this.createdAt;
                return r;
            }
        }

        public Long getId()                  { return id; }
        public String getFullName()          { return fullName; }
        public String getEmail()             { return email; }
        public String getRole()              { return role; }
        public boolean isActive()            { return active; }
        public LocalDateTime getCreatedAt()  { return createdAt; }
    }

    public static class UpdateRoleRequest {
        private User.Role role;
        public User.Role getRole()        { return role; }
        public void setRole(User.Role v)  { this.role = v; }
    }

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .role(user.getRole().name())
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
