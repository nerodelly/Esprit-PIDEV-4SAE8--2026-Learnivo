package com.learnivo.demo.repository;

import com.learnivo.demo.entity.EventRegistration;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    List<EventRegistration> findByEvent_Id(Long eventId);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.event e JOIN FETCH er.student WHERE e.id = :eventId ORDER BY er.student.name")
    List<EventRegistration> findByEventIdWithStudent(@Param("eventId") Long eventId);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.event WHERE er.student.id = :studentId ORDER BY er.event.startTime DESC")
    List<EventRegistration> findByStudent_Id(@Param("studentId") Long studentId);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.event e WHERE er.student.id = :studentId AND e.startTime > CURRENT_TIMESTAMP ORDER BY e.startTime ASC")
    List<EventRegistration> findUpcomingByStudentId(@Param("studentId") Long studentId, Pageable pageable);

    @Query("SELECT er FROM EventRegistration er WHERE er.event.id = :eventId AND er.student.id = :studentId")
    EventRegistration findByEventIdAndStudentId(@Param("eventId") Long eventId, @Param("studentId") Long studentId);
}
