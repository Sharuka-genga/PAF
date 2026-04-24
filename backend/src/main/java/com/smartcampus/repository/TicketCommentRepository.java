package com.smartcampus.repository;

import com.smartcampus.model.TicketComment;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends CrudRepository<TicketComment, Long> {

    @Query("SELECT * FROM ticket_comments WHERE ticket_id = :ticketId ORDER BY created_at ASC")
    List<TicketComment> findByTicketId(Long ticketId);

    @Query("SELECT * FROM ticket_comments WHERE user_id = :userId")
    List<TicketComment> findByUserId(String userId);
}