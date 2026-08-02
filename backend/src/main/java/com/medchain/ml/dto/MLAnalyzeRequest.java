package com.medchain.ml.dto;

import lombok.Data;
import java.util.List;

@Data
public class MLAnalyzeRequest {
    private List<List<Double>> records;
}
