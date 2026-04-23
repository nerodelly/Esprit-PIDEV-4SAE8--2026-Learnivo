package com.learnivo.competitionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDTO {
    private String title;
    private String content;
    private String type; // INFO | REMINDER | RESULT | ALERT
}
