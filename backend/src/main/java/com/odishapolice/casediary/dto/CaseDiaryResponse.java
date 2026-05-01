package com.odishapolice.casediary.dto;

import com.odishapolice.casediary.entity.CaseDiary;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CaseDiaryResponse {
    private Long id;
    private Long caseId;
    private String caseFirNumber;
    private String section;
    private String content;
    private LocalDateTime entryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDTO officer;

    public static CaseDiaryResponse fromEntity(CaseDiary caseDiary) {
        CaseDiaryResponse response = new CaseDiaryResponse();
        response.setId(caseDiary.getId());
        response.setCaseId(caseDiary.getCaseEntity().getId());
        response.setCaseFirNumber(caseDiary.getCaseEntity().getFirNumber());
        response.setSection(caseDiary.getSection());
        response.setContent(caseDiary.getContent());
        response.setEntryDate(caseDiary.getEntryDate());
        response.setCreatedAt(caseDiary.getCreatedAt());
        response.setUpdatedAt(caseDiary.getUpdatedAt());
        response.setOfficer(UserDTO.fromEntity(caseDiary.getOfficer()));
        return response;
    }
}