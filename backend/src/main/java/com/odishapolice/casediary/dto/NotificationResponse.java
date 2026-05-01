package com.odishapolice.casediary.dto;

import com.odishapolice.casediary.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String type;
    private String message;
    private Long caseId;
    private Long evidenceId;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType().name());
        response.setMessage(notification.getMessage());
        response.setCaseId(notification.getCaseId());
        response.setEvidenceId(notification.getEvidenceId());
        response.setCreatedAt(notification.getCreatedAt());
        response.setReadAt(notification.getReadAt());
        return response;
    }
}
