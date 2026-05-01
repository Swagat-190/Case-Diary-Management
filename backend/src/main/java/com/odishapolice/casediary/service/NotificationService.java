package com.odishapolice.casediary.service;

import com.odishapolice.casediary.dto.NotificationResponse;
import com.odishapolice.casediary.entity.Case;
import com.odishapolice.casediary.entity.Evidence;
import com.odishapolice.casediary.entity.Notification;
import com.odishapolice.casediary.entity.User;
import com.odishapolice.casediary.repository.NotificationRepository;
import com.odishapolice.casediary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<NotificationResponse> getMyNotifications() {
        User currentUser = getCurrentUser();
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getMyUnreadCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByRecipientIdAndReadAtIsNull(currentUser.getId());
    }

    public void markAsRead(Long notificationId) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Forbidden");
        }

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    public void createCaseAssigned(User recipient, Case caseEntity) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(Notification.NotificationType.CASE_ASSIGNED);
        notification.setCaseId(caseEntity.getId());
        notification.setMessage("New case assigned: FIR " + caseEntity.getFirNumber());
        notificationRepository.save(notification);
    }

    public void createEvidencePendingReviewForSupervisors(Case caseEntity, Evidence evidence) {
        List<User> recipients = userRepository.findByRoleIn(Set.of(User.Role.SUPERVISOR, User.Role.ADMIN));

        for (User recipient : recipients) {
            Notification notification = new Notification();
            notification.setRecipient(recipient);
            notification.setType(Notification.NotificationType.EVIDENCE_PENDING_REVIEW);
            notification.setCaseId(caseEntity.getId());
            notification.setEvidenceId(evidence.getId());
            notification.setMessage("Evidence pending review for FIR " + caseEntity.getFirNumber());
            notificationRepository.save(notification);
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }

        return userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
