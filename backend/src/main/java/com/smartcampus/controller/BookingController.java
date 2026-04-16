package com.smartcampus.controller;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.dto.BookingRequest;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // POST /api/bookings - Create a booking
    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody BookingRequest request) {
        return new ResponseEntity<>(bookingService.createBooking(userId, request), HttpStatus.CREATED);
    }

    // GET /api/bookings/my - User views their own bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    // GET /api/bookings - Admin views all bookings
    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // PUT /api/bookings/{id}/approve - Admin approves a booking
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingDTO> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // PUT /api/bookings/{id}/reject - Admin rejects a booking
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingDTO> rejectBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String reason = payload.getOrDefault("reason", "No reason provided");
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }

    // PUT /api/bookings/{id}/cancel - User cancels their booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }
}
