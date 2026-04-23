package org.example.imedbackend.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.dto.CertificateDto;
import org.example.imedbackend.entity.Certificate;
import org.example.imedbackend.repository.CertificateRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    public List<CertificateDto> getAll() {
        return certificateRepository.findAll().stream().map(this::toDto).toList();
    }

    public Optional<CertificateDto> getById(Long id) {
        return certificateRepository.findById(id).map(this::toDto);
    }

    public CertificateDto create(CertificateDto certificateDto) {
        Certificate certificate = toEntity(certificateDto);
        return toDto(certificateRepository.save(certificate));
    }

    public Optional<CertificateDto> update(Long id, CertificateDto certificateDto) {
        if (!certificateRepository.existsById(id)) {
            return Optional.empty();
        }
        Certificate certificate = toEntity(certificateDto);
        certificate.setId(id);
        return Optional.of(toDto(certificateRepository.save(certificate)));
    }

    public boolean delete(Long id) {
        if (!certificateRepository.existsById(id)) {
            return false;
        }
        certificateRepository.deleteById(id);
        return true;
    }

    private CertificateDto toDto(Certificate certificate) {
        return CertificateDto.builder()
                .id(certificate.getId())
                .certificateNumber(certificate.getCertificateNumber())
                .type(certificate.getType())
                .status(certificate.getStatus())
                .issuedAt(certificate.getIssuedAt())
                .pdfUrl(certificate.getPdfUrl())
                .verificationCode(certificate.getVerificationCode())
                .qrCodeUrl(certificate.getQrCodeUrl())
                .internshipId(certificate.getInternshipId())
                .build();
    }

    private Certificate toEntity(CertificateDto certificateDto) {
        return Certificate.builder()
                .id(certificateDto.getId())
                .certificateNumber(certificateDto.getCertificateNumber())
                .type(certificateDto.getType())
                .status(certificateDto.getStatus())
                .issuedAt(certificateDto.getIssuedAt())
                .pdfUrl(certificateDto.getPdfUrl())
                .verificationCode(certificateDto.getVerificationCode())
                .qrCodeUrl(certificateDto.getQrCodeUrl())
                .internshipId(certificateDto.getInternshipId())
                .build();
    }
}
