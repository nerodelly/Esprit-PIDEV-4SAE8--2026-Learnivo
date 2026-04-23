package com.learnivo.classservice.repository;

import com.learnivo.classservice.entity.PlatformClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<PlatformClass, Long> {

    List<PlatformClass> findByStatus(PlatformClass.Status status);

    List<PlatformClass> findByDay(String day);

    List<PlatformClass> findByType(String type);

    @Query("SELECT c FROM PlatformClass c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:day IS NULL OR c.day = :day)")
    List<PlatformClass> findWithFilters(PlatformClass.Status status, String day);
}
