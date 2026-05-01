package com.odishapolice.casediary.controller;

import com.odishapolice.casediary.dto.NotificationResponse;
import com.odishapolice.casediary.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getMyUnreadCount() {
        return ResponseEntity.ok(notificationService.getMyUnreadCount());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }
}
