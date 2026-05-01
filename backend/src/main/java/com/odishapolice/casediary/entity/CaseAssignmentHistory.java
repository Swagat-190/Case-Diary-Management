package com.odishapolice.casediary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "case_assignment_history")
public class CaseAssignmentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @ManyToOne
    @JoinColumn(name = "previous_officer_id")
    private User previousOfficer;

    @ManyToOne
    @JoinColumn(name = "new_officer_id", nullable = false)
    private User newOfficer;

    @ManyToOne
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private User assignedBy;

    @Column(nullable = false)
    private LocalDateTime assignmentDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (assignmentDate == null) {
            assignmentDate = LocalDateTime.now();
        }
        createdAt = LocalDateTime.now();
    }
}
