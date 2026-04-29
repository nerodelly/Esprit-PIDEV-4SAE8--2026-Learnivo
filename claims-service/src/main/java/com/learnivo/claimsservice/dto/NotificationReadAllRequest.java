package com.learnivo.claimsservice.dto;

import lombok.Data;

@Data
public class NotificationReadAllRequest {

    private String role;
    private String email;
}
