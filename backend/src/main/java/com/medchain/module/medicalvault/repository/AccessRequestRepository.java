package com.medchain.module.medicalvault.repository;

import com.medchain.module.medicalvault.entity.AccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
 
@Repository
public interface AccessRequestRepository extends JpaRepository<AccessRequest, Long> {
    List<AccessRequest> findByStatus(String status);
    List<AccessRequest> findByDoctorEmail(String doctorEmail);
    List<AccessRequest> findByPatientEmail(String patientEmail);
    List<AccessRequest> findByDoctorEmailAndStatus(String doctorEmail, String status);
    boolean existsByDoctorEmailAndRecordIdAndStatus(String doctorEmail, Long recordId, String status);
    AccessRequest findTopByDoctorEmailAndRecordId(String doctorEmail, Long recordId);
}
