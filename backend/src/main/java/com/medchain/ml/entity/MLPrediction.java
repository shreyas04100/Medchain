package com.medchain.ml.entity;

import com.medchain.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ml_predictions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MLPrediction extends BaseEntity {

    @Column(nullable = false)
    private String prediction;

    @Column(nullable = false)
    private Double riskScore;

    @Column(nullable = false)
    private String riskLevel;

    @Column(nullable = false)
    private Double confidence;

    @Column(nullable = false)
    private OffsetDateTime predictedAt;

    @Column(length = 2000)
    private String featuresJson;

    private String requestedBy;
}
