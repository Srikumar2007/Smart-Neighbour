package com.smartneighbour.controller;

import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.dto.ItemDto.CreateItemRequest;
import com.smartneighbour.dto.ItemDto.ItemResponse;
import com.smartneighbour.dto.ItemDto.UpdateItemRequest;
import com.smartneighbour.entity.AvailabilityStatus;
import com.smartneighbour.entity.ItemCategory;
import com.smartneighbour.security.UserPrincipal;
import com.smartneighbour.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getItems(
            @RequestParam(required = false) ItemCategory category,
            @RequestParam(required = false) AvailabilityStatus status,
            @RequestParam(required = false) String search) {
        List<ItemResponse> items = itemService.getAllItems(category, status, search);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable Long id) {
        ItemResponse item = itemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateItemRequest request) {
        ItemResponse item = itemService.createItem(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(item, "Item listed on community sharing marketplace"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody UpdateItemRequest request) {
        ItemResponse item = itemService.updateItem(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(item, "Item updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        itemService.deleteItem(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Item removed from marketplace"));
    }
}
