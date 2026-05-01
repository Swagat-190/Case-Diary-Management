package com.odishapolice.casediary.controller;

import com.odishapolice.casediary.dto.EvidenceResponse;
import com.odishapolice.casediary.service.EvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/evidence")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping("/upload")
    public ResponseEntity<EvidenceResponse> uploadEvidence(
            @RequestParam("file") MultipartFile file,
            @RequestParam("caseId") Long caseId,
            @RequestParam("evidenceType") String evidenceType,
            @RequestParam(value = "description", required = false) String description
    ) {
        try {
            return ResponseEntity.ok(evidenceService.uploadEvidence(caseId, evidenceType, description, file));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<EvidenceResponse>> getCaseEvidence(@PathVariable Long caseId) {
        return ResponseEntity.ok(evidenceService.getEvidenceByCaseId(caseId));
    }

    @GetMapping("/{evidenceId}/download")
    public ResponseEntity<Resource> downloadEvidence(@PathVariable Long evidenceId) {
        try {
            EvidenceResponse evidence = EvidenceResponse.fromEntity(evidenceService.getEvidenceEntity(evidenceId));
            Resource resource = evidenceService.loadEvidenceFile(evidenceId);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            evidence.getContentType() != null ? evidence.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + evidence.getFileName() + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{evidenceId}/approve")
    public ResponseEntity<EvidenceResponse> approveEvidence(@PathVariable Long evidenceId) {
        try {
            return ResponseEntity.ok(evidenceService.approveEvidence(evidenceId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }
}