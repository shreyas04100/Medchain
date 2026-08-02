package com.medchain.module.medicalvault.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainTransactionDto {
    private Long id;
    private String transactionHash;
    private Long blockNumber;
    private OffsetDateTime timestamp;
    private String cid;
    private String recordId;
}
