package com.medchain.module.medicalvault.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MedicalRecordUploadRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String category;

    @NotBlank
    private String patientEmail;
}
