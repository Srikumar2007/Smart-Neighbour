package com.smartneighbour.controller;

import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.dto.EventDto.CreateEventRequest;
import com.smartneighbour.dto.EventDto.EventResponse;
import com.smartneighbour.dto.EventDto.UpdateEventRequest;
import com.smartneighbour.security.UserPrincipal;
import com.smartneighbour.service.CommunityEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class CommunityEventController {

    private final CommunityEventService eventService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        List<EventResponse> events = eventService.getAllEvents(userId);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Long userId = principal != null ? principal.getId() : null;
        EventResponse event = eventService.getEventById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateEventRequest request) {
        EventResponse event = eventService.createEvent(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(event, "Community event created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody UpdateEventRequest request) {
        EventResponse event = eventService.updateEvent(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(event, "Event updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        eventService.deleteEvent(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Event cancelled and deleted"));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<Void>> joinEvent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        eventService.joinEvent(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Successfully joined community event"));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveEvent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        eventService.leaveEvent(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Left community event"));
    }
}
