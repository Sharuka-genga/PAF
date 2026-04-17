package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.dto.BookingRequest;
import com.smartcampus.model.entity.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    @Transactional
    public BookingDTO createBooking(Long userId, BookingRequest request) {
        // 1. Validate startTime < endTime
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // 2. Conflict validation
        if (bookingRepository.existsOverlappingBooking(
                request.getResourceName(), request.getDate(), request.getStartTime(), request.getEndTime())) {
            throw new RuntimeException("Conflict: Resource is already booked for this time range");
        }

        Booking booking = Booking.builder()
                .userId(userId)
                .resourceName(request.getResourceName())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToDTO(saved);
    }

    public List<BookingDTO> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDTO approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Final check for conflicts before approving
        if (bookingRepository.existsOverlappingBooking(
                booking.getResourceName(), booking.getDate(), booking.getStartTime(), booking.getEndTime())) {
            throw new RuntimeException("Cannot approve: A conflicting booking was approved earlier.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return mapToDTO(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return mapToDTO(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO cancelBooking(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Authorization check (simplified)
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return mapToDTO(bookingRepository.save(booking));
    }

    private BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .resourceName(booking.getResourceName())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .build();
    }
}
