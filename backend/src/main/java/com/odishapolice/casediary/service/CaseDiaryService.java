package com.odishapolice.casediary.service;

import com.odishapolice.casediary.dto.CaseDiaryRequest;
import com.odishapolice.casediary.dto.CaseDiaryResponse;
import com.odishapolice.casediary.dto.PendencyAlertResponse;
import com.odishapolice.casediary.entity.Case;
import com.odishapolice.casediary.entity.CaseDiary;
import com.odishapolice.casediary.entity.User;
import com.odishapolice.casediary.repository.CaseDiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseDiaryService {

    private final CaseDiaryRepository caseDiaryRepository;
    private final CaseService caseService;
    private final UserService userService;

    public CaseDiaryResponse createEntry(CaseDiaryRequest request) {
        Case caseEntity = caseService.getCaseEntityById(request.getCaseId());
        User officer = getCurrentUser();

        CaseDiary caseDiary = new CaseDiary();
        caseDiary.setCaseEntity(caseEntity);
        caseDiary.setSection(request.getSection());
        caseDiary.setContent(request.getContent());
        caseDiary.setOfficer(officer);
        caseDiary.setEntryDate(LocalDateTime.now());

        return CaseDiaryResponse.fromEntity(caseDiaryRepository.save(caseDiary));
    }

    public List<CaseDiaryResponse> getEntriesByCaseId(Long caseId) {
        return caseDiaryRepository.findByCaseEntityIdOrderByEntryDateDesc(caseId)
                .stream()
                .map(CaseDiaryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PendencyAlertResponse> getPendencyAlerts() {
        List<Case> cases = caseService.getAllCaseEntities();
        List<PendencyAlertResponse> alerts = new ArrayList<>();

        for (Case caseEntity : cases) {
            List<CaseDiary> diaryEntries = caseDiaryRepository.findByCaseEntityIdOrderByEntryDateDesc(caseEntity.getId());
            if (diaryEntries.isEmpty()) {
                continue;
            }

            CaseDiary latestEntry = diaryEntries.get(0);
            long daysSinceLastEntry = ChronoUnit.DAYS.between(latestEntry.getEntryDate().toLocalDate(), LocalDateTime.now().toLocalDate());
            boolean overdue = (caseEntity.getCaseStatus() == Case.CaseStatus.OPEN || caseEntity.getCaseStatus() == Case.CaseStatus.UNDER_INVESTIGATION)
                    && daysSinceLastEntry > 3;

            if (!overdue) {
                continue;
            }

            PendencyAlertResponse alert = new PendencyAlertResponse();
            alert.setCaseId(caseEntity.getId());
            alert.setFirNumber(caseEntity.getFirNumber());
            alert.setPoliceStation(caseEntity.getPoliceStation());
            alert.setCaseStatus(caseEntity.getCaseStatus());
            alert.setDiaryCount(diaryEntries.size());
            alert.setLastDiaryEntryDate(latestEntry.getEntryDate());
            alert.setDaysSinceLastDiaryEntry(daysSinceLastEntry);
            alert.setOverdue(true);
            alerts.add(alert);
        }

        return alerts;
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