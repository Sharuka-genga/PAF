package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends CrudRepository<Ticket, Long> {

    @Query("SELECT * FROM tickets WHERE created_by_user_id = :userId")
    List<Ticket> findByCreatedByUserId(String userId);

    @Query("SELECT * FROM tickets WHERE status = :status")
    List<Ticket> findByStatus(String status);

    @Query("SELECT * FROM tickets WHERE assigned_to_user_id = :userId")
    List<Ticket> findByAssignedToUserId(String userId);

    @Query("SELECT * FROM tickets WHERE priority = :priority")
    List<Ticket> findByPriority(String priority);

    @Query("SELECT * FROM tickets ORDER BY created_at DESC")
    List<Ticket> findAllOrderByCreatedAtDesc();
}