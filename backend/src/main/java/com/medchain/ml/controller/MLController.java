package com.medchain.ml.controller;

import com.medchain.dto.ApiResponse;
import com.medchain.ml.dto.*;
import com.medchain.ml.entity.MLAlert;
import com.medchain.ml.entity.MLPrediction;
import com.medchain.ml.service.MLService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MLController {

    private final MLService mlService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(mlService.getHealth());
    }

    @GetMapping("/model-info")
    public ResponseEntity<MLModelInfoResponse> modelInfo() {
        return ResponseEntity.ok(mlService.getModelInfo());
    }

    @PostMapping("/predict")
    public ResponseEntity<MLPredictionResponse> predict(
            @RequestBody MLPredictRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String user = userDetails != null ? userDetails.getUsername() : "anonymous";
        return ResponseEntity.ok(mlService.predict(request, user));
    }

    @PostMapping("/analyze")
    public ResponseEntity<MLAnalyzeResponse> analyze(@RequestBody MLAnalyzeRequest request) {
        return ResponseEntity.ok(mlService.analyze(request));
    }

    @GetMapping("/predictions")
    public ResponseEntity<List<MLPrediction>> predictionHistory() {
        return ResponseEntity.ok(mlService.getPredictionHistory());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<MLAlert>> alerts() {
        return ResponseEntity.ok(mlService.getAlerts());
    }

    @GetMapping("/alerts/active")
    public ResponseEntity<List<MLAlert>> activeAlerts() {
        return ResponseEntity.ok(mlService.getActiveAlerts());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        return ResponseEntity.ok(mlService.getPredictionStats());
    }

    @PatchMapping("/alerts/{id}/resolve")
    public ResponseEntity<ApiResponse<MLAlert>> resolveAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String user = userDetails != null ? userDetails.getUsername() : "system";
        MLAlert alert = mlService.resolveAlert(id, user);
        return ResponseEntity.ok(ApiResponse.success("Alert resolved", alert));
    }
}
