package com.odishapolice.casediary.dto;

import lombok.Data;

@Data
public class CaseAssignmentRequest {
    private Long newOfficerId;
    private String notes;
}
