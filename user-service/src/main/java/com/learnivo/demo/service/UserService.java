package com.learnivo.demo.service;

import com.learnivo.demo.dto.user.UserCreateDTO;
import com.learnivo.demo.dto.user.UserResponseDTO;
import com.learnivo.demo.dto.user.UserUpdateDTO;
import com.learnivo.demo.entity.Profile;
import com.learnivo.demo.entity.User;
import com.learnivo.demo.enums.UserStatus;
import com.learnivo.demo.repository.ProfileRepository;
import com.learnivo.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToDTO);
    }
    
    public UserResponseDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToDTO(user);
    }
    
    @Transactional
    public UserResponseDTO createUser(UserCreateDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = User.builder()
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .status(UserStatus.ACTIVE)
                .linkedService(dto.getLinkedService() != null ? dto.getLinkedService() : "user-service")
                .ownerContext(dto.getOwnerContext() != null ? dto.getOwnerContext() : "mohamed-work")
                .createdAt(LocalDateTime.now())
                .build();
        
        // Ajouter les champs SocietyAgent si nécessaire
        if (dto.getRole() == com.learnivo.demo.enums.Role.SOCIETY_AGENT) {
            user.setSocietyName(dto.getSocietyName());
            user.setSocietyEmail(dto.getSocietyEmail());
            user.setSocietyPhone(dto.getSocietyPhone());
            user.setSocietyAddress(dto.getSocietyAddress());
        }
        
        user = userRepository.save(user);
        
        // Créer le profil
        Profile profile = Profile.builder()
                .user(user)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .build();
        profileRepository.save(profile);
        
        return convertToDTO(user);
    }
    
    @Transactional
    public UserResponseDTO updateUser(String id, UserUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(dto.getEmail());
        }
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
        
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        
        if (dto.getStatus() != null) {
            boolean wasSuspended = user.getStatus() == UserStatus.SUSPENDED;
            user.setStatus(dto.getStatus());
            if (!wasSuspended && dto.getStatus() == UserStatus.SUSPENDED) {
                emailService.sendSuspensionEmail(user.getEmail());
            }
        }
        
        // Mettre à jour les champs SocietyAgent si nécessaire
        if (user.getRole() == com.learnivo.demo.enums.Role.SOCIETY_AGENT) {
            if (dto.getSocietyName() != null) user.setSocietyName(dto.getSocietyName());
            if (dto.getSocietyEmail() != null) user.setSocietyEmail(dto.getSocietyEmail());
            if (dto.getSocietyPhone() != null) user.setSocietyPhone(dto.getSocietyPhone());
            if (dto.getSocietyAddress() != null) user.setSocietyAddress(dto.getSocietyAddress());
        }
        
        user = userRepository.save(user);
        
        // Mettre à jour le profil
        Profile profile = profileRepository.findByUser(user)
                .orElse(Profile.builder().user(user).build());
        
        if (dto.getFirstName() != null) profile.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) profile.setLastName(dto.getLastName());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getAddress() != null) profile.setAddress(dto.getAddress());
        
        profileRepository.save(profile);
        
        return convertToDTO(user);
    }
    
    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Soft delete: mettre le status à SUSPENDED
        if (user.getStatus() != UserStatus.SUSPENDED) {
            user.setStatus(UserStatus.SUSPENDED);
            userRepository.save(user);
            emailService.sendDeletionEmail(user.getEmail());
        }
    }
    
    private UserResponseDTO convertToDTO(User user) {
        Profile profile = profileRepository.findByUser(user).orElse(null);
        
        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .firstName(profile != null ? profile.getFirstName() : null)
                .lastName(profile != null ? profile.getLastName() : null)
                .phone(profile != null ? profile.getPhone() : null)
                .address(profile != null ? profile.getAddress() : null)
                .societyName(user.getSocietyName())
                .societyEmail(user.getSocietyEmail())
                .societyPhone(user.getSocietyPhone())
                .societyAddress(user.getSocietyAddress())
                .linkedService(user.getLinkedService())
                .ownerContext(user.getOwnerContext())
                .build();
    }
}
