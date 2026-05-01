package com.odishapolice.casediary.dto;

import com.odishapolice.casediary.entity.Case;
import lombok.Data;

@Data
public class CaseStatusUpdateRequest {
    private Case.CaseStatus status;
}
