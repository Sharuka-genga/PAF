package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CommentRequest {

    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotNull(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Comment is required")
    private String comment;

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}