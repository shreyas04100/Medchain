package com.medchain.ml.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medchain.ml.dto.*;
import com.medchain.ml.entity.MLAlert;
import com.medchain.ml.entity.MLPrediction;
import com.medchain.ml.repository.MLAlertRepository;
import com.medchain.ml.repository.MLPredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MLService {

    private final MLPredictionRepository predictionRepository;
    private final MLAlertRepository alertRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ml.api.base-url:http://localhost:8000}")
    private String mlBaseUrl;

    public MLPredictionResponse predict(MLPredictRequest request, String requestedBy) {
        MLPredictionResponse response = restTemplate.postForObject(
                mlBaseUrl + "/predict", request, MLPredictionResponse.class);
        if (response != null) {
            savePrediction(response, request.getFeatures(), requestedBy);
            if ("HIGH".equals(response.getRiskLevel()) || "CRITICAL".equals(response.getRiskLevel())) {
                createAlert(response);
            }
        }
        return response;
    }

    public MLAnalyzeResponse analyze(MLAnalyzeRequest request) {
        return restTemplate.postForObject(mlBaseUrl + "/analyze", request, MLAnalyzeResponse.class);
    }

    public MLModelInfoResponse getModelInfo() {
        return restTemplate.getForObject(mlBaseUrl + "/model-info", MLModelInfoResponse.class);
    }

    public Map<String, Object> getHealth() {
        return restTemplate.getForObject(mlBaseUrl + "/health", Map.class);
    }

    public List<MLPrediction> getPredictionHistory() {
        return predictionRepository.findTop50ByOrderByPredictedAtDesc();
    }

    public List<MLAlert> getAlerts() {
        return alertRepository.findTop20ByOrderByAlertedAtDesc();
    }

    public List<MLAlert> getActiveAlerts() {
        return alertRepository.findByResolvedFalseOrderByAlertedAtDesc();
    }

    public Map<String, Long> getPredictionStats() {
        long total = predictionRepository.count();
        long anomalies = predictionRepository.countByPrediction("ANOMALY");
        long normal = predictionRepository.countByPrediction("NORMAL");
        long activeAlerts = alertRepository.findByResolvedFalseOrderByAlertedAtDesc().size();
        return Map.of("total", total, "anomalies", anomalies, "normal", normal, "activeAlerts", activeAlerts);
    }

    public MLAlert resolveAlert(Long alertId, String resolvedBy) {
        MLAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found"));
        alert.setResolved(true);
        alert.setResolvedBy(resolvedBy);
        alert.setResolvedAt(OffsetDateTime.now());
        return alertRepository.save(alert);
    }

    private void savePrediction(MLPredictionResponse response, List<Double> features, String requestedBy) {
        try {
            MLPrediction p = new MLPrediction();
            p.setPrediction(response.getPrediction());
            p.setRiskScore(response.getRiskScore());
            p.setRiskLevel(response.getRiskLevel());
            p.setConfidence(response.getConfidence());
            p.setPredictedAt(OffsetDateTime.now());
            p.setFeaturesJson(objectMapper.writeValueAsString(features));
            p.setRequestedBy(requestedBy);
            predictionRepository.save(p);
        } catch (Exception e) {
            log.warn("Failed to persist prediction: {}", e.getMessage());
        }
    }

    private void createAlert(MLPredictionResponse response) {
        MLAlert alert = new MLAlert();
        alert.setRiskLevel(response.getRiskLevel());
        alert.setRiskScore(response.getRiskScore());
        alert.setMessage("Anomaly detected with risk level " + response.getRiskLevel()
                + " (score: " + response.getRiskScore() + ")");
        alert.setAlertedAt(OffsetDateTime.now());
        alert.setResolved(false);
        alertRepository.save(alert);
    }
}
