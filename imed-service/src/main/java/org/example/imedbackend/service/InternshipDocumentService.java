package org.example.imedbackend.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.entity.InternshipApplication;
import org.example.imedbackend.entity.InternshipDocument;
import org.example.imedbackend.repository.InternshipApplicationRepository;
import org.example.imedbackend.repository.InternshipDocumentRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternshipDocumentService {

    private final InternshipDocumentRepository internshipDocumentRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;

    public List<InternshipDocument> getAll() {
        return internshipDocumentRepository.findAllWithExistingApplication();
    }

    public Optional<InternshipDocument> getById(Long id) {
        return internshipDocumentRepository.findByIdWithExistingApplication(id);
    }

    public InternshipDocument create(InternshipDocument internshipDocument) {
        InternshipApplication application = resolveApplication(internshipDocument);
        if (internshipDocumentRepository.existsByApplication_Id(application.getId())) {
            throw new IllegalArgumentException("Cette candidature possède déjà un document");
        }
        internshipDocument.setApplication(application);
        return internshipDocumentRepository.save(internshipDocument);
    }

    public Optional<InternshipDocument> update(Long id, InternshipDocument internshipDocument) {
        if (!internshipDocumentRepository.existsById(id)) {
            return Optional.empty();
        }
        InternshipApplication application = resolveApplication(internshipDocument);
        if (internshipDocumentRepository.existsByApplication_IdAndIdNot(application.getId(), id)) {
            throw new IllegalArgumentException("Cette candidature possède déjà un document");
        }
        internshipDocument.setId(id);
        internshipDocument.setApplication(application);
        return Optional.of(internshipDocumentRepository.save(internshipDocument));
    }

    public boolean delete(Long id) {
        if (!internshipDocumentRepository.existsById(id)) {
            return false;
        }
        internshipDocumentRepository.deleteById(id);
        return true;
    }

    private InternshipApplication resolveApplication(InternshipDocument internshipDocument) {
        Long applicationId = internshipDocument.getApplication() == null ? null : internshipDocument.getApplication().getId();
        if (applicationId == null) {
            throw new IllegalArgumentException("L'application est obligatoire pour un document");
        }
        return internshipApplicationRepository.findByIdWithExistingInternship(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application introuvable"));
    }
}
