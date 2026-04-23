package org.example.imedbackend.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.dto.CertificationRuleDto;
import org.example.imedbackend.entity.CertificationRule;
import org.example.imedbackend.repository.CertificationRuleRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CertificationRuleService {

    private final CertificationRuleRepository certificationRuleRepository;

    public List<CertificationRuleDto> getAll() {
        return certificationRuleRepository.findAll().stream().map(this::toDto).toList();
    }

    public Optional<CertificationRuleDto> getById(Long id) {
        return certificationRuleRepository.findById(id).map(this::toDto);
    }

    public CertificationRuleDto create(CertificationRuleDto certificationRuleDto) {
        CertificationRule certificationRule = toEntity(certificationRuleDto);
        return toDto(certificationRuleRepository.save(certificationRule));
    }

    public Optional<CertificationRuleDto> update(Long id, CertificationRuleDto certificationRuleDto) {
        if (!certificationRuleRepository.existsById(id)) {
            return Optional.empty();
        }
        CertificationRule certificationRule = toEntity(certificationRuleDto);
        certificationRule.setId(id);
        return Optional.of(toDto(certificationRuleRepository.save(certificationRule)));
    }

    public boolean delete(Long id) {
        if (!certificationRuleRepository.existsById(id)) {
            return false;
        }
        certificationRuleRepository.deleteById(id);
        return true;
    }

    private CertificationRuleDto toDto(CertificationRule certificationRule) {
        return CertificationRuleDto.builder()
                .id(certificationRule.getId())
                .name(certificationRule.getName())
                .certificateType(certificationRule.getCertificateType())
                .minScore(certificationRule.getMinScore())
                .minAttendanceRate(certificationRule.getMinAttendanceRate())
                .minHours(certificationRule.getMinHours())
                .active(certificationRule.isActive())
                .build();
    }

    private CertificationRule toEntity(CertificationRuleDto certificationRuleDto) {
        return CertificationRule.builder()
                .id(certificationRuleDto.getId())
                .name(certificationRuleDto.getName())
                .certificateType(certificationRuleDto.getCertificateType())
                .minScore(certificationRuleDto.getMinScore())
                .minAttendanceRate(certificationRuleDto.getMinAttendanceRate())
                .minHours(certificationRuleDto.getMinHours())
                .active(certificationRuleDto.isActive())
                .build();
    }
}
