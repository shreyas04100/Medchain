package com.medchain.controller;

import com.medchain.dto.auth.AuthResponse;
import com.medchain.dto.auth.ForgotPasswordRequest;
import com.medchain.dto.auth.ForgotPasswordResetRequest;
import com.medchain.dto.auth.LoginRequest;
import com.medchain.dto.auth.RegisterOtpRequest;
import com.medchain.dto.auth.RegisterRequest;
import com.medchain.dto.auth.UserDto;
import com.medchain.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/register/request-otp")
    public ResponseEntity<Map<String, String>> requestRegistrationOtp(@Valid @RequestBody RegisterRequest request) {
        try {
            authenticationService.requestRegistrationOtp(request);
            return ResponseEntity.ok(Map.of("message", "Verification code sent to your email"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/register/verify")
    public ResponseEntity<?> verifyRegistration(@Valid @RequestBody RegisterOtpRequest request) {
        try {
            return ResponseEntity.ok(authenticationService.verifyAndRegister(request));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/admin/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUserByAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authenticationService.createUserByAdmin(request));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<Map<String, String>> requestForgotPasswordOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authenticationService.requestForgotPasswordOtp(request);
            return ResponseEntity.ok(Map.of("message", "Password reset verification code sent to your email"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPasswordWithOtp(@Valid @RequestBody ForgotPasswordResetRequest request) {
        try {
            return ResponseEntity.ok(authenticationService.resetPasswordWithOtp(request));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication authentication) {
        return ResponseEntity.ok(authenticationService.getCurrentUser(authentication.getName()));
    }
}
