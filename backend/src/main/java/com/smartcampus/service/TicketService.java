package com.smartcampus.service;

import com.smartcampus.dto.CommentRequest;
import com.smartcampus.dto.TicketRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository ticketCommentRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
    }

    // Create ticket
    public Ticket createTicket(TicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setLocation(request.getLocation());
        ticket.setContactDetails(request.getContactDetails());
        ticket.setImage1(request.getImage1());
        ticket.setImage2(request.getImage2());
        ticket.setImage3(request.getImage3());
        ticket.setCreatedByUserId(request.getCreatedByUserId());
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Get all tickets
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllOrderByCreatedAtDesc();
    }

    // Get ticket by id
    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    // Get tickets by user
    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByCreatedByUserId(userId);
    }

    // Get tickets by status
    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    // Update ticket status
    public Ticket updateTicketStatus(Long id, String status, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Assign technician
    public Ticket assignTechnician(Long ticketId, String technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setAssignedToUserId(technicianId);
        ticket.setStatus("IN_PROGRESS");
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Delete ticket
    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    // Add comment
    public TicketComment addComment(CommentRequest request) {
        TicketComment comment = new TicketComment();
        comment.setTicketId(request.getTicketId());
        comment.setUserId(request.getUserId());
        comment.setComment(request.getComment());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        return ticketCommentRepository.save(comment);
    }

    // Get comments by ticket
    public List<TicketComment> getCommentsByTicket(Long ticketId) {
        return ticketCommentRepository.findByTicketId(ticketId);
    }

    // Update comment
    public TicketComment updateComment(Long commentId, Long userId, String newComment) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to edit this comment");
        }
        comment.setComment(newComment);
        comment.setUpdatedAt(LocalDateTime.now());
        return ticketCommentRepository.save(comment);
    }

    // Delete comment
    public void deleteComment(Long commentId, Long userId) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
        ticketCommentRepository.deleteById(commentId);
    }
}