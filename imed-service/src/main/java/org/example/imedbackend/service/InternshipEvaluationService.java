package org.example.imedbackend.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.entity.InternshipApplication;
import org.example.imedbackend.entity.InternshipEvaluation;
import org.example.imedbackend.repository.InternshipApplicationRepository;
import org.example.imedbackend.repository.InternshipEvaluationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InternshipEvaluationService {

    private final InternshipEvaluationRepository internshipEvaluationRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;

    public List<InternshipEvaluation> getAll() {
        return internshipEvaluationRepository.findAllWithExistingApplication();
    }

    public Optional<InternshipEvaluation> getById(Long id) {
        return internshipEvaluationRepository.findByIdWithExistingApplication(id);
    }

    public InternshipEvaluation create(InternshipEvaluation internshipEvaluation) {
        attachManagedApplication(internshipEvaluation);
        return internshipEvaluationRepository.save(internshipEvaluation);
    }

    @Transactional
    public Optional<InternshipEvaluation> update(Long id, InternshipEvaluation internshipEvaluation) {
        InternshipApplication incomingApplication = internshipEvaluation.getApplication();
        Long applicationId = incomingApplication != null ? incomingApplication.getId() : null;
        if (applicationId == null || !internshipApplicationRepository.existsById(applicationId)) {
            throw new IllegalArgumentException("Application introuvable");
        }
        int updatedRows = internshipEvaluationRepository.updateByIdNative(
                id,
                internshipEvaluation.getScore(),
                internshipEvaluation.getFeedback(),
                internshipEvaluation.getEvaluatedAt(),
                applicationId
        );
        if (updatedRows == 0) {
            return Optional.empty();
        }
        return internshipEvaluationRepository.findByIdWithExistingApplication(id);
    }

    @Transactional
    public boolean delete(Long id) {
        return internshipEvaluationRepository.deleteByIdNative(id) > 0;
    }

    private void attachManagedApplication(InternshipEvaluation internshipEvaluation) {
        InternshipApplication application = internshipEvaluation.getApplication();
        if (application == null || application.getId() == null) {
            throw new IllegalArgumentException("Application obligatoire");
        }
        if (!internshipApplicationRepository.existsById(application.getId())) {
            throw new IllegalArgumentException("Application introuvable");
        }
        internshipEvaluation.setApplication(InternshipApplication.builder().id(application.getId()).build());
    }
}
