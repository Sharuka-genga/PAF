package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TicketRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Contact details are required")
    private String contactDetails;

    private String image1;
    private String image2;
    private String image3;

    private String createdByUserId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }

    public String getImage1() { return image1; }
    public void setImage1(String image1) { this.image1 = image1; }

    public String getImage2() { return image2; }
    public void setImage2(String image2) { this.image2 = image2; }

    public String getImage3() { return image3; }
    public void setImage3(String image3) { this.image3 = image3; }

    public String getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(String createdByUserId) { this.createdByUserId = createdByUserId; }
}