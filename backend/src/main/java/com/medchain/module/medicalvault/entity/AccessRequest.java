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
@Table(name = "access_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccessRequest extends BaseEntity {

    @Column(nullable = false)
    private String patientEmail;

    @Column(nullable = false)
    private String doctorEmail;

    @Column(nullable = false)
    private Long recordId;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private OffsetDateTime requestedAt;

    private OffsetDateTime respondedAt;
}
