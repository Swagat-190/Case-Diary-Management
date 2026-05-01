package com.odishapolice.casediary.dto;

import com.odishapolice.casediary.entity.Case;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PendencyAlertResponse {
    private Long caseId;
    private String firNumber;
    private String policeStation;
    private Case.CaseStatus caseStatus;
    private long diaryCount;
    private LocalDateTime lastDiaryEntryDate;
    private long daysSinceLastDiaryEntry;
    private boolean overdue;
}