package com.odishapolice.casediary.dto;

import lombok.Data;

@Data
public class CreateIoOfficerRequest {
    private String fullName;
    private String batch;
    private String email;
    private String phoneNumber;
    private String policeStation;
    private String designation;
}