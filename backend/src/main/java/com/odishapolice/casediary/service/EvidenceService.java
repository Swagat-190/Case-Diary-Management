package com.odishapolice.casediary.service;

import com.odishapolice.casediary.dto.EvidenceResponse;
import com.odishapolice.casediary.entity.Case;
import com.odishapolice.casediary.entity.Evidence;
import com.odishapolice.casediary.entity.User;
import com.odishapolice.casediary.repository.EvidenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import com.cloudinary.utils.ObjectUtils;

@Service
@RequiredArgsConstructor
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final CaseService caseService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final CloudinaryService cloudinaryService;

    @Value("${app.evidence.upload-dir:uploads/evidence}")
    private String uploadDir;

    public EvidenceResponse uploadEvidence(Long caseId, String evidenceType, String description, MultipartFile file) {
        ensureNonAdminAccess();
        Case caseEntity = caseService.getCaseEntityById(caseId);
        User uploadedBy = getCurrentUser();

        Evidence.EvidenceType resolvedType = Evidence.EvidenceType.valueOf(evidenceType.toUpperCase());
        String sanitizedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        try {
            // upload to Cloudinary
            Map uploadResult = cloudinaryService.upload(file, ObjectUtils.asMap("folder", "case_evidence"));
            String secureUrl = uploadResult.get("secure_url") != null ? uploadResult.get("secure_url").toString() : null;
            String publicId = uploadResult.get("public_id") != null ? uploadResult.get("public_id").toString() : null;

            Evidence evidence = new Evidence();
            evidence.setCaseEntity(caseEntity);
            evidence.setEvidenceType(resolvedType);
            evidence.setFileName(file.getOriginalFilename());
            evidence.setFilePath(secureUrl != null ? secureUrl : "");
            evidence.setContentType(file.getContentType());
            evidence.setFileSize(file.getSize());
            evidence.setUploadedBy(uploadedBy);
            evidence.setDescription(description);
            evidence.setQrCode("CASE-" + caseEntity.getId() + "-EVIDENCE-" + (publicId != null ? publicId : sanitizedFileName));

            evidence.setStatus(Evidence.EvidenceStatus.PENDING);
            evidence.setReviewedBy(null);
            evidence.setReviewedAt(null);

            Evidence saved = evidenceRepository.save(evidence);
            notificationService.createEvidencePendingReviewForSupervisors(caseEntity, saved);

            return EvidenceResponse.fromEntity(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store evidence file", e);
        }
    }

    public EvidenceResponse approveEvidence(Long evidenceId) {
        ensureSupervisorAccess();

        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found"));

        if (evidence.getStatus() != Evidence.EvidenceStatus.FINAL) {
            evidence.setStatus(Evidence.EvidenceStatus.FINAL);
            evidence.setReviewedBy(getCurrentUser());
            evidence.setReviewedAt(java.time.LocalDateTime.now());
            evidenceRepository.save(evidence);
        }

        return EvidenceResponse.fromEntity(evidence);
    }

    public List<EvidenceResponse> getEvidenceByCaseId(Long caseId) {
        ensureNonAdminAccess();
        return evidenceRepository.findByCaseEntityIdOrderByUploadDateDesc(caseId)
                .stream()
                .map(EvidenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Resource loadEvidenceFile(Long evidenceId) {
        ensureNonAdminAccess();
        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found"));

        try {
            String fp = evidence.getFilePath();
            if (fp != null && (fp.startsWith("http://") || fp.startsWith("https://"))) {
                Resource resource = new UrlResource(fp);
                if (!resource.exists()) {
                    throw new RuntimeException("Evidence file not found at remote URL");
                }
                return resource;
            } else {
                Path filePath = Paths.get(evidence.getFilePath()).toAbsolutePath().normalize();
                Resource resource = new UrlResource(filePath.toUri());
                if (!resource.exists()) {
                    throw new RuntimeException("Evidence file not found on disk");
                }
                return resource;
            }
        } catch (IOException e) {
            throw new RuntimeException("Unable to load evidence file", e);
        }
    }

    public Evidence getEvidenceEntity(Long evidenceId) {
        ensureNonAdminAccess();
        return evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found"));
    }

    private User getCurrentUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }

        return userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void ensureSupervisorAccess() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.Role.SUPERVISOR) {
            throw new RuntimeException("Only supervisors can perform this action");
        }
    }

    private void ensureNonAdminAccess() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Administrators cannot access evidence operations");
        }
    }
}