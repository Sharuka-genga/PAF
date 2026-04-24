package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query(value = "SELECT * FROM tickets WHERE created_by_user_id = :userId", nativeQuery = true)
    List<Ticket> findByCreatedByUserId(String userId);

    @Query(value = "SELECT * FROM tickets WHERE status = :status", nativeQuery = true)
    List<Ticket> findByStatus(String status);

    @Query(value = "SELECT * FROM tickets WHERE assigned_to_user_id = :userId", nativeQuery = true)
    List<Ticket> findByAssignedToUserId(String userId);

    @Query(value = "SELECT * FROM tickets WHERE priority = :priority", nativeQuery = true)
    List<Ticket> findByPriority(String priority);

    @Query(value = "SELECT * FROM tickets ORDER BY created_at DESC", nativeQuery = true)
    List<Ticket> findAllOrderByCreatedAtDesc();
}