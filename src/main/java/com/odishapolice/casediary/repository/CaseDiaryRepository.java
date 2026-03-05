package com.odishapolice.casediary.repository;

import com.odishapolice.casediary.entity.CaseDiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CaseDiaryRepository extends JpaRepository<CaseDiary, Long> {
    List<CaseDiary> findByCaseEntityIdOrderByEntryDateDesc(Long caseId);
    List<CaseDiary> findByOfficerIdOrderByEntryDateDesc(Long officerId);
}