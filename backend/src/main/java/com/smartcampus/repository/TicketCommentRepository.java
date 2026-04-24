package com.smartcampus.repository;

import com.smartcampus.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    @Query(value = "SELECT * FROM ticket_comments WHERE ticket_id = :ticketId ORDER BY created_at ASC", nativeQuery = true)
    List<TicketComment> findByTicketId(Long ticketId);

    @Query(value = "SELECT * FROM ticket_comments WHERE user_id = :userId", nativeQuery = true)
    List<TicketComment> findByUserId(Long userId);
}