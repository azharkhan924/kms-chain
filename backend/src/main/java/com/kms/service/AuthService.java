package com.kms.service;

import com.kms.dto.AuthDto;
import com.kms.exception.BadRequestException;
import com.kms.model.User;
import com.kms.repository.UserRepository;
import com.kms.security.JwtUtil;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authManager,
                       UserDetailsService userDetailsService,
                       AuditService auditService) {
        this.userRepository   = userRepository;
        this.passwordEncoder  = passwordEncoder;
        this.jwtUtil          = jwtUtil;
        this.authManager      = authManager;
        this.userDetailsService = userDetailsService;
        this.auditService     = auditService;
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already registered: " + request.getEmail());

        User user = User.builder()
            .fullName(request.getFullName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole() != null ? request.getRole() : User.Role.USER)
            .active(true)
            .build();
        userRepository.save(user);
        auditService.log("REGISTER", user.getEmail(), "New user registered with role: " + user.getRole());

        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token  = jwtUtil.generateToken(ud, user.getRole().name());
        return AuthDto.AuthResponse.builder()
            .token(token).email(user.getEmail()).fullName(user.getFullName())
            .role(user.getRole().name()).userId(user.getId()).build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.isActive())
            throw new BadRequestException("Account deactivated. Contact admin.");

        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token  = jwtUtil.generateToken(ud, user.getRole().name());
        auditService.log("LOGIN", user.getEmail(), "User logged in");
        return AuthDto.AuthResponse.builder()
            .token(token).email(user.getEmail()).fullName(user.getFullName())
            .role(user.getRole().name()).userId(user.getId()).build();
    }
}
