package com.odishapolice.casediary.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String fullName;

    private String batch;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String policeStation;
    private String designation;

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

    public enum Role {
        IO, SUPERVISOR, ADMIN
    }
}