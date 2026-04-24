package com.smartcampus.seed;

import com.smartcampus.model.*;
import com.smartcampus.model.entity.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        log.info("=== Checking seed data ===");
        migrateTicketUserIdColumns();

        List<User> users;
        if (userRepository.count() == 0) {
            users = seedUsers();
        } else {
            users = userRepository.findAll();
            log.info("Users already seeded ({}) — skipping.", users.size());
        }

        if (resourceRepository.count() == 0) {
            seedResources();
        } else {
            log.info("Resources already seeded — skipping.");
        }

        if (bookingRepository.count() == 0) {
            seedBookings(users);
        } else {
            log.info("Bookings already seeded — skipping.");
        }

        List<Ticket> tickets;
        if (ticketRepository.count() == 0) {
            tickets = seedTickets(users);
        } else {
            tickets = ticketRepository.findAll();
            log.info("Tickets already seeded ({}) — skipping.", tickets.size());
        }

        if (ticketCommentRepository.count() == 0) {
            seedTicketComments(tickets);
        } else {
            log.info("Ticket comments already seeded — skipping.");
        }

        if (notificationRepository.count() == 0) {
            seedNotifications(users);
        } else {
            log.info("Notifications already seeded — skipping.");
        }

        log.info("=== Seed check complete ===");
    }

    // ─── Migration ──────────────────────────────────────────────────────────

    private void migrateTicketUserIdColumns() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns " +
                "WHERE table_name = 'tickets' AND column_name = 'created_by_user_id' AND data_type = 'bigint'",
                Integer.class);
            if (count != null && count > 0) {
                log.info("Migrating tickets.created_by_user_id from BIGINT to VARCHAR(36)...");
                jdbcTemplate.execute("DELETE FROM ticket_comments");
                jdbcTemplate.execute("DELETE FROM tickets");
                jdbcTemplate.execute("ALTER TABLE tickets ALTER COLUMN created_by_user_id TYPE VARCHAR(36) USING created_by_user_id::text");
                jdbcTemplate.execute("ALTER TABLE tickets ALTER COLUMN assigned_to_user_id TYPE VARCHAR(36) USING assigned_to_user_id::text");
                log.info("Migration complete.");
            }
        } catch (Exception e) {
            log.warn("Migration check failed (safe to ignore on fresh DB): {}", e.getMessage());
        }
    }

    // ─── Users ──────────────────────────────────────────────────────────────

    private List<User> seedUsers() {
        List<User> users = List.of(
            User.builder()
                .name("Admin User")
                .email("admin@smartcampus.edu")
                .password(passwordEncoder.encode("Admin@123"))
                .provider("LOCAL")
                .roles(Set.of(Role.ADMIN))
                .emailAlerts(true).ticketAlerts(true).bookingAlerts(true)
                .build(),
            User.builder()
                .name("Tech Support")
                .email("tech@smartcampus.edu")
                .password(passwordEncoder.encode("Tech@123"))
                .provider("LOCAL")
                .roles(Set.of(Role.TECHNICIAN))
                .emailAlerts(true).ticketAlerts(true).bookingAlerts(true)
                .build(),
            User.builder()
                .name("Alice Johnson")
                .email("alice@smartcampus.edu")
                .password(passwordEncoder.encode("User@123"))
                .provider("LOCAL")
                .roles(Set.of(Role.USER))
                .emailAlerts(true).ticketAlerts(true).bookingAlerts(true)
                .build(),
            User.builder()
                .name("Bob Smith")
                .email("bob@smartcampus.edu")
                .password(passwordEncoder.encode("User@123"))
                .provider("LOCAL")
                .roles(Set.of(Role.USER))
                .emailAlerts(true).ticketAlerts(false).bookingAlerts(true)
                .build(),
            User.builder()
                .name("Charlie Brown")
                .email("charlie@smartcampus.edu")
                .password(passwordEncoder.encode("User@123"))
                .provider("LOCAL")
                .roles(Set.of(Role.USER))
                .emailAlerts(false).ticketAlerts(true).bookingAlerts(true)
                .build()
        );

        List<User> saved = userRepository.saveAll(users);
        log.info("Seeded {} users.", saved.size());
        return saved;
    }

    // ─── Resources ──────────────────────────────────────────────────────────

    private void seedResources() {
        List<AvailabilityWindow> weekdayMorningAfternoon = List.of(
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.MONDAY).startTime("08:00").endTime("18:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.TUESDAY).startTime("08:00").endTime("18:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.WEDNESDAY).startTime("08:00").endTime("18:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.THURSDAY).startTime("08:00").endTime("18:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.FRIDAY).startTime("08:00").endTime("18:00").build()
        );

        List<AvailabilityWindow> allWeek = List.of(
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.MONDAY).startTime("07:00").endTime("22:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.TUESDAY).startTime("07:00").endTime("22:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.WEDNESDAY).startTime("07:00").endTime("22:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.THURSDAY).startTime("07:00").endTime("22:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.FRIDAY).startTime("07:00").endTime("22:00").build(),
            AvailabilityWindow.builder().dayOfWeek(DayOfWeek.SATURDAY).startTime("08:00").endTime("17:00").build()
        );

        List<Resource> resources = List.of(
            Resource.builder()
                .name("Lecture Hall A")
                .type(ResourceType.LECTURE_HALL)
                .capacity(150)
                .location("Block A, Ground Floor")
                .status(ResourceStatus.ACTIVE)
                .description("Large lecture hall with projector, whiteboard, and audio system. Suitable for big classes and seminars.")
                .availabilityWindows(weekdayMorningAfternoon)
                .build(),
            Resource.builder()
                .name("Lecture Hall B")
                .type(ResourceType.LECTURE_HALL)
                .capacity(200)
                .location("Block B, 1st Floor")
                .status(ResourceStatus.ACTIVE)
                .description("Spacious lecture hall equipped with dual projectors and tiered seating.")
                .availabilityWindows(weekdayMorningAfternoon)
                .build(),
            Resource.builder()
                .name("Main Auditorium")
                .type(ResourceType.LECTURE_HALL)
                .capacity(500)
                .location("Block C, Ground Floor")
                .status(ResourceStatus.ACTIVE)
                .description("Main campus auditorium with stage, full sound system and lighting. Ideal for events and large presentations.")
                .availabilityWindows(allWeek)
                .build(),
            Resource.builder()
                .name("Computer Lab 1")
                .type(ResourceType.LAB)
                .capacity(40)
                .location("Block D, 2nd Floor")
                .status(ResourceStatus.ACTIVE)
                .description("Fully equipped computer lab with 40 workstations running Windows 11 and Linux dual-boot.")
                .availabilityWindows(weekdayMorningAfternoon)
                .build(),
            Resource.builder()
                .name("Computer Lab 2")
                .type(ResourceType.LAB)
                .capacity(35)
                .location("Block D, 3rd Floor")
                .status(ResourceStatus.ACTIVE)
                .description("Computer lab with high-performance workstations for engineering and multimedia courses.")
                .availabilityWindows(weekdayMorningAfternoon)
                .build(),
            Resource.builder()
                .name("Science Lab")
                .type(ResourceType.LAB)
                .capacity(30)
                .location("Block E, Ground Floor")
                .status(ResourceStatus.MAINTENANCE)
                .description("Chemistry and biology laboratory. Currently undergoing safety inspection.")
                .availabilityWindows(weekdayMorningAfternoon)
                .build(),
            Resource.builder()
                .name("Meeting Room 101")
                .type(ResourceType.MEETING_ROOM)
                .capacity(12)
                .location("Block A, 1st Floor")
                .status(ResourceStatus.ACTIVE)
                .description("Small meeting room with TV screen, whiteboard, and video conferencing setup.")
                .availabilityWindows(allWeek)
                .build(),
            Resource.builder()
                .name("Meeting Room 202")
                .type(ResourceType.MEETING_ROOM)
                .capacity(20)
                .location("Block B, 2nd Floor")
                .status(ResourceStatus.ACTIVE)
                .description("Medium-sized meeting room with projector and round-table seating.")
                .availabilityWindows(allWeek)
                .build(),
            Resource.builder()
                .name("Seminar Room S1")
                .type(ResourceType.MEETING_ROOM)
                .capacity(8)
                .location("Block F, 1st Floor")
                .status(ResourceStatus.OUT_OF_SERVICE)
                .description("Small seminar room. Currently out of service due to air conditioning repairs.")
                .availabilityWindows(weekdayMorningAfternoon)
                .build(),
            Resource.builder()
                .name("Projector Unit #1")
                .type(ResourceType.PROJECTOR)
                .capacity(null)
                .location("Equipment Room, Block A")
                .status(ResourceStatus.ACTIVE)
                .description("Portable HD projector (Epson EB-X41). Available for borrowing for events and classes.")
                .availabilityWindows(weekdayMorningAfternoon)
                .build(),
            Resource.builder()
                .name("Projector Unit #2")
                .type(ResourceType.PROJECTOR)
                .capacity(null)
                .location("Equipment Room, Block A")
                .status(ResourceStatus.ACTIVE)
                .description("Portable HD projector (BenQ MH733). Available for borrowing.")
                .availabilityWindows(weekdayMorningAfternoon)
                .build(),
            Resource.builder()
                .name("Canon DSLR Camera")
                .type(ResourceType.CAMERA)
                .capacity(null)
                .location("Equipment Room, Block B")
                .status(ResourceStatus.ACTIVE)
                .description("Canon EOS 90D DSLR camera kit with 18-135mm lens, tripod, and carrying case.")
                .availabilityWindows(allWeek)
                .build()
        );

        List<Resource> saved = resourceRepository.saveAll(resources);
        log.info("Seeded {} resources.", saved.size());
    }

    // ─── Bookings ───────────────────────────────────────────────────────────

    private void seedBookings(List<User> users) {
        String aliceId = users.get(2).getId();
        String bobId = users.get(3).getId();
        String charlieId = users.get(4).getId();

        LocalDate today = LocalDate.now();

        List<Booking> bookings = List.of(
            Booking.builder()
                .userId(aliceId)
                .resourceName("Lecture Hall A")
                .date(today.plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Machine Learning Workshop")
                .attendees(80)
                .status(BookingStatus.APPROVED)
                .build(),
            Booking.builder()
                .userId(bobId)
                .resourceName("Meeting Room 101")
                .date(today.plusDays(2))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 30))
                .purpose("Project Team Sync")
                .attendees(8)
                .status(BookingStatus.PENDING)
                .build(),
            Booking.builder()
                .userId(charlieId)
                .resourceName("Computer Lab 1")
                .date(today.plusDays(3))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .purpose("Database Systems Practical")
                .attendees(35)
                .status(BookingStatus.APPROVED)
                .build(),
            Booking.builder()
                .userId(aliceId)
                .resourceName("Main Auditorium")
                .date(today.plusDays(7))
                .startTime(LocalTime.of(13, 0))
                .endTime(LocalTime.of(17, 0))
                .purpose("Annual Tech Symposium")
                .attendees(400)
                .status(BookingStatus.PENDING)
                .build(),
            Booking.builder()
                .userId(bobId)
                .resourceName("Projector Unit #1")
                .date(today.plusDays(1))
                .startTime(LocalTime.of(8, 30))
                .endTime(LocalTime.of(10, 30))
                .purpose("Guest Lecture Equipment")
                .attendees(0)
                .status(BookingStatus.APPROVED)
                .build(),
            Booking.builder()
                .userId(charlieId)
                .resourceName("Lecture Hall B")
                .date(today.minusDays(3))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Software Engineering Lecture")
                .attendees(120)
                .status(BookingStatus.APPROVED)
                .build(),
            Booking.builder()
                .userId(aliceId)
                .resourceName("Meeting Room 202")
                .date(today.minusDays(1))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(16, 0))
                .purpose("Research Group Meeting")
                .attendees(15)
                .status(BookingStatus.REJECTED)
                .rejectionReason("Room is reserved for faculty board meeting.")
                .build(),
            Booking.builder()
                .userId(bobId)
                .resourceName("Canon DSLR Camera")
                .date(today.plusDays(5))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .purpose("Campus Photography Project")
                .attendees(1)
                .status(BookingStatus.PENDING)
                .build(),
            Booking.builder()
                .userId(charlieId)
                .resourceName("Computer Lab 2")
                .date(today.minusDays(7))
                .startTime(LocalTime.of(13, 0))
                .endTime(LocalTime.of(15, 0))
                .purpose("Web Development Lab Session")
                .attendees(30)
                .status(BookingStatus.CANCELLED)
                .build(),
            Booking.builder()
                .userId(aliceId)
                .resourceName("Meeting Room 101")
                .date(today.plusDays(10))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Capstone Project Review")
                .attendees(6)
                .status(BookingStatus.PENDING)
                .build()
        );

        bookingRepository.saveAll(bookings);
        log.info("Seeded {} bookings.", bookings.size());
    }

    // ─── Tickets ────────────────────────────────────────────────────────────

    private List<Ticket> seedTickets(List<User> users) {
        String aliceId = users.get(2).getId();
        String bobId = users.get(3).getId();
        String charlieId = users.get(4).getId();
        LocalDateTime now = LocalDateTime.now();

        List<Ticket> tickets = List.of(
            buildTicket("Projector Not Working in Lecture Hall A",
                "The ceiling-mounted projector in Lecture Hall A is not turning on. The power light blinks red.",
                "EQUIPMENT", "HIGH", "OPEN",
                "Block A, Lecture Hall A", "alice@smartcampus.edu", aliceId,
                now.minusDays(2)),
            buildTicket("Air Conditioning Broken in Computer Lab 1",
                "The AC unit in Computer Lab 1 has stopped working. Room temperature is very high, affecting students during practicals.",
                "HVAC", "HIGH", "IN_PROGRESS",
                "Block D, Computer Lab 1", "bob@smartcampus.edu", bobId,
                now.minusDays(5)),
            buildTicket("Broken Chair in Meeting Room 101",
                "Two chairs in Meeting Room 101 have broken legs and are unsafe to use. Please replace or repair them.",
                "FURNITURE", "LOW", "OPEN",
                "Block A, Meeting Room 101", "charlie@smartcampus.edu", charlieId,
                now.minusDays(1)),
            buildTicket("Network Switch Down - Block B 2nd Floor",
                "The network switch on the 2nd floor of Block B is offline. All wired connections in that area are down.",
                "NETWORK", "CRITICAL", "IN_PROGRESS",
                "Block B, 2nd Floor Server Closet", "alice@smartcampus.edu", aliceId,
                now.minusHours(8)),
            buildTicket("Flickering Lights in Science Lab",
                "The fluorescent lights in the Science Lab keep flickering. This is causing headaches and eye strain for students.",
                "ELECTRICAL", "MEDIUM", "RESOLVED",
                "Block E, Science Lab", "bob@smartcampus.edu", bobId,
                now.minusDays(10)),
            buildTicket("Water Leak in Male Restroom Block C",
                "There is a water leak under the sink in the male restroom on the ground floor of Block C. Water is pooling on the floor.",
                "PLUMBING", "HIGH", "RESOLVED",
                "Block C, Ground Floor Male Restroom", "charlie@smartcampus.edu", charlieId,
                now.minusDays(14)),
            buildTicket("Door Lock Malfunction - Meeting Room 202",
                "The electronic lock on Meeting Room 202 is not responding to keycards. The room cannot be locked.",
                "SECURITY", "MEDIUM", "OPEN",
                "Block B, Meeting Room 202", "alice@smartcampus.edu", aliceId,
                now.minusHours(3)),
            buildTicket("Whiteboard Markers Needed - Lecture Halls",
                "Most lecture halls are running out of whiteboard markers. Please restock all lecture halls.",
                "SUPPLIES", "LOW", "CLOSED",
                "All Lecture Halls", "bob@smartcampus.edu", bobId,
                now.minusDays(20))
        );

        ticketRepository.saveAll(tickets);
        log.info("Seeded {} tickets.", tickets.size());
        return ticketRepository.findAll();
    }

    private Ticket buildTicket(String title, String description, String category,
                                String priority, String status, String location,
                                String contact, String userId, LocalDateTime createdAt) {
        Ticket t = new Ticket();
        t.setTitle(title);
        t.setDescription(description);
        t.setCategory(category);
        t.setPriority(priority);
        t.setStatus(status);
        t.setLocation(location);
        t.setContactDetails(contact);
        t.setCreatedByUserId(userId);
        t.setCreatedAt(createdAt);
        t.setUpdatedAt(createdAt);
        return t;
    }

    // ─── Ticket Comments ────────────────────────────────────────────────────

    private void seedTicketComments(List<Ticket> tickets) {
        if (tickets.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        List<TicketComment> comments = new ArrayList<>();

        // Map tickets by title for easy lookup
        for (Ticket ticket : tickets) {
            String title = ticket.getTitle();
            Long ticketId = ticket.getId();

            if (title.contains("Projector Not Working")) {
                comments.add(buildComment(ticketId, 2L,
                    "I have inspected the projector. The lamp needs replacement. Ordering a new one now.",
                    now.minusDays(1)));
                comments.add(buildComment(ticketId, 1L,
                    "Parts ordered. ETA 2 business days. Will update once installed.",
                    now.minusHours(12)));
            } else if (title.contains("Air Conditioning")) {
                comments.add(buildComment(ticketId, 2L,
                    "Technician has been dispatched. Initial assessment: refrigerant leak detected.",
                    now.minusDays(4)));
                comments.add(buildComment(ticketId, 2L,
                    "Refrigerant recharged and leak sealed. Running diagnostics — should be fully operational by end of day.",
                    now.minusDays(2)));
                comments.add(buildComment(ticketId, 1L,
                    "Please confirm when the room temperature is back to normal.",
                    now.minusDays(1)));
            } else if (title.contains("Broken Chair")) {
                comments.add(buildComment(ticketId, 2L,
                    "Noted. Will visit Meeting Room 101 to assess the chairs by tomorrow morning.",
                    now.minusHours(20)));
            } else if (title.contains("Network Switch")) {
                comments.add(buildComment(ticketId, 2L,
                    "Emergency response initiated. Backup switch being configured in the server closet.",
                    now.minusHours(7)));
                comments.add(buildComment(ticketId, 2L,
                    "Backup switch online. Investigating root cause of primary switch failure.",
                    now.minusHours(5)));
                comments.add(buildComment(ticketId, 1L,
                    "Critical priority — please ensure full resolution before end of business day.",
                    now.minusHours(4)));
            } else if (title.contains("Flickering Lights")) {
                comments.add(buildComment(ticketId, 2L,
                    "Replaced faulty ballast in all 4 flickering tubes. Issue resolved.",
                    now.minusDays(8)));
                comments.add(buildComment(ticketId, 1L,
                    "Marking as RESOLVED. Please close if satisfied.",
                    now.minusDays(7)));
            } else if (title.contains("Water Leak")) {
                comments.add(buildComment(ticketId, 2L,
                    "Plumber dispatched. Found a cracked supply pipe under the sink.",
                    now.minusDays(13)));
                comments.add(buildComment(ticketId, 2L,
                    "Pipe replaced and tested. No more leakage. Floor dried and sanitized.",
                    now.minusDays(12)));
            } else if (title.contains("Door Lock")) {
                comments.add(buildComment(ticketId, 2L,
                    "Checked the lock hardware. Access control firmware may need updating. Escalating to IT.",
                    now.minusHours(2)));
            } else if (title.contains("Whiteboard Markers")) {
                comments.add(buildComment(ticketId, 1L,
                    "Supplies ordered in bulk. Will be distributed to all lecture halls by Friday.",
                    now.minusDays(18)));
                comments.add(buildComment(ticketId, 2L,
                    "Markers distributed to all 6 lecture halls. Closing ticket.",
                    now.minusDays(15)));
            }
        }

        if (!comments.isEmpty()) {
            ticketCommentRepository.saveAll(comments);
            log.info("Seeded {} ticket comments.", comments.size());
        }
    }

    private TicketComment buildComment(Long ticketId, Long userId, String comment, LocalDateTime createdAt) {
        TicketComment c = new TicketComment();
        c.setTicketId(ticketId);
        c.setUserId(userId);
        c.setComment(comment);
        c.setCreatedAt(createdAt);
        c.setUpdatedAt(createdAt);
        return c;
    }

    // ─── Notifications ──────────────────────────────────────────────────────

    private void seedNotifications(List<User> users) {
        String adminId = users.get(0).getId();
        String aliceId = users.get(2).getId();
        String bobId = users.get(3).getId();
        String charlieId = users.get(4).getId();

        List<Notification> notifications = List.of(
            Notification.builder()
                .userId(aliceId)
                .title("Booking Approved")
                .message("Your booking for Lecture Hall A on " + LocalDate.now().plusDays(1) + " has been approved.")
                .type(Notification.NotificationType.BOOKING_APPROVED)
                .referenceId("1")
                .isRead(false)
                .build(),
            Notification.builder()
                .userId(aliceId)
                .title("Booking Rejected")
                .message("Your booking for Meeting Room 202 has been rejected. Reason: Room is reserved for faculty board meeting.")
                .type(Notification.NotificationType.BOOKING_REJECTED)
                .referenceId("7")
                .isRead(true)
                .build(),
            Notification.builder()
                .userId(bobId)
                .title("Booking Approved")
                .message("Your booking for Projector Unit #1 on " + LocalDate.now().plusDays(1) + " has been approved.")
                .type(Notification.NotificationType.BOOKING_APPROVED)
                .referenceId("5")
                .isRead(false)
                .build(),
            Notification.builder()
                .userId(charlieId)
                .title("Booking Approved")
                .message("Your booking for Computer Lab 1 on " + LocalDate.now().plusDays(3) + " has been approved.")
                .type(Notification.NotificationType.BOOKING_APPROVED)
                .referenceId("3")
                .isRead(false)
                .build(),
            Notification.builder()
                .userId(charlieId)
                .title("Booking Cancelled")
                .message("Your booking for Computer Lab 2 has been cancelled.")
                .type(Notification.NotificationType.BOOKING_CANCELLED)
                .referenceId("9")
                .isRead(true)
                .build(),
            Notification.builder()
                .userId(aliceId)
                .title("Ticket Status Updated")
                .message("Your ticket 'Projector Not Working in Lecture Hall A' status has been updated to IN_PROGRESS.")
                .type(Notification.NotificationType.TICKET_STATUS_CHANGED)
                .referenceId("1")
                .isRead(false)
                .build(),
            Notification.builder()
                .userId(bobId)
                .title("Ticket Resolved")
                .message("Your ticket 'Flickering Lights in Science Lab' has been resolved. Please check and close if satisfied.")
                .type(Notification.NotificationType.TICKET_STATUS_CHANGED)
                .referenceId("5")
                .isRead(true)
                .build(),
            Notification.builder()
                .userId(bobId)
                .title("Ticket Assigned")
                .message("Your ticket 'Air Conditioning Broken in Computer Lab 1' has been assigned to a technician.")
                .type(Notification.NotificationType.TICKET_ASSIGNED)
                .referenceId("2")
                .isRead(true)
                .build(),
            Notification.builder()
                .userId(charlieId)
                .title("New Comment on Your Ticket")
                .message("A technician has commented on your ticket 'Broken Chair in Meeting Room 101'.")
                .type(Notification.NotificationType.TICKET_COMMENT)
                .referenceId("3")
                .isRead(false)
                .build(),
            Notification.builder()
                .userId(adminId)
                .title("System Notice")
                .message("Welcome to Smart Campus Operations Hub. You have been set up as an administrator.")
                .type(Notification.NotificationType.GENERAL)
                .referenceId(null)
                .isRead(false)
                .build()
        );

        notificationRepository.saveAll(notifications);
        log.info("Seeded {} notifications.", notifications.size());
    }
}
