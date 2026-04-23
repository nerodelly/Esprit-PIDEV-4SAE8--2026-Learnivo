package org.example.imedbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.imedbackend.entity.CertificateType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationRuleDto {

    private Long id;
    private String name;
    private CertificateType certificateType;
    private double minScore;
    private double minAttendanceRate;
    private int minHours;
    private boolean active;
}
