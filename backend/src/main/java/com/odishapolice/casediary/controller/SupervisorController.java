package com.odishapolice.casediary.controller;

import com.odishapolice.casediary.dto.CreateIoOfficerRequest;
import com.odishapolice.casediary.dto.IoOfficerCreationResponse;
import com.odishapolice.casediary.dto.PendencyAlertResponse;
import com.odishapolice.casediary.dto.UserDTO;
import com.odishapolice.casediary.service.CaseDiaryService;
import com.odishapolice.casediary.service.EmailService;
import com.odishapolice.casediary.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/supervisor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupervisorController {

    private final UserService userService;
    private final CaseDiaryService caseDiaryService;
    private final EmailService emailService;

    @PostMapping("/io-officers")
    public ResponseEntity<IoOfficerCreationResponse> createIoOfficer(@RequestBody CreateIoOfficerRequest request) {
        try {
            IoOfficerCreationResponse response = userService.createIoOfficer(request);

            // Send credentials via email
            try {
                emailService.sendIoCredentials(
                    request.getEmail(),
                    request.getFullName(),
                    response.getUsername(),
                    response.getTemporaryPassword()
                );
            } catch (Exception e) {
                // Log the error but don't fail the creation
                System.err.println("Failed to send IO credentials email: " + e.getMessage());
            }

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/pendency-alerts")
    public ResponseEntity<List<PendencyAlertResponse>> getPendencyAlerts() {
        try {
            return ResponseEntity.ok(caseDiaryService.getPendencyAlerts());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/io-officers")
    public ResponseEntity<List<UserDTO>> getIoOfficers() {
        try {
            return ResponseEntity.ok(userService.getIoOfficers());
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }
}