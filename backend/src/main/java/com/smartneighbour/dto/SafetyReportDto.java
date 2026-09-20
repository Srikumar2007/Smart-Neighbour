package com.smartneighbour.dto;

import com.smartneighbour.entity.SafetyCategory;
import com.smartneighbour.entity.SafetySeverity;
import com.smartneighbour.entity.SafetyStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class SafetyReportDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateSafetyReportRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description of the issue is required")
        private String description;

        @NotNull(message = "Category is required")
        private SafetyCategory category;

        @NotNull(message = "Severity is required")
        private SafetySeverity severity;

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
        @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
        private Double latitude;

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
        @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
        private Double longitude;

        private String block;

        private String location;

        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateSafetyReportRequest {
        private String title;
        private String description;
        private SafetyCategory category;
        private SafetySeverity severity;
        private Double latitude;
        private Double longitude;
        private String block;
        private String location;
        private String imageUrl;
        private SafetyStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SafetyReportResponse {
        private Long id;
        private Long reporterId;
        private String reporterName;
        private String reporterApartment;
        private String reporterBlock;
        private String title;
        private String description;
        private SafetyCategory category;
        private SafetySeverity severity;
        private Double latitude;
        private Double longitude;
        private String block;
        private String location;
        private String imageUrl;
        private SafetyStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
