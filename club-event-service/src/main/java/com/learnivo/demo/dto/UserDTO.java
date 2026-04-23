package com.learnivo.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for User information from the user-service (mohamed-work)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private String id;
    private String email;
    private String role;
    private String status;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String linkedService;
    private String ownerContext;
    private String createdAt;
    private String lastLogin;
}
