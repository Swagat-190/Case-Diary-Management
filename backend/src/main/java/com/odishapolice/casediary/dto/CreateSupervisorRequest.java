package com.odishapolice.casediary.dto;

import lombok.Data;

@Data
public class CreateSupervisorRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String policeStation;
    private String designation;
}
