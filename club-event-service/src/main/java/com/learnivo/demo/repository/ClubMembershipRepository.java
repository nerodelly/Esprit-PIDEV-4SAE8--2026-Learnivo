package com.learnivo.demo.repository;

import com.learnivo.demo.entity.ClubMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {

    @Query("SELECT cm FROM ClubMembership cm WHERE cm.club.id = :clubId AND cm.student.id = :studentId")
    ClubMembership findByClubIdAndStudentId(@Param("clubId") Long clubId, @Param("studentId") Long studentId);
}
