package com.medchain.ml.repository;

import com.medchain.ml.entity.MLPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MLPredictionRepository extends JpaRepository<MLPrediction, Long> {
    List<MLPrediction> findTop50ByOrderByPredictedAtDesc();
    long countByPrediction(String prediction);
}
