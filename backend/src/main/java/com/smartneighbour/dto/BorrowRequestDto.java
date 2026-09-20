package com.smartneighbour.dto;

import com.smartneighbour.entity.BorrowRequestStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class BorrowRequestDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateBorrowRequest {
        @NotNull(message = "Item ID is required")
        private Long itemId;

        @NotNull(message = "Requested from date-time is required")
        private LocalDateTime requestedFrom;

        @NotNull(message = "Requested until date-time is required")
        private LocalDateTime requestedUntil;

        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BorrowRequestResponse {
        private Long id;
        private Long itemId;
        private String itemName;
        private String itemImageUrl;
        private Long borrowerId;
        private String borrowerName;
        private String borrowerApartment;
        private String borrowerBlock;
        private Integer borrowerTrustPoints;
        private Long ownerId;
        private String ownerName;
        private String ownerApartment;
        private LocalDateTime requestedFrom;
        private LocalDateTime requestedUntil;
        private String message;
        private BorrowRequestStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
