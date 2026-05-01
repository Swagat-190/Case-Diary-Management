package com.odishapolice.casediary.service;

import com.odishapolice.casediary.dto.AuthResponse;
import com.odishapolice.casediary.dto.LoginRequest;
import com.odishapolice.casediary.dto.RegisterRequest;
import com.odishapolice.casediary.dto.UserDTO;
import com.odishapolice.casediary.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest loginRequest) {
        User user = userService.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtService.generateToken(user);
        UserDTO userDTO = UserDTO.fromEntity(user);

        return new AuthResponse(token, userDTO);
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        User.Role requestedRole = User.Role.valueOf(registerRequest.getRole().toUpperCase());
        if (requestedRole != User.Role.SUPERVISOR) {
            throw new RuntimeException("Only supervisors can register from this endpoint");
        }

        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(registerRequest.getUsername());
        userDTO.setPassword(registerRequest.getPassword());
        userDTO.setEmail(registerRequest.getEmail());
        userDTO.setRole(requestedRole);
        userDTO.setPoliceStation(registerRequest.getPoliceStation());
        userDTO.setDesignation(registerRequest.getDesignation());

        UserDTO savedUser = userService.createUser(userDTO);

        // Auto-login after registration
        User user = userService.findByUsername(savedUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User creation failed"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, savedUser);
    }
}