package com.learnivo.demo.service;

import com.learnivo.demo.client.UserClient;
import com.learnivo.demo.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import feign.FeignException;

import java.util.Optional;

/**
 * Service for communication with the user-service from mohamed-work
 * Provides methods to fetch user information from the shared user service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceIntegration {

    private final UserClient userClient;

    /**
     * Get user by ID from user-service
     * @param userId User ID from user-service
     * @return UserDTO if found
     */
    public Optional<UserDTO> getUserById(String userId) {
        try {
            log.debug("Fetching user {} from user-service via Feign", userId);
            UserDTO user = userClient.getUserById(userId);
            return Optional.ofNullable(user);
        } catch (FeignException e) {
            log.warn("Failed to fetch user {} from user-service", userId, e);
            return Optional.empty();
        }
    }

    public boolean isUserServiceAvailable() {
        try {
            log.debug("Checking user-service availability via Feign");
            String response = userClient.checkHello();
            return response != null;
        } catch (FeignException e) {
            log.warn("User-service is not available", e);
            return false;
        }
    }

    public boolean userExists(String userId) {
        return getUserById(userId).isPresent();
    }

    public Optional<UserDTO> getFullUserInfo(String userId) {
        return getUserById(userId);
    }
}
