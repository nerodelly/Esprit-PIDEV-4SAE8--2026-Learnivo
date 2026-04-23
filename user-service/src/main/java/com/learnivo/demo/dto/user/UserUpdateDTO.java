package com.learnivo.demo.dto.user;

import com.learnivo.demo.enums.Role;
import com.learnivo.demo.enums.UserStatus;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    
    @Email(message = "Email must be valid")
    private String email;
    
    private String password; // Si fourni, sera re-hashé
    
    private Role role;
    
    private UserStatus status;
    
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
}
