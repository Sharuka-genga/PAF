package com.smartcampus.dto.request;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private Integer capacity;

    private String location;

    private String description;

    private List<AvailabilityWindowRequest> availabilityWindows;
}
