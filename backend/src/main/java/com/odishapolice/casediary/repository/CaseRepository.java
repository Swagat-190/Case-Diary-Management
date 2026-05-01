package com.odishapolice.casediary.repository;

import com.odishapolice.casediary.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CaseRepository extends JpaRepository<Case, Long> {
    Optional<Case> findByFirNumber(String firNumber);
    List<Case> findByInvestigationOfficerId(Long officerId);
    List<Case> findByCaseStatus(Case.CaseStatus status);
    List<Case> findByPoliceStation(String policeStation);

    @Query("SELECT c FROM Case c WHERE c.investigationOfficer.id = :officerId AND c.caseStatus = :status")
    List<Case> findByOfficerAndStatus(@Param("officerId") Long officerId, @Param("status") Case.CaseStatus status);

    @Query("SELECT COUNT(c) FROM Case c WHERE c.caseStatus = 'OPEN'")
    long countOpenCases();

    @Query("SELECT COUNT(c) FROM Case c WHERE c.caseStatus = 'CLOSED'")
    long countClosedCases();
}