package com.medchain.repository;

import com.medchain.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailAndPurposeAndCode(String email, String purpose, String code);
    void deleteByEmailAndPurpose(String email, String purpose);
}
