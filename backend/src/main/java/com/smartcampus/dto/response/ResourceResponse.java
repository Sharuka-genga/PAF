package com.smartcampus.dto.response;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private String description;
    private List<AvailabilityWindowResponse> availabilityWindows;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
