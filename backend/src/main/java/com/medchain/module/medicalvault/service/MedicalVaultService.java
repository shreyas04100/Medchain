package com.medchain.module.medicalvault.service;

import com.medchain.module.medicalvault.dto.AccessRequestDto;
import com.medchain.module.medicalvault.dto.AuditLogDto;
import com.medchain.module.medicalvault.dto.BlockchainTransactionDto;
import com.medchain.module.medicalvault.dto.MedicalRecordResponse;
import com.medchain.module.medicalvault.dto.MedicalRecordUploadRequest;
import com.medchain.module.medicalvault.entity.AccessRequest;
import com.medchain.module.medicalvault.entity.AuditLog;
import com.medchain.module.medicalvault.entity.BlockchainTransaction;
import com.medchain.module.medicalvault.entity.MedicalRecord;
import com.medchain.module.medicalvault.repository.AccessRequestRepository;
import com.medchain.module.medicalvault.repository.AuditLogRepository;
import com.medchain.module.medicalvault.repository.BlockchainTransactionRepository;
import com.medchain.module.medicalvault.repository.MedicalRecordRepository;
import com.medchain.module.medicalvault.util.CryptoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalVaultService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AccessRequestRepository accessRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final BlockchainTransactionRepository blockchainTransactionRepository;

    private final Path storagePath = Paths.get("uploads/medical-vault");

    @Transactional
    public MedicalRecordResponse uploadRecord(MultipartFile file, MedicalRecordUploadRequest request) throws Exception {
        Files.createDirectories(storagePath);
        byte[] fileBytes = file.getBytes();
        byte[] encrypted = CryptoUtil.encrypt(fileBytes);
        String checksum = CryptoUtil.sha256(fileBytes);
        String cid = "ipfs-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String fileName = file.getOriginalFilename() == null ? "record.bin" : file.getOriginalFilename();
        Path target = storagePath.resolve(System.currentTimeMillis() + "_" + fileName + ".enc");
        Files.write(target, encrypted);

        MedicalRecord record = new MedicalRecord();
        record.setPatientEmail(request.getPatientEmail());
        record.setTitle(request.getTitle());
        record.setCategory(request.getCategory());
        record.setFileName(fileName);
        record.setMimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        record.setEncryptedFilePath(target.toString());
        record.setChecksum(checksum);
        record.setFileSize(file.getSize());
        record.setCid(cid);
        record.setStatus("UPLOADED");
        record.setUploadedAt(OffsetDateTime.now());
        medicalRecordRepository.save(record);

        createBlockchainTransaction(record.getId().toString(), cid);
        createAuditLog("UPLOAD", request.getPatientEmail(), "0.0.0.0", "Uploaded: " + fileName, record.getId().toString());
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> listRecords(String patientEmail, String category, String search) {
        List<MedicalRecord> records;
        if (category != null && !category.isBlank()) {
            records = medicalRecordRepository.findByCategoryAndPatientEmail(category, patientEmail);
        } else if (search != null && !search.isBlank()) {
            records = medicalRecordRepository.findByTitleContainingIgnoreCaseAndPatientEmail(search, patientEmail);
        } else {
            records = medicalRecordRepository.findByPatientEmail(patientEmail);
        }
        return records.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getRecord(Long id) {
        return toResponse(medicalRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Record not found")));
    }

    @Transactional
    public void deleteRecord(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
        medicalRecordRepository.delete(record);
        createAuditLog("DELETE", record.getPatientEmail(), "0.0.0.0", "Deleted: " + record.getFileName(), record.getId().toString());
    }

    @Transactional(readOnly = true)
    public byte[] downloadRecord(Long id, String requesterEmail, Collection<? extends GrantedAuthority> authorities) throws IOException {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
        ensureAccess(record, requesterEmail, authorities);
        createAuditLog("DOWNLOAD", record.getPatientEmail(), "0.0.0.0", "Downloaded: " + record.getFileName(), record.getId().toString());
        return Files.readAllBytes(Paths.get(record.getEncryptedFilePath()));
    }

    @Transactional
    public byte[] viewRecord(Long id, String requesterEmail, Collection<? extends GrantedAuthority> authorities) throws Exception {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
        ensureAccess(record, requesterEmail, authorities);
        byte[] encrypted = Files.readAllBytes(Paths.get(record.getEncryptedFilePath()));
        createAuditLog("VIEW", record.getPatientEmail(), "0.0.0.0", "Viewed: " + record.getFileName(), record.getId().toString());
        return CryptoUtil.decrypt(encrypted);
    }

    @Transactional
    public AccessRequestDto requestAccess(Long recordId, String doctorEmail, String patientEmail) {
        String normalizedPatientEmail = normalizeEmail(patientEmail);
        String normalizedDoctorEmail = normalizeEmail(doctorEmail);

        if (normalizedPatientEmail.isBlank()) {
            throw new IllegalArgumentException("Patient email is required");
        }
        if (normalizedDoctorEmail.isBlank()) {
            throw new IllegalArgumentException("Doctor email is required");
        }

        AccessRequest request = new AccessRequest();
        request.setPatientEmail(normalizedPatientEmail);
        request.setDoctorEmail(normalizedDoctorEmail);
        request.setRecordId(recordId);
        request.setStatus("PENDING");
        request.setRequestedAt(OffsetDateTime.now());
        accessRequestRepository.save(request);
        createAuditLog("ACCESS_REQUEST", normalizedPatientEmail, "0.0.0.0", "Access requested by " + normalizedDoctorEmail, request.getId().toString());
        return toAccessResponse(request);
    }

    @Transactional
    public AccessRequestDto grantAccess(Long recordId, String doctorEmail, String patientEmail) {
        String normalizedPatientEmail = normalizeEmail(patientEmail);
        String normalizedDoctorEmail = normalizeEmail(doctorEmail);

        if (normalizedPatientEmail.isBlank()) {
            throw new IllegalArgumentException("Patient email is required");
        }
        if (normalizedDoctorEmail.isBlank()) {
            throw new IllegalArgumentException("Doctor email is required");
        }
        if (normalizedDoctorEmail.equals(normalizedPatientEmail)) {
            throw new IllegalArgumentException("Doctor email cannot be the same as patient email");
        }

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));

        String ownerEmail = normalizeEmail(record.getPatientEmail());
        if (!ownerEmail.equals(normalizedPatientEmail)) {
            throw new AccessDeniedException("You can only grant access to your own records");
        }

        AccessRequest existingRequest = accessRequestRepository.findTopByDoctorEmailAndRecordId(normalizedDoctorEmail, recordId);
        if (existingRequest != null) {
            existingRequest.setStatus("APPROVED");
            existingRequest.setRespondedAt(OffsetDateTime.now());
            accessRequestRepository.save(existingRequest);
            createAuditLog("ACCESS_GRANT", normalizedPatientEmail, "0.0.0.0", "Access granted to " + normalizedDoctorEmail + " for existing request", existingRequest.getId().toString());
            return toAccessResponse(existingRequest);
        }

        AccessRequest request = new AccessRequest();
        request.setPatientEmail(normalizedPatientEmail);
        request.setDoctorEmail(normalizedDoctorEmail);
        request.setRecordId(recordId);
        request.setStatus("APPROVED");
        request.setRequestedAt(OffsetDateTime.now());
        request.setRespondedAt(OffsetDateTime.now());
        accessRequestRepository.save(request);
        createAuditLog("ACCESS_GRANT", normalizedPatientEmail, "0.0.0.0", "Access granted to " + normalizedDoctorEmail, request.getId().toString());
        return toAccessResponse(request);
    }

    @Transactional
    public AccessRequestDto approveAccess(Long requestId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        request.setStatus("APPROVED");
        request.setRespondedAt(OffsetDateTime.now());
        accessRequestRepository.save(request);
        createAuditLog("APPROVE", request.getPatientEmail(), "0.0.0.0", "Approved for " + request.getDoctorEmail(), request.getId().toString());
        return toAccessResponse(request);
    }

    @Transactional
    public AccessRequestDto rejectAccess(Long requestId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        request.setStatus("REJECTED");
        request.setRespondedAt(OffsetDateTime.now());
        accessRequestRepository.save(request);
        createAuditLog("REJECT", request.getPatientEmail(), "0.0.0.0", "Rejected for " + request.getDoctorEmail(), request.getId().toString());
        return toAccessResponse(request);
    }

    @Transactional
    public AccessRequestDto revokeAccess(Long requestId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        request.setStatus("REVOKED");
        request.setRespondedAt(OffsetDateTime.now());
        accessRequestRepository.save(request);
        createAuditLog("REVOKE", request.getPatientEmail(), "0.0.0.0", "Revoked for " + request.getDoctorEmail(), request.getId().toString());
        return toAccessResponse(request);
    }

    @Transactional(readOnly = true)
    public List<AccessRequestDto> listPendingRequests() {
        return accessRequestRepository.findByStatus("PENDING").stream()
                .map(this::toAccessResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccessRequestDto> listRequestsByDoctor(String doctorEmail) {
        return accessRequestRepository.findByDoctorEmail(doctorEmail).stream()
                .map(this::toAccessResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccessRequestDto> listRequestsByPatient(String patientEmail) {
        return accessRequestRepository.findByPatientEmail(patientEmail).stream()
                .map(this::toAccessResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> listApprovedRecordsForDoctor(String doctorEmail) {
        return accessRequestRepository.findByDoctorEmailAndStatus(doctorEmail, "APPROVED").stream()
                .map(req -> medicalRecordRepository.findById(req.getRecordId()).orElse(null))
                .filter(r -> r != null)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> listAuditLogs() {
        return auditLogRepository.findAll().stream().map(this::toAuditResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BlockchainTransactionDto> listTransactions() {
        return blockchainTransactionRepository.findAll().stream().map(this::toTransactionResponse).collect(Collectors.toList());
    }

    private void ensureAccess(MedicalRecord record, String requesterEmail, Collection<? extends GrantedAuthority> authorities) {
        boolean isAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isDoctor = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
        if (isAdmin || record.getPatientEmail().equalsIgnoreCase(requesterEmail)) {
            return;
        }
        if (isDoctor && accessRequestRepository.existsByDoctorEmailAndRecordIdAndStatus(requesterEmail, record.getId(), "APPROVED")) {
            return;
        }
        throw new AccessDeniedException("You do not have access to this record");
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private void createBlockchainTransaction(String recordId, String cid) {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setTransactionHash("0x" + UUID.randomUUID().toString().replace("-", ""));
        tx.setBlockNumber(1000L + blockchainTransactionRepository.count());
        tx.setTimestamp(OffsetDateTime.now());
        tx.setCid(cid);
        tx.setRecordId(recordId);
        blockchainTransactionRepository.save(tx);
    }

    private void createAuditLog(String action, String userEmail, String ipAddress, String details, String txHash) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setUserEmail(userEmail);
        log.setIpAddress(ipAddress);
        log.setDetails(details);
        log.setTransactionHash(txHash);
        log.setTimestamp(OffsetDateTime.now());
        auditLogRepository.save(log);
    }

    private MedicalRecordResponse toResponse(MedicalRecord r) {
        return MedicalRecordResponse.builder()
                .id(r.getId()).title(r.getTitle()).category(r.getCategory())
                .patientEmail(r.getPatientEmail()).fileName(r.getFileName())
                .mimeType(r.getMimeType()).checksum(r.getChecksum())
                .fileSize(r.getFileSize()).cid(r.getCid())
                .status(r.getStatus()).uploadedAt(r.getUploadedAt())
                .build();
    }

    private AccessRequestDto toAccessResponse(AccessRequest r) {
        return AccessRequestDto.builder()
                .id(r.getId()).patientEmail(r.getPatientEmail())
                .doctorEmail(r.getDoctorEmail()).recordId(r.getRecordId())
                .status(r.getStatus()).requestedAt(r.getRequestedAt())
                .respondedAt(r.getRespondedAt()).build();
    }

    private AuditLogDto toAuditResponse(AuditLog l) {
        return AuditLogDto.builder()
                .id(l.getId()).action(l.getAction()).userEmail(l.getUserEmail())
                .ipAddress(l.getIpAddress()).details(l.getDetails())
                .transactionHash(l.getTransactionHash()).timestamp(l.getTimestamp()).build();
    }

    private BlockchainTransactionDto toTransactionResponse(BlockchainTransaction t) {
        return BlockchainTransactionDto.builder()
                .id(t.getId()).transactionHash(t.getTransactionHash())
                .blockNumber(t.getBlockNumber()).timestamp(t.getTimestamp())
                .cid(t.getCid()).recordId(t.getRecordId()).build();
    }
}
