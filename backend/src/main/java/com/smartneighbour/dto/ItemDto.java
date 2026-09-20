package com.smartneighbour.dto;

import com.smartneighbour.entity.AvailabilityStatus;
import com.smartneighbour.entity.ItemCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ItemDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateItemRequest {
        @NotBlank(message = "Item name is required")
        private String name;

        private String description;

        @NotNull(message = "Item category is required")
        private ItemCategory category;

        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateItemRequest {
        private String name;
        private String description;
        private ItemCategory category;
        private String imageUrl;
        private AvailabilityStatus availabilityStatus;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemResponse {
        private Long id;
        private String name;
        private String description;
        private ItemCategory category;
        private String imageUrl;
        private Long ownerId;
        private String ownerName;
        private String ownerApartment;
        private String ownerBlock;
        private Integer ownerTrustPoints;
        private AvailabilityStatus availabilityStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
