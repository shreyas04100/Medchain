package com.medchain.module.medicalvault.repository;

import com.medchain.module.medicalvault.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientEmail(String patientEmail);
    List<MedicalRecord> findByCategoryAndPatientEmail(String category, String patientEmail);
    List<MedicalRecord> findByTitleContainingIgnoreCaseAndPatientEmail(String title, String patientEmail);
}
