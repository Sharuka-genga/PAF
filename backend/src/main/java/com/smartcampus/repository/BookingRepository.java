package com.smartcampus.repository;

import com.smartcampus.model.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(String userId);

    /**
     * Checks for overlapping bookings for a specific resource and date.
     * Logic: (newStart < existingEnd) AND (newEnd > existingStart)
     */
    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
           "WHERE b.resourceName = :resourceName " +
           "AND b.date = :date " +
           "AND b.status = 'APPROVED' " +
           "AND (:startTime < b.endTime AND :endTime > b.startTime)")
    boolean existsOverlappingBooking(@Param("resourceName") String resourceName,
                                     @Param("date") LocalDate date,
                                     @Param("startTime") LocalTime startTime,
                                     @Param("endTime") LocalTime endTime);
}
