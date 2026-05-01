package com.odishapolice.casediary.dto;

import lombok.Data;

@Data
public class CaseDiaryRequest {
    private Long caseId;
    private String section;
    private String content;
}