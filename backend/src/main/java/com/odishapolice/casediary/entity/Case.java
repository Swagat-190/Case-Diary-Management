package com.odishapolice.casediary.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cases")
public class Case {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String firNumber;

    @Column(nullable = false)
    private String policeStation;

    @Column(nullable = false)
    private String caseType;

    @Column(columnDefinition = "TEXT")
    private String ipcSections;

    @Column(nullable = false)
    private LocalDate dateOfFir;

    @ManyToOne
    @JoinColumn(name = "investigation_officer_id")
    private User investigationOfficer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus caseStatus = CaseStatus.OPEN;

    private String complainantName;
    private String complainantAddress;
    private String accusedName;
    private String accusedAddress;

    @Column(columnDefinition = "TEXT")
    private String crimeDescription;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CaseStatus {
        OPEN, UNDER_INVESTIGATION, CLOSED, CHARGE_SHEETED
    }
}