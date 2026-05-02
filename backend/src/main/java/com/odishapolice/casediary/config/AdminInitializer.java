package com.odishapolice.casediary.config;

import com.odishapolice.casediary.entity.User;
import com.odishapolice.casediary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByUsername("admin").isPresent()) {
            log.info("Admin user already exists. Skipping initialization.");
            return;
        }

        try {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin@123"));
            adminUser.setEmail("admin@odishapolice.gov.in");
            adminUser.setFullName("System Administrator");
            adminUser.setRole(User.Role.ADMIN);
            adminUser.setPhoneNumber("9999999999");
            adminUser.setPoliceStation("Central HQ");
            adminUser.setDesignation("Administrator");

            userRepository.save(adminUser);
            log.info("Admin user created successfully with username: admin and password: admin@123");
        } catch (Exception e) {
            log.error("Failed to create admin user", e);
        }
    }
}
