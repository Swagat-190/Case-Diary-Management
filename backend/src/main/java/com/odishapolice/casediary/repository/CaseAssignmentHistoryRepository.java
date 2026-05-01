package com.odishapolice.casediary.repository;

import com.odishapolice.casediary.entity.CaseAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CaseAssignmentHistoryRepository extends JpaRepository<CaseAssignmentHistory, Long> {
    List<CaseAssignmentHistory> findByCaseEntityIdOrderByAssignmentDateDesc(Long caseId);
    List<CaseAssignmentHistory> findByNewOfficerIdOrderByAssignmentDateDesc(Long officerId);
    List<CaseAssignmentHistory> findByPreviousOfficerIdOrderByAssignmentDateDesc(Long officerId);
}
