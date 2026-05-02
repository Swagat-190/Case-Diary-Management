package com.odishapolice.casediary.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.odishapolice.casediary.entity.User;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String fullName;
    private String batch;
    private String email;
    private String phoneNumber;
    private User.Role role;
    private String policeStation;
    private String designation;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private Boolean firstLogin;

    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setBatch(user.getBatch());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setPoliceStation(user.getPoliceStation());
        dto.setDesignation(user.getDesignation());
        dto.setFirstLogin(user.getFirstLogin());
        return dto;
    }
}