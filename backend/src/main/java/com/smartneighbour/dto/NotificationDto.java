package com.smartneighbour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NotificationDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NotificationResponse {
        private Long id;
        private Long userId;
        private String title;
        private String message;
        private String type;
        private String link;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }
}

