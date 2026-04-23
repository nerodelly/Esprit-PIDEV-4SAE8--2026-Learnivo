package org.example.imedbackend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.imedbackend.entity.CertificateStatus;
import org.example.imedbackend.entity.CertificateType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateDto {

    private Long id;
    private String certificateNumber;
    private CertificateType type;
    private CertificateStatus status;
    private LocalDateTime issuedAt;
    private String pdfUrl;
    private String verificationCode;
    private String qrCodeUrl;
    private Long internshipId;
}
