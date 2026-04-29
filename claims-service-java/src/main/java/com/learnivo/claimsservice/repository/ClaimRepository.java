package com.learnivo.claimsservice.repository;

import com.learnivo.claimsservice.entity.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    // Paginated list by student email with optional search
    @Query("SELECT c FROM Claim c WHERE c.studentEmail = :email " +
           "AND (:search IS NULL OR :search = '' OR " +
           "LOWER(c.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.studentName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Claim> findByStudentEmail(@Param("email") String email,
                                   @Param("search") String search,
                                   Pageable pageable);

    // Paginated list of all claims with optional search
    @Query("SELECT c FROM Claim c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.studentName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Claim> findAllWithSearch(@Param("search") String search, Pageable pageable);

    // Count by status
    long countByStatus(String status);

    // Count by priority
    long countByPriority(String priority);

    // Count escalated
    long countByEscalatedTrue();

    // Count SLA breached: deadline passed and not closed/rejected
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.slaDeadline < CURRENT_TIMESTAMP " +
           "AND c.status NOT IN ('CLOSED', 'REJECTED')")
    long countSlaBreached();

    // Active claims for SLA checker: CREATED or IN_PROGRESS with a deadline set
    @Query("SELECT c FROM Claim c WHERE c.status IN ('CREATED', 'IN_PROGRESS') " +
           "AND c.slaDeadline IS NOT NULL")
    List<Claim> findActiveClaimsForSLA();

    // Recent claims (last 7 days) for duplicate detection
    @Query("SELECT c FROM Claim c WHERE c.createdAt >= :since")
    List<Claim> findRecentClaims(@Param("since") java.time.LocalDateTime since);
}
