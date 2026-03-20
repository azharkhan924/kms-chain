package com.kms.dto;

import com.kms.model.User;
import jakarta.validation.constraints.*;

public class AuthDto {

    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;

        public String getEmail()         { return email; }
        public String getPassword()      { return password; }
        public void setEmail(String v)   { this.email    = v; }
        public void setPassword(String v){ this.password = v; }
    }

    public static class RegisterRequest {
        @NotBlank @Size(min = 2, max = 100)
        private String fullName;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6, max = 50)
        private String password;
        private User.Role role = User.Role.USER;

        public String getFullName()        { return fullName; }
        public String getEmail()           { return email; }
        public String getPassword()        { return password; }
        public User.Role getRole()         { return role; }
        public void setFullName(String v)  { this.fullName = v; }
        public void setEmail(String v)     { this.email    = v; }
        public void setPassword(String v)  { this.password = v; }
        public void setRole(User.Role v)   { this.role     = v; }
    }

    public static class AuthResponse {
        private String token;
        private String email;
        private String fullName;
        private String role;
        private Long userId;

        private AuthResponse() {}

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String token;
            private String email;
            private String fullName;
            private String role;
            private Long userId;

            public Builder token(String v)    { this.token    = v; return this; }
            public Builder email(String v)    { this.email    = v; return this; }
            public Builder fullName(String v) { this.fullName = v; return this; }
            public Builder role(String v)     { this.role     = v; return this; }
            public Builder userId(Long v)     { this.userId   = v; return this; }
            public AuthResponse build() {
                AuthResponse r = new AuthResponse();
                r.token    = this.token;
                r.email    = this.email;
                r.fullName = this.fullName;
                r.role     = this.role;
                r.userId   = this.userId;
                return r;
            }
        }

        public String getToken()    { return token; }
        public String getEmail()    { return email; }
        public String getFullName() { return fullName; }
        public String getRole()     { return role; }
        public Long getUserId()     { return userId; }
    }
}
