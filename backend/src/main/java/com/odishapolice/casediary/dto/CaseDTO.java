package com.odishapolice.casediary.dto;

import com.odishapolice.casediary.entity.Case;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CaseDTO {
    private Long id;
    private String firNumber;
    private String policeStation;
    private String caseType;
    private String ipcSections;
    private LocalDate dateOfFir;
    private UserDTO investigationOfficer;
    private Case.CaseStatus caseStatus;
    private String complainantName;
    private String complainantAddress;
    private String accusedName;
    private String accusedAddress;
    private String crimeDescription;

    public static CaseDTO fromEntity(Case caseEntity) {
        CaseDTO dto = new CaseDTO();
        dto.setId(caseEntity.getId());
        dto.setFirNumber(caseEntity.getFirNumber());
        dto.setPoliceStation(caseEntity.getPoliceStation());
        dto.setCaseType(caseEntity.getCaseType());
        dto.setIpcSections(caseEntity.getIpcSections());
        dto.setDateOfFir(caseEntity.getDateOfFir());
        dto.setInvestigationOfficer(caseEntity.getInvestigationOfficer() != null ?
            UserDTO.fromEntity(caseEntity.getInvestigationOfficer()) : null);
        dto.setCaseStatus(caseEntity.getCaseStatus());
        dto.setComplainantName(caseEntity.getComplainantName());
        dto.setComplainantAddress(caseEntity.getComplainantAddress());
        dto.setAccusedName(caseEntity.getAccusedName());
        dto.setAccusedAddress(caseEntity.getAccusedAddress());
        dto.setCrimeDescription(caseEntity.getCrimeDescription());
        return dto;
    }
}