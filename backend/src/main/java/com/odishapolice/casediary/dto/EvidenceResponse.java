package com.odishapolice.casediary.dto;

import com.odishapolice.casediary.entity.Evidence;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EvidenceResponse {
    private Long id;
    private Long caseId;
    private String caseFirNumber;
    private String evidenceType;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String description;
    private String downloadUrl;
    private LocalDateTime uploadDate;
    private UserDTO uploadedBy;

    private String status;
    private LocalDateTime reviewedAt;
    private UserDTO reviewedBy;

    public static EvidenceResponse fromEntity(Evidence evidence) {
        EvidenceResponse response = new EvidenceResponse();
        response.setId(evidence.getId());
        response.setCaseId(evidence.getCaseEntity().getId());
        response.setCaseFirNumber(evidence.getCaseEntity().getFirNumber());
        response.setEvidenceType(evidence.getEvidenceType().name());
        response.setFileName(evidence.getFileName());
        response.setContentType(evidence.getContentType());
        response.setFileSize(evidence.getFileSize());
        response.setDescription(evidence.getDescription());
        response.setUploadDate(evidence.getUploadDate());
        response.setUploadedBy(UserDTO.fromEntity(evidence.getUploadedBy()));
        response.setStatus(evidence.getStatus() != null ? evidence.getStatus().name() : null);
        response.setReviewedAt(evidence.getReviewedAt());
        response.setReviewedBy(evidence.getReviewedBy() != null ? UserDTO.fromEntity(evidence.getReviewedBy()) : null);
        response.setDownloadUrl("http://localhost:8080/api/evidence/" + evidence.getId() + "/download");
        return response;
    }
}