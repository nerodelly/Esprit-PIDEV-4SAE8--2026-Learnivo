package com.learnivo.demo.repository;

import com.learnivo.demo.entity.SupportTicket;
import com.learnivo.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Page<SupportTicket> findByCreatedBy(User user, Pageable pageable);
    Page<SupportTicket> findAll(Pageable pageable);
}
