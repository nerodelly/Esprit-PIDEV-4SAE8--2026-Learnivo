package org.example.imedbackend.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.dto.CertificateVerificationDto;
import org.example.imedbackend.entity.CertificateVerification;
import org.example.imedbackend.repository.CertificateVerificationRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CertificateVerificationService {

    private final CertificateVerificationRepository certificateVerificationRepository;

    public List<CertificateVerificationDto> getAll() {
        return certificateVerificationRepository.findAll().stream().map(this::toDto).toList();
    }

    public Optional<CertificateVerificationDto> getById(Long id) {
        return certificateVerificationRepository.findById(id).map(this::toDto);
    }

    public CertificateVerificationDto create(CertificateVerificationDto certificateVerificationDto) {
        CertificateVerification certificateVerification = toEntity(certificateVerificationDto);
        return toDto(certificateVerificationRepository.save(certificateVerification));
    }

    public Optional<CertificateVerificationDto> update(Long id, CertificateVerificationDto certificateVerificationDto) {
        if (!certificateVerificationRepository.existsById(id)) {
            return Optional.empty();
        }
        CertificateVerification certificateVerification = toEntity(certificateVerificationDto);
        certificateVerification.setId(id);
        return Optional.of(toDto(certificateVerificationRepository.save(certificateVerification)));
    }

    public boolean delete(Long id) {
        if (!certificateVerificationRepository.existsById(id)) {
            return false;
        }
        certificateVerificationRepository.deleteById(id);
        return true;
    }

    private CertificateVerificationDto toDto(CertificateVerification certificateVerification) {
        return CertificateVerificationDto.builder()
                .id(certificateVerification.getId())
                .verifiedAt(certificateVerification.getVerifiedAt())
                .verifierIp(certificateVerification.getVerifierIp())
                .verifierUserAgent(certificateVerification.getVerifierUserAgent())
                .result(certificateVerification.isResult())
                .build();
    }

    private CertificateVerification toEntity(CertificateVerificationDto certificateVerificationDto) {
        return CertificateVerification.builder()
                .id(certificateVerificationDto.getId())
                .verifiedAt(certificateVerificationDto.getVerifiedAt())
                .verifierIp(certificateVerificationDto.getVerifierIp())
                .verifierUserAgent(certificateVerificationDto.getVerifierUserAgent())
                .result(certificateVerificationDto.isResult())
                .build();
    }
}
