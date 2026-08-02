package com.medchain.ml.entity;

import com.medchain.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ml_alerts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MLAlert extends BaseEntity {

    @Column(nullable = false)
    private String riskLevel;

    @Column(nullable = false)
    private Double riskScore;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private OffsetDateTime alertedAt;

    private String resolvedBy;
    private OffsetDateTime resolvedAt;

    @Column(nullable = false)
    private Boolean resolved = false;
}
