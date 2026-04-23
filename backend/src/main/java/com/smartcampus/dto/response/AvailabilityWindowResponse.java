package com.smartcampus.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityWindowResponse {
    private String dayOfWeek;
    private String startTime;
    private String endTime;
}
