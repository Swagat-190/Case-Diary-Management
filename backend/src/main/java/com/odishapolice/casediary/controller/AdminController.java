package com.odishapolice.casediary.controller;

import com.odishapolice.casediary.dto.CreateSupervisorRequest;
import com.odishapolice.casediary.dto.SupervisorCreationResponse;
import com.odishapolice.casediary.dto.UserDTO;
import com.odishapolice.casediary.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/create-supervisor")
    public ResponseEntity<SupervisorCreationResponse> createSupervisor(
            @RequestBody CreateSupervisorRequest request) {
        try {
            SupervisorCreationResponse response = adminService.createSupervisor(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/supervisors")
    public ResponseEntity<List<UserDTO>> getSupervisors() {
        try {
            return ResponseEntity.ok(adminService.getSupervisors());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/supervisors/{supervisorId}")
    public ResponseEntity<Void> deleteSupervisor(@PathVariable Long supervisorId) {
        try {
            adminService.deleteSupervisor(supervisorId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
