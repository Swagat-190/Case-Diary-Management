package com.odishapolice.casediary.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "evidence_log")
public class Evidence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvidenceType evidenceType;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String contentType;

    private Long fileSize;

    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvidenceStatus status = EvidenceStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    private String qrCode;

    @Column(columnDefinition = "TEXT")
    private String description;

    @PrePersist
    protected void onCreate() {
        uploadDate = LocalDateTime.now();
    }

    public enum EvidenceType {
        PHOTO, VIDEO, AUDIO, DOCUMENT, FORENSIC_REPORT
    }

    public enum EvidenceStatus {
        PENDING, FINAL
    }
}