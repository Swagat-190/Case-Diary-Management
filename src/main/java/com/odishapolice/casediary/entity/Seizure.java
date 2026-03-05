package com.odishapolice.casediary.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "seizure")
public class Seizure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String itemDescription;

    private Integer quantity;

    private String seizedFrom;

    private LocalDate seizureDate;

    @ManyToOne
    @JoinColumn(name = "seized_by")
    private User seizedBy;

    private String storageLocation;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}