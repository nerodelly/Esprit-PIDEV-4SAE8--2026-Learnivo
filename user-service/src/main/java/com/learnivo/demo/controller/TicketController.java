package com.learnivo.demo.controller;

import com.learnivo.demo.dto.ticket.MessageCreateDTO;
import com.learnivo.demo.dto.ticket.MessageResponseDTO;
import com.learnivo.demo.dto.ticket.TicketCreateDTO;
import com.learnivo.demo.dto.ticket.TicketResponseDTO;
import com.learnivo.demo.dto.ticket.TicketUpdateDTO;
import com.learnivo.demo.entity.User;
import com.learnivo.demo.service.TicketService;
import com.learnivo.demo.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    
    private final TicketService ticketService;
    
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketCreateDTO dto) {
        User user = SecurityUtil.getCurrentUser();
        TicketResponseDTO ticket = ticketService.createTicket(dto, user);
        return ResponseEntity.ok(ticket);
    }
    
    @GetMapping
    public ResponseEntity<Page<TicketResponseDTO>> getAllTickets(
            @PageableDefault(size = 20) Pageable pageable) {
        User user = SecurityUtil.getCurrentUser();
        Page<TicketResponseDTO> tickets = ticketService.getAllTickets(user, pageable);
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        User user = SecurityUtil.getCurrentUser();
        TicketResponseDTO ticket = ticketService.getTicketById(id, user);
        return ResponseEntity.ok(ticket);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateDTO dto) {
        User user = SecurityUtil.getCurrentUser();
        TicketResponseDTO ticket = ticketService.updateTicket(id, dto, user);
        return ResponseEntity.ok(ticket);
    }
    
    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageResponseDTO> addMessage(
            @PathVariable Long id,
            @Valid @RequestBody MessageCreateDTO dto) {
        User user = SecurityUtil.getCurrentUser();
        MessageResponseDTO message = ticketService.addMessage(id, dto, user);
        return ResponseEntity.ok(message);
    }
    
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageResponseDTO>> getTicketMessages(@PathVariable Long id) {
        User user = SecurityUtil.getCurrentUser();
        List<MessageResponseDTO> messages = ticketService.getTicketMessages(id, user);
        return ResponseEntity.ok(messages);
    }
}
