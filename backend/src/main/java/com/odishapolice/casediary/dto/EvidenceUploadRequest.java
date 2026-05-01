package com.odishapolice.casediary.dto;

import lombok.Data;

@Data
public class EvidenceUploadRequest {
    private Long caseId;
    private String evidenceType;
    private String description;
}