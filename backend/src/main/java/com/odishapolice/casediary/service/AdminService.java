package com.odishapolice.casediary.service;

import com.odishapolice.casediary.dto.CreateSupervisorRequest;
import com.odishapolice.casediary.dto.SupervisorCreationResponse;
import com.odishapolice.casediary.dto.UserDTO;
import com.odishapolice.casediary.entity.User;
import com.odishapolice.casediary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public SupervisorCreationResponse createSupervisor(CreateSupervisorRequest request) {
        ensureAdminAccess();

        String username = userService.generateUniqueUsername(request.getFullName(), request.getPoliceStation());
        String temporaryPassword = userService.generateTemporaryPassword();

        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(username);
        userDTO.setFullName(request.getFullName());
        userDTO.setPassword(temporaryPassword);
        userDTO.setEmail(request.getEmail());
        userDTO.setPhoneNumber(request.getPhoneNumber());
        userDTO.setRole(User.Role.SUPERVISOR);
        userDTO.setPoliceStation(request.getPoliceStation());
        userDTO.setDesignation(request.getDesignation());

        UserDTO savedUser = userService.createUser(userDTO);
        SupervisorCreationResponse response = new SupervisorCreationResponse(savedUser, username, temporaryPassword);

        // Send credentials via email
        try {
            emailService.sendSupervisorCredentials(
                request.getEmail(),
                request.getFullName(),
                username,
                temporaryPassword
            );
        } catch (Exception e) {
            // Log the error but don't fail the creation
            System.err.println("Failed to send supervisor credentials email: " + e.getMessage());
            // You might want to add proper logging here
        }

        return response;
    }

    public void deleteSupervisor(Long supervisorId) {
        ensureAdminAccess();

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new RuntimeException("Supervisor not found"));

        if (supervisor.getRole() != User.Role.SUPERVISOR) {
            throw new RuntimeException("Only supervisor accounts can be deleted by admin");
        }

        userRepository.delete(supervisor);
    }

    public List<UserDTO> getSupervisors() {
        ensureAdminAccess();
        return userService.getSupervisors();
    }

    private void ensureAdminAccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (!isAdmin) {
            throw new RuntimeException("Only administrators can perform this action");
        }
    }
}
