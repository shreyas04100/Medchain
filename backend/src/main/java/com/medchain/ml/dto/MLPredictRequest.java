package com.medchain.ml.dto;

import lombok.Data;
import java.util.List;

@Data
public class MLPredictRequest {
    private List<Double> features;
}
