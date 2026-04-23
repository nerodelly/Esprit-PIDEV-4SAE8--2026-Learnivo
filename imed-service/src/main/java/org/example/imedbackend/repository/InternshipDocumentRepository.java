package org.example.imedbackend.repository;

import java.util.List;
import java.util.Optional;
import org.example.imedbackend.entity.InternshipDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InternshipDocumentRepository extends JpaRepository<InternshipDocument, Long> {

    @Query("select d from InternshipDocument d join d.application a where d.type in ('AGREEMENT','REPORT','CERTIFICATE')")
    List<InternshipDocument> findAllWithExistingApplication();

    @Query("select d from InternshipDocument d join d.application a where d.id = :id and d.type in ('AGREEMENT','REPORT','CERTIFICATE')")
    Optional<InternshipDocument> findByIdWithExistingApplication(Long id);

    boolean existsByApplication_Id(Long applicationId);

    boolean existsByApplication_IdAndIdNot(Long applicationId, Long id);
}
