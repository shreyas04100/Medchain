package com.medchain.module.medicalvault.controller;

import com.medchain.module.medicalvault.dto.AccessRequestDto;
import com.medchain.module.medicalvault.dto.AuditLogDto;
import com.medchain.module.medicalvault.dto.BlockchainTransactionDto;
import com.medchain.module.medicalvault.dto.MedicalRecordResponse;
import com.medchain.module.medicalvault.dto.MedicalRecordUploadRequest;
import com.medchain.module.medicalvault.service.MedicalVaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MedicalVaultController {

    private static final Logger log = LoggerFactory.getLogger(MedicalVaultController.class);

    private final MedicalVaultService medicalVaultService;

    @PostMapping(value = "/records/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MedicalRecordResponse> uploadRecord(
            @RequestParam("file") MultipartFile file,
            @Valid MedicalRecordUploadRequest request) {
        try {
            return ResponseEntity.ok(medicalVaultService.uploadRecord(file, request));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/records")
    public ResponseEntity<List<MedicalRecordResponse>> listRecords(
            @RequestParam(required = false) String patientEmail,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(medicalVaultService.listRecords(
                patientEmail == null ? "" : patientEmail, category, search));
    }

    @GetMapping("/records/{id}")
    public ResponseEntity<MedicalRecordResponse> getRecord(@PathVariable Long id) {
        return ResponseEntity.ok(medicalVaultService.getRecord(id));
    }

    @DeleteMapping("/records/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        medicalVaultService.deleteRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/records/download/{id}")
    public ResponseEntity<byte[]> downloadRecord(@PathVariable Long id, Authentication authentication) throws IOException {
        byte[] bytes = medicalVaultService.downloadRecord(id, authentication.getName(), authentication.getAuthorities());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=record.enc")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    @GetMapping("/records/view/{id}")
    public ResponseEntity<byte[]> viewRecord(@PathVariable Long id, Authentication authentication) throws Exception {
        MedicalRecordResponse meta = medicalVaultService.getRecord(id);
        byte[] decrypted = medicalVaultService.viewRecord(id, authentication.getName(), authentication.getAuthorities());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + meta.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(meta.getMimeType()))
                .body(decrypted);
    }

    @GetMapping("/records/approved")
    public ResponseEntity<List<MedicalRecordResponse>> approvedRecords(@RequestParam String doctorEmail) {
        return ResponseEntity.ok(medicalVaultService.listApprovedRecordsForDoctor(doctorEmail));
    }

    @PostMapping("/access/request")
    public ResponseEntity<AccessRequestDto> requestAccess(
            @RequestParam Long recordId,
            @RequestParam String doctorEmail,
            @RequestParam(required = false) String patientEmail) {
        String effectivePatientEmail = (patientEmail != null && !patientEmail.isBlank())
                ? patientEmail
                : "";
        return ResponseEntity.ok(medicalVaultService.requestAccess(recordId, doctorEmail, effectivePatientEmail));
    }

    @PostMapping("/access/grant")
    public ResponseEntity<AccessRequestDto> grantAccess(
            @RequestParam Long recordId,
            @RequestParam String doctorEmail,
            @RequestParam(required = false) String patientEmail,
            Authentication authentication) {
        String effectivePatientEmail = (patientEmail != null && !patientEmail.isBlank())
                ? patientEmail
                : (authentication != null ? authentication.getName() : "");
        try {
            return ResponseEntity.ok(medicalVaultService.grantAccess(recordId, doctorEmail, effectivePatientEmail));
        } catch (Exception ex) {
            log.error("Error granting access: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @PostMapping("/access/approve")
    public ResponseEntity<AccessRequestDto> approveAccess(@RequestParam Long requestId) {
        return ResponseEntity.ok(medicalVaultService.approveAccess(requestId));
    }

    @PostMapping("/access/reject")
    public ResponseEntity<AccessRequestDto> rejectAccess(@RequestParam Long requestId) {
        return ResponseEntity.ok(medicalVaultService.rejectAccess(requestId));
    }

    @PostMapping("/access/revoke")
    public ResponseEntity<AccessRequestDto> revokeAccess(@RequestParam Long requestId) {
        return ResponseEntity.ok(medicalVaultService.revokeAccess(requestId));
    }

    @GetMapping("/access/pending")
    public ResponseEntity<List<AccessRequestDto>> pendingRequests() {
        return ResponseEntity.ok(medicalVaultService.listPendingRequests());
    }

    @GetMapping("/access/by-doctor")
    public ResponseEntity<List<AccessRequestDto>> byDoctor(@RequestParam String doctorEmail) {
        return ResponseEntity.ok(medicalVaultService.listRequestsByDoctor(doctorEmail));
    }

    @GetMapping("/access/by-patient")
    public ResponseEntity<List<AccessRequestDto>> byPatient(@RequestParam String patientEmail) {
        return ResponseEntity.ok(medicalVaultService.listRequestsByPatient(patientEmail));
    }

    @GetMapping("/audit")
    public ResponseEntity<List<AuditLogDto>> auditLogs() {
        return ResponseEntity.ok(medicalVaultService.listAuditLogs());
    }

    @GetMapping("/blockchain/transactions")
    public ResponseEntity<List<BlockchainTransactionDto>> transactions() {
        return ResponseEntity.ok(medicalVaultService.listTransactions());
    }
}
