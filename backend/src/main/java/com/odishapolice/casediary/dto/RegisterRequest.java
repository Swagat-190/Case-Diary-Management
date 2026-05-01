package com.odishapolice.casediary.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String role;
    private String policeStation;
    private String designation;
}