package com.smartcampus.controller;

import com.smartcampus.dto.CommentRequest;
import com.smartcampus.dto.TicketRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // Create ticket
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketRequest request) {
        Ticket ticket = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    // Get all tickets
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // Get ticket by id
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get tickets by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUser(userId));
    }

    // Get tickets by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Ticket>> getTicketsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
    }

    // Update ticket status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String resolutionNotes = body.get("resolutionNotes");
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, resolutionNotes));
    }

    // Assign technician
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long technicianId = body.get("technicianId");
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    // Delete ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // Add comment
    @PostMapping("/comments")
    public ResponseEntity<TicketComment> addComment(@Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(request));
    }

    // Get comments by ticket
    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getCommentsByTicket(ticketId));
    }

    // Update comment
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable Long commentId,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String comment = body.get("comment").toString();
        return ResponseEntity.ok(ticketService.updateComment(commentId, userId, comment));
    }

    // Delete comment
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}