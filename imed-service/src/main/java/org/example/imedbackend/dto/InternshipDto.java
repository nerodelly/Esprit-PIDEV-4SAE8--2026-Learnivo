package org.example.imedbackend.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.imedbackend.entity.InternshipStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipDto {

    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private String objectives;
    private InternshipStatus status;
}
