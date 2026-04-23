package com.learnivo.demo.dto.auth;

import com.learnivo.demo.enums.Role;
import com.learnivo.demo.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeResponse {
    private Long id;
    private String email;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    // SocietyAgent fields
    private String societyName;
    private String societyEmail;
    private String societyPhone;
    private String societyAddress;
}
