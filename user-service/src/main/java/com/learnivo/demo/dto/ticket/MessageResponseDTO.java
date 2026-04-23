package com.learnivo.demo.dto.ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponseDTO {
    private Long id;
    private String content;
    private String senderId;
    private String senderEmail;
    private String senderRole;
    private LocalDateTime sentAt;
}
