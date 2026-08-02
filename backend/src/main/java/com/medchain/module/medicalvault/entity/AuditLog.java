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
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends BaseEntity {

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private String details;

    @Column(nullable = false)
    private String transactionHash;

    @Column(nullable = false)
    private OffsetDateTime timestamp;
}
