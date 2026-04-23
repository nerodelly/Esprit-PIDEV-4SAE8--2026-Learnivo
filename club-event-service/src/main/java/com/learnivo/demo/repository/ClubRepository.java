package com.learnivo.demo.repository;

import com.learnivo.demo.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    java.util.Optional<Club> findByNameIgnoreCase(String name);
}
