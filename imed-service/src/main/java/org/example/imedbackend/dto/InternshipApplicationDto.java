package org.example.imedbackend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.imedbackend.entity.ApplicationStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipApplicationDto {

    private Long id;
    private LocalDateTime appliedAt;
    private ApplicationStatus status;
    private String cvUrl;
    private String motivation;
}
