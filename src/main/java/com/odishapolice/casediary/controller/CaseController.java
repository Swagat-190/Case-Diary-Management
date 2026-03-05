package com.odishapolice.casediary.controller;

import com.odishapolice.casediary.dto.CaseDTO;
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

    @GetMapping("/{id}")
    public ResponseEntity<CaseDTO> getCaseById(@PathVariable Long id) {
        return caseService.getCaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<CaseDTO>> getAllCases() {
        List<CaseDTO> cases = caseService.getAllCases();
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/officer/{officerId}")
    public ResponseEntity<List<CaseDTO>> getCasesByOfficer(@PathVariable Long officerId) {
        List<CaseDTO> cases = caseService.getCasesByOfficer(officerId);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CaseDTO>> getCasesByStatus(@PathVariable Case.CaseStatus status) {
        List<CaseDTO> cases = caseService.getCasesByStatus(status);
        return ResponseEntity.ok(cases);
    }
}