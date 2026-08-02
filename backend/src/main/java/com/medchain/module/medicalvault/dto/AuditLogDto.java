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
public class AuditLogDto {
    private Long id;
    private String action;
    private String userEmail;
    private String ipAddress;
    private String details;
    private String transactionHash;
    private OffsetDateTime timestamp;
}
