package org.example.imedbackend.repository;

import java.util.List;
import java.util.Optional;
import org.example.imedbackend.entity.ApplicationStatus;
import org.example.imedbackend.entity.InternshipApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {
    @Query("select ia from InternshipApplication ia join ia.internship i")
    List<InternshipApplication> findAllWithExistingInternship();

    @Query("select ia from InternshipApplication ia join ia.internship i where ia.id = :id")
    Optional<InternshipApplication> findByIdWithExistingInternship(Long id);

    long countByInternship_Id(Long internshipId);

    long countByInternship_IdAndIdNot(Long internshipId, Long id);

    long countByInternship_IdAndStatus(Long internshipId, ApplicationStatus status);

    long countByInternship_IdAndStatusAndIdNot(Long internshipId, ApplicationStatus status, Long id);
}
