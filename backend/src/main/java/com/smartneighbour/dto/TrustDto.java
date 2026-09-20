package com.smartneighbour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class TrustDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrustSummaryResponse {
        private Long userId;
        private String userName;
        private Integer trustPoints;
        private String trustLevel;       // e.g. "Trusted Neighbor", "Community Champion"
        private String nextTrustLevel;   // e.g. "Community Champion"
        private Integer pointsToNextLevel; // e.g. 12
        private Integer nextLevelThreshold; // e.g. 100
        private Integer progressPercentage; // e.g. 88
        private Integer itemsShared;
        private Integer successfulBorrows;
        private Integer eventsOrganized;
        private Integer verifiedSafetyReports;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrustTransactionResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String apartmentNumber;
        private Integer points;
        private String reason;
        private String referenceType;
        private Long referenceId;
        private LocalDateTime createdAt;
    }
}

