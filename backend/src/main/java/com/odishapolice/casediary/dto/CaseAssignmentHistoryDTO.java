package com.odishapolice.casediary.dto;

import com.odishapolice.casediary.entity.CaseAssignmentHistory;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CaseAssignmentHistoryDTO {
    private Long id;
    private Long caseId;
    private UserDTO previousOfficer;
    private UserDTO newOfficer;
    private UserDTO assignedBy;
    private LocalDateTime assignmentDate;
    private String notes;

    public static CaseAssignmentHistoryDTO fromEntity(CaseAssignmentHistory entity) {
        CaseAssignmentHistoryDTO dto = new CaseAssignmentHistoryDTO();
        dto.setId(entity.getId());
        dto.setCaseId(entity.getCaseEntity().getId());
        dto.setPreviousOfficer(entity.getPreviousOfficer() != null ? UserDTO.fromEntity(entity.getPreviousOfficer()) : null);
        dto.setNewOfficer(UserDTO.fromEntity(entity.getNewOfficer()));
        dto.setAssignedBy(UserDTO.fromEntity(entity.getAssignedBy()));
        dto.setAssignmentDate(entity.getAssignmentDate());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
