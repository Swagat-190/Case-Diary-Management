package com.odishapolice.casediary.controller;

import com.odishapolice.casediary.dto.CaseDiaryRequest;
import com.odishapolice.casediary.dto.CaseDiaryResponse;
import com.odishapolice.casediary.service.CaseDiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/case-diary")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaseDiaryController {

    private final CaseDiaryService caseDiaryService;

    @PostMapping
    public ResponseEntity<CaseDiaryResponse> createDiaryEntry(@RequestBody CaseDiaryRequest request) {
        try {
            return ResponseEntity.ok(caseDiaryService.createEntry(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<CaseDiaryResponse>> getCaseDiaryEntries(@PathVariable Long caseId) {
        return ResponseEntity.ok(caseDiaryService.getEntriesByCaseId(caseId));
    }
}