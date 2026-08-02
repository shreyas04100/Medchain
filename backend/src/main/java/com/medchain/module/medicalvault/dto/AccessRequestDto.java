package com.medchain.module.medicalvault.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessRequestDto {
    private Long id;
    private String patientEmail;
    private String doctorEmail;
    private Long recordId;
    private String status;
    private OffsetDateTime requestedAt;
    private OffsetDateTime respondedAt;
}
