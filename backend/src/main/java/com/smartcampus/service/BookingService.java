package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.dto.BookingRequest;
import com.smartcampus.model.entity.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Transactional
    public BookingDTO createBooking(@NonNull String userId, @NonNull BookingRequest request) {
        // 1. Validate startTime < endTime
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // 2. Conflict validation
        if (bookingRepository.existsApprovedOrPendingOverlappingBooking(
                request.getResourceName(), request.getDate(), request.getStartTime(), request.getEndTime())) {
            throw new RuntimeException("Conflict: Resource is already booked or requested for this time slot");
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

    public List<BookingDTO> getUserBookings(@NonNull String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings(BookingStatus status) {
        List<Booking> bookings;
        if (status != null) {
            bookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == status)
                    .collect(Collectors.toList());
        } else {
            bookings = bookingRepository.findAll();
        }
        return bookings.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDTO approveBooking(@NonNull Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved.");
        }
        
        // Final check for conflicts before approving
        if (bookingRepository.existsApprovedOverlappingBooking(
                booking.getResourceName(), booking.getDate(), booking.getStartTime(), booking.getEndTime())) {
            throw new RuntimeException("Cannot approve: A conflicting booking was approved earlier.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);
        
        // Create Notification
        notificationService.createNotification(
            booking.getUserId(),
            "Booking Approved",
            "Your booking for " + booking.getResourceName() + " on " + booking.getDate() + " has been approved.",
            com.smartcampus.model.Notification.NotificationType.BOOKING_APPROVED,
            booking.getId().toString()
        );

        return mapToDTO(saved);
    }

    @Transactional
    public BookingDTO rejectBooking(@NonNull Long id, @NonNull String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected.");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);

        // Create Notification
        notificationService.createNotification(
            booking.getUserId(),
            "Booking Rejected",
            "Your booking for " + booking.getResourceName() + " has been rejected. Reason: " + reason,
            com.smartcampus.model.Notification.NotificationType.BOOKING_REJECTED,
            booking.getId().toString()
        );

        return mapToDTO(saved);
    }

    @Transactional
    public BookingDTO cancelBooking(@NonNull Long id, @NonNull String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only PENDING or APPROVED bookings can be cancelled.");
        }
        
        // Authorization check (simplified)
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // Create Notification (to self, or maybe just log it. Usually cancel is user action)
        notificationService.createNotification(
            booking.getUserId(),
            "Booking Cancelled",
            "You have cancelled your booking for " + booking.getResourceName(),
            com.smartcampus.model.Notification.NotificationType.BOOKING_CANCELLED,
            booking.getId().toString()
        );

        return mapToDTO(saved);
    }

    @Transactional
    public void deleteBooking(@NonNull Long id, @NonNull String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.APPROVED) {
            throw new RuntimeException("Cannot delete an active or approved booking. Please cancel it first.");
        }

        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this booking");
        }

        bookingRepository.delete(booking);
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
