package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityWindow {

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private String startTime;

    @Column(name = "end_time", nullable = false)
    private String endTime;
}
