package com.smartneighbour.dto;

import com.smartneighbour.entity.EventCategory;
import com.smartneighbour.entity.SafetyCategory;
import com.smartneighbour.entity.SafetySeverity;
import com.smartneighbour.entity.SafetyStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AiDto {

    // Feature 1: Safety Report Classification
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClassifyReportRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClassifyReportResponse {
        private SafetyCategory category;
        private SafetySeverity severity;
        private String summary;
        private Boolean isAiGenerated;
    }

    // Feature 2: Duplicate Report Detection
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetectDuplicateRequest {
        @NotBlank(message = "Title is required")
        private String title;
        private String description;
        private String location;
        private Double latitude;
        private Double longitude;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DuplicateReportMatch {
        private Long reportId;
        private String title;
        private SafetyCategory category;
        private SafetySeverity severity;
        private SafetyStatus status;
        private String location;
        private String similarityReason;
        private String reporterName;
        private String reporterApartment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetectDuplicateResponse {
        private Boolean isDuplicate;
        private DuplicateReportMatch similarReport;
        private String message;
    }

    // Feature 3: Event Description Assistance
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenerateEventDescriptionRequest {
        @NotBlank(message = "Title is required")
        private String title;
        private EventCategory category;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenerateEventDescriptionResponse {
        private String generatedDescription;
        private Boolean isAiGenerated;
    }
}
