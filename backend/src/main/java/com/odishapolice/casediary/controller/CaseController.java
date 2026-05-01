package com.odishapolice.casediary.controller;

import com.odishapolice.casediary.dto.CaseDTO;
import com.odishapolice.casediary.dto.CaseAssignmentHistoryDTO;
import com.odishapolice.casediary.dto.CaseAssignmentRequest;
import com.odishapolice.casediary.dto.CaseStatusUpdateRequest;
import com.odishapolice.casediary.entity.Case;
import com.odishapolice.casediary.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaseController {

    private final CaseService caseService;

    @PostMapping
    public ResponseEntity<CaseDTO> createCase(@RequestBody CaseDTO caseDTO) {
        try {
            CaseDTO createdCase = caseService.createCase(caseDTO);
            return ResponseEntity.ok(createdCase);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseDTO> updateCase(@PathVariable Long id, @RequestBody CaseDTO caseDTO) {
        try {
            CaseDTO updatedCase = caseService.updateCase(id, caseDTO);
            return ResponseEntity.ok(updatedCase);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CaseDTO> updateCaseStatus(@PathVariable Long id, @RequestBody CaseStatusUpdateRequest request) {
        try {
            if (request == null || request.getStatus() == null) {
                return ResponseEntity.badRequest().build();
            }
            CaseDTO updatedCase = caseService.updateCaseStatus(id, request.getStatus());
            return ResponseEntity.ok(updatedCase);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDTO> getCaseById(@PathVariable Long id) {
        return caseService.getCaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<CaseDTO>> getAllCases() {
        // This now returns cases based on user role
        List<CaseDTO> cases = caseService.getCasesForCurrentUser();
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/my-cases")
    public ResponseEntity<List<CaseDTO>> getMyCases() {
        List<CaseDTO> cases = caseService.getCasesForCurrentUser();
        return ResponseEntity.ok(cases);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<CaseAssignmentHistoryDTO> assignCase(
            @PathVariable Long id,
            @RequestBody CaseAssignmentRequest request) {
        try {
            CaseAssignmentHistoryDTO assignment = caseService.assignCase(id, request.getNewOfficerId());
            return ResponseEntity.ok(assignment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/reassign")
    public ResponseEntity<CaseAssignmentHistoryDTO> reassignCase(
            @PathVariable Long id,
            @RequestBody CaseAssignmentRequest request) {
        try {
            CaseAssignmentHistoryDTO assignment = caseService.reassignCase(id, request.getNewOfficerId(), request.getNotes());
            return ResponseEntity.ok(assignment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/assignment-history")
    public ResponseEntity<List<CaseAssignmentHistoryDTO>> getCaseAssignmentHistory(@PathVariable Long id) {
        List<CaseAssignmentHistoryDTO> history = caseService.getCaseAssignmentHistory(id);
        return ResponseEntity.ok(history);
    }
}