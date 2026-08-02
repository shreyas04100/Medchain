package com.medchain.module.medicalvault.entity;

import com.medchain.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "blockchain_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainTransaction extends BaseEntity {

    @Column(nullable = false)
    private String transactionHash;

    @Column(nullable = false)
    private Long blockNumber;

    @Column(nullable = false)
    private OffsetDateTime timestamp;

    @Column(nullable = false)
    private String cid;

    @Column(nullable = false)
    private String recordId;
}
