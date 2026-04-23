package org.example.imedbackend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipEvaluationDto {

    private Long id;
    private double score;
    private String feedback;
    private LocalDateTime evaluatedAt;
}
