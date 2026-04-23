package com.learnivo.demo.dto.user;

import com.learnivo.demo.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDTO {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotNull(message = "Role is required")
    private Role role;
    
    // Profile fields
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    
    // SocietyAgent fields
    private String societyName;
    private String societyEmail;
    private String societyPhone;
    private String societyAddress;

    // User service linking fields
    private String linkedService;
    private String ownerContext;
}
