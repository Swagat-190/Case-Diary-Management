package com.odishapolice.casediary.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "case_diary")
public class CaseDiary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(nullable = false)
    private LocalDateTime entryDate;

    @Column(nullable = false)
    private String section;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ManyToOne
    @JoinColumn(name = "officer_id", nullable = false)
    private User officer;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (entryDate == null) {
            entryDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}