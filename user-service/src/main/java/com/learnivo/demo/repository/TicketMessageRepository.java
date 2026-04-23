package com.learnivo.demo.repository;

import com.learnivo.demo.entity.SupportTicket;
import com.learnivo.demo.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicketOrderBySentAtAsc(SupportTicket ticket);
}
