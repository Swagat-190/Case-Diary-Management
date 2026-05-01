package com.odishapolice.casediary.repository;

import com.odishapolice.casediary.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndReadAtIsNull(Long recipientId);

    long countByRecipientIdAndCreatedAtAfterAndReadAtIsNull(Long recipientId, LocalDateTime createdAfter);
}
