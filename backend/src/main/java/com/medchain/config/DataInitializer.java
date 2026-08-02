package com.medchain.config;

import com.medchain.entity.Role;
import com.medchain.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.medchain.entity.Role;
import com.medchain.entity.User;
import com.medchain.repository.RoleRepository;
import com.medchain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initializeRoles() {
        return args -> {
            for (Role.RoleName roleName : Role.RoleName.values()) {
                roleRepository.findByName(roleName).orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });
            }

            // Ensure a default admin user exists with known credentials
            String adminEmail = "medchainteam23@gmail.com";
            String adminPassword = "Majorproject@23";

            User admin = userRepository.findByEmail(adminEmail.toLowerCase()).orElse(null);
            if (admin == null) {
                Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN).orElseThrow();
                admin = new User();
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setEmail(adminEmail.toLowerCase());
                admin.setRoles(java.util.Set.of(adminRole));
            }

            admin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(admin);
        };
    }
}
