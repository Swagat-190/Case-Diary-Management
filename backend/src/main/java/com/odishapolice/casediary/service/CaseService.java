package com.odishapolice.casediary.service;

import com.odishapolice.casediary.dto.CaseAssignmentHistoryDTO;
import com.odishapolice.casediary.dto.CaseDTO;
import com.odishapolice.casediary.entity.CaseAssignmentHistory;
import com.odishapolice.casediary.entity.Case;
import com.odishapolice.casediary.entity.User;
import com.odishapolice.casediary.repository.CaseAssignmentHistoryRepository;
import com.odishapolice.casediary.repository.CaseRepository;
import com.odishapolice.casediary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {

    private static final Logger log = LoggerFactory.getLogger(CaseService.class);
    private final CaseRepository caseRepository;
    private final CaseAssignmentHistoryRepository caseAssignmentHistoryRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public CaseDTO createCase(CaseDTO caseDTO) {
        ensureSupervisorAccess();

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

        if (savedCase.getInvestigationOfficer() != null) {
            notificationService.createCaseAssigned(savedCase.getInvestigationOfficer(), savedCase);
        }

        return CaseDTO.fromEntity(savedCase);
    }

    public CaseDTO updateCase(Long id, CaseDTO caseDTO) {
        ensureSupervisorAccess();

        Case existingCase = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        User previousOfficer = existingCase.getInvestigationOfficer();

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

        User newOfficer = updatedCase.getInvestigationOfficer();
        if (newOfficer != null && (previousOfficer == null || !newOfficer.getId().equals(previousOfficer.getId()))) {
            notificationService.createCaseAssigned(newOfficer, updatedCase);
        }

        return CaseDTO.fromEntity(updatedCase);
    }

    public Optional<CaseDTO> getCaseById(Long id) {
        return caseRepository.findById(id).map(CaseDTO::fromEntity);
    }

    public Case getCaseEntityById(Long id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
    }

    public List<CaseDTO> getAllCases() {
        return caseRepository.findAll().stream()
                .map(CaseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<Case> getAllCaseEntities() {
        return caseRepository.findAll();
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

    public List<CaseDTO> getCasesForCurrentUser() {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == User.Role.SUPERVISOR || currentUser.getRole() == User.Role.ADMIN) {
            return getAllCases();
        }

        if (currentUser.getRole() == User.Role.IO) {
            return caseRepository.findByInvestigationOfficerId(currentUser.getId()).stream()
                    .map(CaseDTO::fromEntity)
                    .collect(Collectors.toList());
        }

        return List.of();
    }

    public CaseAssignmentHistoryDTO assignCase(Long caseId, Long newOfficerId) {
        ensureSupervisorAccess();

        Case caseEntity = getCaseEntityById(caseId);
        User newOfficer = getUserEntityById(newOfficerId);
        User assignedBy = getCurrentUser();
        User previousOfficer = caseEntity.getInvestigationOfficer();

        caseEntity.setInvestigationOfficer(newOfficer);
        caseRepository.save(caseEntity);

        notificationService.createCaseAssigned(newOfficer, caseEntity);

        log.info("Assigning case {} to officer {} by {}", caseId, newOfficer.getUsername(), assignedBy.getUsername());

        CaseAssignmentHistory history = new CaseAssignmentHistory();
        history.setCaseEntity(caseEntity);
        history.setPreviousOfficer(previousOfficer);
        history.setNewOfficer(newOfficer);
        history.setAssignedBy(assignedBy);
        history.setAssignmentDate(LocalDateTime.now());
        history.setNotes("Case assigned");

        return CaseAssignmentHistoryDTO.fromEntity(caseAssignmentHistoryRepository.save(history));
    }

    public CaseAssignmentHistoryDTO reassignCase(Long caseId, Long newOfficerId, String notes) {
        ensureSupervisorAccess();

        Case caseEntity = getCaseEntityById(caseId);
        User newOfficer = getUserEntityById(newOfficerId);
        User assignedBy = getCurrentUser();
        User previousOfficer = caseEntity.getInvestigationOfficer();

        caseEntity.setInvestigationOfficer(newOfficer);
        caseRepository.save(caseEntity);

        notificationService.createCaseAssigned(newOfficer, caseEntity);

        log.info("Reassigning case {} from {} to {} by {}", caseId,
            previousOfficer != null ? previousOfficer.getUsername() : "<none>",
            newOfficer.getUsername(), assignedBy.getUsername());

        CaseAssignmentHistory history = new CaseAssignmentHistory();
        history.setCaseEntity(caseEntity);
        history.setPreviousOfficer(previousOfficer);
        history.setNewOfficer(newOfficer);
        history.setAssignedBy(assignedBy);
        history.setAssignmentDate(LocalDateTime.now());
        history.setNotes(notes != null && !notes.isBlank() ? notes : "Case reassigned");

        return CaseAssignmentHistoryDTO.fromEntity(caseAssignmentHistoryRepository.save(history));
    }

    public CaseDTO updateCaseStatus(Long caseId, Case.CaseStatus newStatus) {
        if (newStatus == null) {
            throw new RuntimeException("Status is required");
        }

        Case caseEntity = getCaseEntityById(caseId);
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == User.Role.SUPERVISOR || currentUser.getRole() == User.Role.ADMIN) {
            caseEntity.setCaseStatus(newStatus);
            return CaseDTO.fromEntity(caseRepository.save(caseEntity));
        }

        if (currentUser.getRole() == User.Role.IO) {
            if (caseEntity.getInvestigationOfficer() == null || !caseEntity.getInvestigationOfficer().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Only the assigned IO can update this case status");
            }

            if (newStatus != Case.CaseStatus.UNDER_INVESTIGATION) {
                throw new RuntimeException("IO can only set status to UNDER_INVESTIGATION");
            }

            caseEntity.setCaseStatus(Case.CaseStatus.UNDER_INVESTIGATION);
            return CaseDTO.fromEntity(caseRepository.save(caseEntity));
        }

        throw new RuntimeException("Forbidden");
    }

    public List<CaseAssignmentHistoryDTO> getCaseAssignmentHistory(Long caseId) {
        return caseAssignmentHistoryRepository.findByCaseEntityIdOrderByAssignmentDateDesc(caseId).stream()
                .map(CaseAssignmentHistoryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }

        return userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void ensureSupervisorAccess() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.Role.SUPERVISOR && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only supervisors can perform this action");
        }
    }

    private User getUserEntityById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}