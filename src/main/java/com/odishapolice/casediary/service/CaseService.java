package com.odishapolice.casediary.service;

import com.odishapolice.casediary.dto.CaseDTO;
import com.odishapolice.casediary.entity.Case;
import com.odishapolice.casediary.entity.User;
import com.odishapolice.casediary.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final UserService userService;

    public CaseDTO createCase(CaseDTO caseDTO) {
        if (caseRepository.findByFirNumber(caseDTO.getFirNumber()).isPresent()) {
            throw new RuntimeException("FIR number already exists");
        }

        Case caseEntity = new Case();
        caseEntity.setFirNumber(caseDTO.getFirNumber());
        caseEntity.setPoliceStation(caseDTO.getPoliceStation());
        caseEntity.setCaseType(caseDTO.getCaseType());
        caseEntity.setIpcSections(caseDTO.getIpcSections());
        caseEntity.setDateOfFir(caseDTO.getDateOfFir());
        caseEntity.setCaseStatus(caseDTO.getCaseStatus() != null ? caseDTO.getCaseStatus() : Case.CaseStatus.OPEN);
        caseEntity.setComplainantName(caseDTO.getComplainantName());
        caseEntity.setComplainantAddress(caseDTO.getComplainantAddress());
        caseEntity.setAccusedName(caseDTO.getAccusedName());
        caseEntity.setAccusedAddress(caseDTO.getAccusedAddress());
        caseEntity.setCrimeDescription(caseDTO.getCrimeDescription());

        if (caseDTO.getInvestigationOfficer() != null && caseDTO.getInvestigationOfficer().getId() != null) {
            User officer = userService.findByUsername(caseDTO.getInvestigationOfficer().getUsername())
                    .orElseThrow(() -> new RuntimeException("Investigation officer not found"));
            caseEntity.setInvestigationOfficer(officer);
        }

        Case savedCase = caseRepository.save(caseEntity);
        return CaseDTO.fromEntity(savedCase);
    }

    public CaseDTO updateCase(Long id, CaseDTO caseDTO) {
        Case existingCase = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        existingCase.setPoliceStation(caseDTO.getPoliceStation());
        existingCase.setCaseType(caseDTO.getCaseType());
        existingCase.setIpcSections(caseDTO.getIpcSections());
        existingCase.setCaseStatus(caseDTO.getCaseStatus());
        existingCase.setComplainantName(caseDTO.getComplainantName());
        existingCase.setComplainantAddress(caseDTO.getComplainantAddress());
        existingCase.setAccusedName(caseDTO.getAccusedName());
        existingCase.setAccusedAddress(caseDTO.getAccusedAddress());
        existingCase.setCrimeDescription(caseDTO.getCrimeDescription());

        if (caseDTO.getInvestigationOfficer() != null && caseDTO.getInvestigationOfficer().getId() != null) {
            User officer = userService.findByUsername(caseDTO.getInvestigationOfficer().getUsername())
                    .orElseThrow(() -> new RuntimeException("Investigation officer not found"));
            existingCase.setInvestigationOfficer(officer);
        }

        Case updatedCase = caseRepository.save(existingCase);
        return CaseDTO.fromEntity(updatedCase);
    }

    public Optional<CaseDTO> getCaseById(Long id) {
        return caseRepository.findById(id).map(CaseDTO::fromEntity);
    }

    public List<CaseDTO> getAllCases() {
        return caseRepository.findAll().stream()
                .map(CaseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CaseDTO> getCasesByOfficer(Long officerId) {
        return caseRepository.findByInvestigationOfficerId(officerId).stream()
                .map(CaseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CaseDTO> getCasesByStatus(Case.CaseStatus status) {
        return caseRepository.findByCaseStatus(status).stream()
                .map(CaseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}