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
public class MedicalRecordResponse {
    private Long id;
    private String title;
    private String category;
    private String patientEmail;
    private String fileName;
    private String mimeType;
    private String checksum;
    private Long fileSize;
    private String cid;
    private String status;
    private OffsetDateTime uploadedAt;
}
