package com.learnivo.demo.service;

import com.learnivo.demo.dto.ticket.MessageCreateDTO;
import com.learnivo.demo.dto.ticket.MessageResponseDTO;
import com.learnivo.demo.dto.ticket.TicketCreateDTO;
import com.learnivo.demo.dto.ticket.TicketResponseDTO;
import com.learnivo.demo.dto.ticket.TicketUpdateDTO;
import com.learnivo.demo.entity.SupportTicket;
import com.learnivo.demo.entity.TicketCategory;
import com.learnivo.demo.entity.TicketMessage;
import com.learnivo.demo.entity.User;
import com.learnivo.demo.enums.Role;
import com.learnivo.demo.enums.TicketStatus;
import com.learnivo.demo.repository.SupportTicketRepository;
import com.learnivo.demo.repository.TicketCategoryRepository;
import com.learnivo.demo.repository.TicketMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {
    
    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;
    private final TicketCategoryRepository categoryRepository;
    
    @Transactional
    public TicketResponseDTO createTicket(TicketCreateDTO dto, User user) {
        // Seuls les étudiants peuvent créer des tickets
        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can create tickets");
        }
        
        SupportTicket ticket = SupportTicket.builder()
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : com.learnivo.demo.enums.TicketPriority.MEDIUM)
                .status(TicketStatus.OPEN)
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .build();
        
        if (dto.getCategoryId() != null) {
            TicketCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElse(null);
            ticket.setCategory(category);
        }
        
        ticket = ticketRepository.save(ticket);
        return convertToDTO(ticket);
    }
    
    public Page<TicketResponseDTO> getAllTickets(User user, Pageable pageable) {
        // Admin et Professor voient tous les tickets
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.PROFESSOR) {
            return ticketRepository.findAll(pageable)
                    .map(this::convertToDTO);
        }
        // Student voit seulement ses tickets
        return ticketRepository.findByCreatedBy(user, pageable)
                .map(this::convertToDTO);
    }
    
    public TicketResponseDTO getTicketById(Long id, User user) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
        
        // Vérifier les permissions
        if (user.getRole() == Role.STUDENT && !ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You can only view your own tickets");
        }
        
        return convertToDTO(ticket);
    }
    
    @Transactional
    public TicketResponseDTO updateTicket(Long id, TicketUpdateDTO dto, User user) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
        
        // Seuls Admin et Professor peuvent modifier
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.PROFESSOR) {
            throw new RuntimeException("Only ADMIN and PROFESSOR can update tickets");
        }
        
        if (dto.getStatus() != null) {
            ticket.setStatus(dto.getStatus());
            if (dto.getStatus() == TicketStatus.CLOSED) {
                ticket.setClosedAt(LocalDateTime.now());
            }
        }
        
        if (dto.getPriority() != null) {
            ticket.setPriority(dto.getPriority());
        }
        
        ticket = ticketRepository.save(ticket);
        return convertToDTO(ticket);
    }
    
    @Transactional
    public MessageResponseDTO addMessage(Long ticketId, MessageCreateDTO dto, User user) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        
        // Vérifier les permissions
        if (user.getRole() == Role.STUDENT && !ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You can only add messages to your own tickets");
        }
        
        TicketMessage message = TicketMessage.builder()
                .content(dto.getContent())
                .sender(user)
                .ticket(ticket)
                .sentAt(LocalDateTime.now())
                .build();
        
        message = messageRepository.save(message);
        return convertToMessageDTO(message);
    }
    
    public List<MessageResponseDTO> getTicketMessages(Long ticketId, User user) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        
        // Vérifier les permissions
        if (user.getRole() == Role.STUDENT && !ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You can only view messages of your own tickets");
        }
        
        return messageRepository.findByTicketOrderBySentAtAsc(ticket)
                .stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }
    
    private TicketResponseDTO convertToDTO(SupportTicket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdById(ticket.getCreatedBy().getId())
                .createdByEmail(ticket.getCreatedBy().getEmail())
                .categoryId(ticket.getCategory() != null ? ticket.getCategory().getId() : null)
                .categoryName(ticket.getCategory() != null ? ticket.getCategory().getName() : null)
                .createdAt(ticket.getCreatedAt())
                .closedAt(ticket.getClosedAt())
                .build();
    }
    
    private MessageResponseDTO convertToMessageDTO(TicketMessage message) {
        return MessageResponseDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderEmail(message.getSender().getEmail())
                .senderRole(message.getSender().getRole().name())
                .sentAt(message.getSentAt())
                .build();
    }
}
