package com.odishapolice.casediary.repository;

import com.odishapolice.casediary.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByCaseEntityIdOrderByUploadDateDesc(Long caseId);
    List<Evidence> findByUploadedByIdOrderByUploadDateDesc(Long userId);
}