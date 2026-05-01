package com.odishapolice.casediary.service;

import com.odishapolice.casediary.dto.CreateIoOfficerRequest;
import com.odishapolice.casediary.dto.IoOfficerCreationResponse;
import com.odishapolice.casediary.dto.UserDTO;
import com.odishapolice.casediary.entity.User;
import com.odishapolice.casediary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setFullName(userDTO.getFullName());
        user.setBatch(userDTO.getBatch());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setEmail(userDTO.getEmail());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setRole(userDTO.getRole());
        user.setPoliceStation(userDTO.getPoliceStation());
        user.setDesignation(userDTO.getDesignation());

        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    public IoOfficerCreationResponse createIoOfficer(CreateIoOfficerRequest request) {
        ensureSupervisorAccess();

        String username = generateUniqueUsername(request.getFullName(), request.getBatch());
        String temporaryPassword = generateTemporaryPassword();

        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(username);
        userDTO.setFullName(request.getFullName());
        userDTO.setBatch(request.getBatch());
        userDTO.setPassword(temporaryPassword);
        userDTO.setEmail(request.getEmail());
        userDTO.setPhoneNumber(request.getPhoneNumber());
        userDTO.setRole(User.Role.IO);
        userDTO.setPoliceStation(request.getPoliceStation());
        userDTO.setDesignation(request.getDesignation());

        UserDTO savedUser = createUser(userDTO);
        return new IoOfficerCreationResponse(savedUser, username, temporaryPassword);
    }

    private void ensureSupervisorAccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isSupervisor = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_SUPERVISOR".equals(authority.getAuthority()));

        if (!isSupervisor) {
            throw new RuntimeException("Only supervisors can create IO accounts");
        }
    }

    private String generateUniqueUsername(String fullName, String batch) {
        String normalizedName = fullName == null ? "io" : fullName.toLowerCase().replaceAll("[^a-z0-9]+", ".");
        normalizedName = normalizedName.replaceAll("^\\.|\\.$", "");
        String normalizedBatch = batch == null ? "batch" : batch.toLowerCase().replaceAll("[^a-z0-9]+", "");

        String candidate = normalizedName + "." + normalizedBatch;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = normalizedName + "." + normalizedBatch + "." + counter;
            counter++;
        }

        return candidate;
    }

    private String generateTemporaryPassword() {
        SecureRandom secureRandom = new SecureRandom();
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            password.append(PASSWORD_CHARS.charAt(secureRandom.nextInt(PASSWORD_CHARS.length())));
        }
        return password.toString();
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getIoOfficers() {
        return userRepository.findByRole(User.Role.IO).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id).map(UserDTO::fromEntity);
    }
}