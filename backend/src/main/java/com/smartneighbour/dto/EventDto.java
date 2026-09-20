package com.smartneighbour.dto;

import com.smartneighbour.entity.EventCategory;
import com.smartneighbour.entity.EventStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class EventDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateEventRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Event date is required")
        @FutureOrPresent(message = "Event date must be today or in the future")
        private LocalDate eventDate;

        @NotNull(message = "Start time is required")
        private LocalTime startTime;

        @NotNull(message = "End time is required")
        private LocalTime endTime;

        @NotBlank(message = "Location is required")
        private String location;

        @NotNull(message = "Latitude is required")
        private Double latitude;

        @NotNull(message = "Longitude is required")
        private Double longitude;

        private EventCategory category;

        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateEventRequest {
        private String title;
        private String description;
        private LocalDate eventDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String location;
        private Double latitude;
        private Double longitude;
        private EventCategory category;
        private EventStatus status;
        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EventResponse {
        private Long id;
        private String title;
        private String description;
        private LocalDate eventDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String location;
        private Double latitude;
        private Double longitude;
        private EventCategory category;
        private EventStatus status;
        private Long organizerId;
        private String organizerName;
        private String organizerApartment;
        private String imageUrl;
        private LocalDateTime createdAt;
        private Integer participantsCount;
        private Boolean isJoinedByMe;
        private List<ParticipantSummary> participants;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParticipantSummary {
        private Long userId;
        private String userName;
        private String apartmentNumber;
        private String profileImage;
        private LocalDateTime joinedAt;
    }
}
