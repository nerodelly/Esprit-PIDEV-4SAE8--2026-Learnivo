package org.example.imedbackend.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.entity.ApplicationStatus;
import org.example.imedbackend.entity.Internship;
import org.example.imedbackend.entity.InternshipApplication;
import org.example.imedbackend.entity.InternshipStatus;
import org.example.imedbackend.repository.InternshipApplicationRepository;
import org.example.imedbackend.repository.InternshipRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternshipApplicationService {

    private final InternshipApplicationRepository internshipApplicationRepository;
    private final InternshipRepository internshipRepository;

    public List<InternshipApplication> getAll() {
        return internshipApplicationRepository.findAllWithExistingInternship();
    }

    public Optional<InternshipApplication> getById(Long id) {
        return internshipApplicationRepository.findByIdWithExistingInternship(id);
    }

    public InternshipApplication create(InternshipApplication internshipApplication) {
        Internship managedInternship = attachManagedInternship(internshipApplication);
        assertInternshipCanAcceptParticipant(internshipApplication, managedInternship, null);
        return internshipApplicationRepository.save(internshipApplication);
    }

    public Optional<InternshipApplication> update(Long id, InternshipApplication internshipApplication) {
        if (!internshipApplicationRepository.existsById(id)) {
            return Optional.empty();
        }
        internshipApplication.setId(id);
        Internship managedInternship = attachManagedInternship(internshipApplication);
        assertInternshipCanAcceptParticipant(internshipApplication, managedInternship, id);
        return Optional.of(internshipApplicationRepository.save(internshipApplication));
    }

    public boolean delete(Long id) {
        if (!internshipApplicationRepository.existsById(id)) {
            return false;
        }
        internshipApplicationRepository.deleteById(id);
        return true;
    }

    private Internship attachManagedInternship(InternshipApplication internshipApplication) {
        Internship internship = internshipApplication.getInternship();
        if (internship == null || internship.getId() == null) {
            throw new IllegalArgumentException("Internship obligatoire");
        }
        Internship managedInternship = internshipRepository.findById(internship.getId())
                .orElseThrow(() -> new IllegalArgumentException("Internship introuvable"));
        internshipApplication.setInternship(managedInternship);
        return managedInternship;
    }

    private void assertInternshipCanAcceptParticipant(InternshipApplication internshipApplication, Internship internship, Long currentApplicationId) {
        if (internship.getStatus() == InternshipStatus.COMPLETED) {
            throw new IllegalArgumentException("Ce stage est complété");
        }
        if (internshipApplication.getStatus() != ApplicationStatus.ACCEPTED) {
            return;
        }
        long currentParticipants = currentApplicationId == null
                ? internshipApplicationRepository.countByInternship_IdAndStatus(internship.getId(), ApplicationStatus.ACCEPTED)
                : internshipApplicationRepository.countByInternship_IdAndStatusAndIdNot(internship.getId(), ApplicationStatus.ACCEPTED, currentApplicationId);
        if (currentParticipants >= internship.getMaxNumber()) {
            throw new IllegalArgumentException("Ce stage est complet");
        }
    }
}
