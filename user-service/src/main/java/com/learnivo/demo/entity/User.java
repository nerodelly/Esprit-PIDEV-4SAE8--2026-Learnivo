package com.learnivo.demo.entity;

import com.learnivo.demo.enums.Role;
import com.learnivo.demo.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false, name = "password_hash")
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // Champs spécifiques pour SocietyAgent
    @Column(name = "society_name")
    private String societyName;
    
    @Column(name = "society_email")
    private String societyEmail;
    
    @Column(name = "society_phone")
    private String societyPhone;
    
    @Column(name = "society_address")
    private String societyAddress;

    // User service linking fields
    @Column(name = "linked_service", nullable = false)
    @Builder.Default
    private String linkedService = "user-service";

    @Column(name = "owner_context")
    @Builder.Default
    private String ownerContext = "mohamed-work";

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (linkedService == null) {
            linkedService = "user-service";
        }
        if (ownerContext == null) {
            ownerContext = "mohamed-work";
        }
    }
}
