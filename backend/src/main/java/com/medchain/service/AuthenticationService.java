package com.medchain.service;

import com.medchain.dto.auth.AuthResponse;
import com.medchain.dto.auth.ForgotPasswordRequest;
import com.medchain.dto.auth.ForgotPasswordResetRequest;
import com.medchain.dto.auth.LoginRequest;
import com.medchain.dto.auth.RegisterOtpRequest;
import com.medchain.dto.auth.RegisterRequest;
import com.medchain.dto.auth.UserDto;
import com.medchain.entity.Role;
import com.medchain.entity.User;
import com.medchain.repository.RoleRepository;
import com.medchain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        return createUser(request.getFirstName(), request.getLastName(), request.getEmail(), request.getPassword(), request.getRole());
    }

    @Transactional
    public AuthResponse createUserByAdmin(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists");
        }

        String normalizedRole = request.getRole().toUpperCase();
        if (!"DOCTOR".equals(normalizedRole) && !"ADMIN".equals(normalizedRole)) {
            throw new IllegalArgumentException("Only DOCTOR and ADMIN roles can be created by an admin");
        }

        validatePassword(request.getPassword());
        Role userRole = roleRepository.findByName(Role.RoleName.valueOf(normalizedRole))
                .orElseThrow(() -> new EntityNotFoundException("Role not found"));

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(userRole));
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user.getEmail());
        return buildAuthResponse(user, accessToken, "refresh-token-placeholder");
    }

    @Transactional
    public void requestRegistrationOtp(RegisterRequest request) {
        validatePatientSelfRegistration(request.getEmail(), request.getRole());
        String normalizedEmail = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists");
        }
        otpService.generateAndSendOtp(normalizedEmail, "REGISTER");
    }

    @Transactional
    public AuthResponse verifyAndRegister(RegisterOtpRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase();
        validatePatientSelfRegistration(normalizedEmail, request.getRole());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (!otpService.verifyOtp(normalizedEmail, "REGISTER", request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        otpService.consumeOtp(normalizedEmail, "REGISTER", request.getOtp());
        return createUser(request.getFirstName(), request.getLastName(), normalizedEmail, request.getPassword(), request.getRole());
    }

    @Transactional
    public void requestForgotPasswordOtp(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account found for that email"));
        otpService.generateAndSendOtp(user.getEmail(), "FORGOT_PASSWORD");
    }

    @Transactional
    public AuthResponse resetPasswordWithOtp(ForgotPasswordResetRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account found for that email"));

        validatePassword(request.getNewPassword());
        if (!otpService.verifyOtp(normalizedEmail, "FORGOT_PASSWORD", request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        otpService.consumeOtp(normalizedEmail, "FORGOT_PASSWORD", request.getOtp());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user.getEmail());
        return buildAuthResponse(user, accessToken, "refresh-token-placeholder");
    }

    private void validatePatientSelfRegistration(String email, String role) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (!"PATIENT".equalsIgnoreCase(role)) {
            throw new IllegalArgumentException("Only patients can self-register. Doctor and Admin accounts must be created by an admin.");
        }
    }

    private AuthResponse createUser(String firstName, String lastName, String email, String password, String role) {
        validatePatientSelfRegistration(email, role);
        String normalizedEmail = email.toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists");
        }

        validatePassword(password);
        Role userRole = roleRepository.findByName(Role.RoleName.valueOf(role.toUpperCase()))
                .orElseThrow(() -> new EntityNotFoundException("Role not found"));

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of(userRole));
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user.getEmail());
        return buildAuthResponse(user, accessToken, "refresh-token-placeholder");
    }

    private void validatePassword(String password) {
        if (password == null || !password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$")) {
            throw new IllegalArgumentException("Password must be at least 8 characters and include upper, lower and a special character");
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        if (!authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String accessToken = jwtService.generateToken(user.getEmail());
        return buildAuthResponse(user, accessToken, "refresh-token-placeholder");
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()))
                .build();
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()))
                .build();
    }
}
