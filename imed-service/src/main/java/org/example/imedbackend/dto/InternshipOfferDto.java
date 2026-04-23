package org.example.imedbackend.dto;

import java.time.LocalDate;
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
public class InternshipOfferDto {

    private Long id;
    private String titre;
    private String company;
    private String location;
    private LocalDate deadline;
    private String status;
    private LocalDateTime createdAt;
}
