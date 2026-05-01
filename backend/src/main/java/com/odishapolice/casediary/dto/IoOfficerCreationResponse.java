package com.odishapolice.casediary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IoOfficerCreationResponse {
    private UserDTO user;
    private String username;
    private String temporaryPassword;
}