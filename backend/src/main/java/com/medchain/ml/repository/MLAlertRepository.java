package com.medchain.ml.repository;

import com.medchain.ml.entity.MLAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MLAlertRepository extends JpaRepository<MLAlert, Long> {
    List<MLAlert> findTop20ByOrderByAlertedAtDesc();
    List<MLAlert> findByResolvedFalseOrderByAlertedAtDesc();
}
