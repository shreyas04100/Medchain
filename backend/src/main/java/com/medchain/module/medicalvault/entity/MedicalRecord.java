package com.medchain.module.medicalvault.entity;

import com.medchain.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord extends BaseEntity {

    @Column(nullable = false)
    private String patientEmail;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String mimeType;

    @Column(nullable = false)
    private String encryptedFilePath;

    @Column(nullable = false)
    private String checksum;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private String cid;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private OffsetDateTime uploadedAt;
}
