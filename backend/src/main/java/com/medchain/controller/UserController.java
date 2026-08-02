package com.medchain.controller;

import com.medchain.dto.auth.ChangePasswordRequest;
import com.medchain.entity.User;
import com.medchain.repository.UserRepository;
import com.medchain.service.OtpService;
import com.medchain.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @GetMapping("/doctors")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
        List<User> doctors = userRepository.findAllDoctors();
        List<Map<String, Object>> result = doctors.stream().map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "firstName", u.getFirstName(),
                "lastName", u.getLastName(),
                "email", u.getEmail()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = user.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName()));
        if (isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Cannot remove admin account"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        }

        if (!request.getNewPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password does not meet complexity requirements"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    @PostMapping("/me/request-password-change-otp")
    public ResponseEntity<?> requestPasswordChangeOtp(Authentication authentication, @RequestBody Map<String, String> body) {
        String email = authentication.getName();
        String currentPassword = body.get("currentPassword");
        if (currentPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "currentPassword required"));
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        }

        try {
            otpService.generateAndSendOtp(email, "CHANGE_PASSWORD");
            return ResponseEntity.ok(Map.of("message", "Password change verification code sent to your registered email"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/me/password-with-otp")
    public ResponseEntity<?> changePasswordWithOtp(Authentication authentication, @RequestBody Map<String, String> body) {
        String email = authentication.getName();
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");
        if (otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "otp and newPassword required"));
        }

        if (!newPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password does not meet complexity requirements"));
        }

        boolean ok = otpService.verifyOtp(email, "CHANGE_PASSWORD", otp);
        if (!ok) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpService.consumeOtp(email, "CHANGE_PASSWORD", otp);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }
}
