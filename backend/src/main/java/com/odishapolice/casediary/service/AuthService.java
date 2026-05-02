package com.odishapolice.casediary.service;

import com.odishapolice.casediary.controller.AuthController;
import com.odishapolice.casediary.dto.AuthResponse;
import com.odishapolice.casediary.dto.LoginRequest;
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
        String identifier = loginRequest.getUsernameOrEmail();
        User user = userService.findByEmail(identifier)
                .or(() -> userService.findByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("Invalid email/username or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email/username or password");
        }

        String token = jwtService.generateToken(user);
        UserDTO userDTO = UserDTO.fromEntity(user);

        return new AuthResponse(token, userDTO);
    }

    public void changePassword(AuthController.ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userService.save(user);
    }

    private User getCurrentUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }

        return userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}