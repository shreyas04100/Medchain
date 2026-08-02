package com.medchain.ml.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class MLAnalyzeResponse {
    private Integer total;
    private Integer anomalies;
    private Integer normal;

    @JsonProperty("average_risk_score")
    private Double averageRiskScore;

    @JsonProperty("overall_risk_level")
    private String overallRiskLevel;

    private List<MLPredictionResponse> predictions;
}
