package com.learnivo.claimsservice.repository;

import com.learnivo.claimsservice.entity.ClaimNotification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ClaimNotificationRepository extends JpaRepository<ClaimNotification, Long> {

    // Agent notifications (target_role = 'AGENT'), most recent first, limit 50
    List<ClaimNotification> findByTargetRoleOrderByCreatedAtDesc(String targetRole, Pageable pageable);

    // User notifications by role + email, most recent first, limit 50
    List<ClaimNotification> findByTargetRoleAndTargetEmailOrderByCreatedAtDesc(
            String targetRole, String targetEmail, Pageable pageable);

    // Mark single notification as read
    @Modifying
    @Transactional
    @Query("UPDATE ClaimNotification n SET n.isRead = true WHERE n.id = :id")
    int markAsRead(@Param("id") Long id);

    // Mark all agent notifications as read
    @Modifying
    @Transactional
    @Query("UPDATE ClaimNotification n SET n.isRead = true WHERE n.targetRole = :role")
    int markAllReadByRole(@Param("role") String role);

    // Mark all user notifications as read for a specific email
    @Modifying
    @Transactional
    @Query("UPDATE ClaimNotification n SET n.isRead = true " +
           "WHERE n.targetRole = :role AND n.targetEmail = :email")
    int markAllReadByRoleAndEmail(@Param("role") String role, @Param("email") String email);
}
