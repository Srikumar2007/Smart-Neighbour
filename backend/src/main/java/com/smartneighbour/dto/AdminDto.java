package com.smartneighbour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AdminDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminDashboardStatsResponse {
        private Long totalResidents;
        private Long activeResidents;
        private Long pendingSafetyReports;
        private Long verifiedReports;
        private Long upcomingEvents;
        private Long itemsShared;
    }
}
