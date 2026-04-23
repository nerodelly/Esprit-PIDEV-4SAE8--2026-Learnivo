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
public class CertificateVerificationDto {

    private Long id;
    private LocalDateTime verifiedAt;
    private String verifierIp;
    private String verifierUserAgent;
    private boolean result;
}
