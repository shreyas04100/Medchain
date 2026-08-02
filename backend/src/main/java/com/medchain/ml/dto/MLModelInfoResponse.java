package com.medchain.ml.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MLModelInfoResponse {
    @JsonProperty("model_type")
    private String modelType;

    @JsonProperty("num_features")
    private Integer numFeatures;

    @JsonProperty("dataset_size")
    private Integer datasetSize;

    @JsonProperty("training_time_seconds")
    private Double trainingTimeSeconds;

    private Double accuracy;
    private Double precision;
    private Double recall;

    @JsonProperty("f1_score")
    private Double f1Score;

    @JsonProperty("confusion_matrix")
    private Object confusionMatrix;

    private Double contamination;
}
