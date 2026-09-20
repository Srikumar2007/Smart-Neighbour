package com.smartneighbour.controller;

import com.smartneighbour.dto.AdminDto.AdminDashboardStatsResponse;
import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.dto.AuthDto.UserStatusRequest;
import com.smartneighbour.dto.AuthDto.UserSummary;
import com.smartneighbour.dto.EventDto.EventResponse;
import com.smartneighbour.dto.SafetyReportDto.SafetyReportResponse;
import com.smartneighbour.entity.EventStatus;
import com.smartneighbour.entity.SafetyCategory;
import com.smartneighbour.entity.SafetyStatus;
import com.smartneighbour.entity.User;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.CommunityEventRepository;
import com.smartneighbour.repository.ItemRepository;
import com.smartneighbour.repository.SafetyReportRepository;
import com.smartneighbour.repository.UserRepository;
import com.smartneighbour.service.CommunityEventService;
import com.smartneighbour.service.SafetyReportService;
import com.smartneighbour.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final SafetyReportService safetyReportService;
    private final CommunityEventService eventService;
    private final CommunityEventRepository eventRepository;
    private final ItemRepository itemRepository;
    private final SafetyReportRepository safetyReportRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getAdminDashboardStats() {
        long totalResidents = userRepository.count();
        long activeResidents = userRepository.findAll().stream().filter(u -> Boolean.TRUE.equals(u.getActive())).count();
        long pendingSafety = safetyReportRepository.findByStatusOrderByCreatedAtDesc(SafetyStatus.PENDING).size();
        long verifiedSafety = safetyReportRepository.findByStatusOrderByCreatedAtDesc(SafetyStatus.VERIFIED).size();
        long upcomingEvents = eventRepository.findAllByOrderByEventDateDesc().stream().filter(e -> e.getStatus() == EventStatus.UPCOMING).count();
        long itemsShared = itemRepository.count();

        AdminDashboardStatsResponse stats = AdminDashboardStatsResponse.builder()
                .totalResidents(totalResidents)
                .activeResidents(activeResidents)
                .pendingSafetyReports(pendingSafety)
                .verifiedReports(verifiedSafety)
                .upcomingEvents(upcomingEvents)
                .itemsShared(itemsShared)
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserSummary>>> getAllUsers() {
        List<UserSummary> users = userRepository.findAll().stream()
                .map(userService::toUserSummary)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserSummary>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found with id: " + id, HttpStatus.NOT_FOUND));

        if (request.getActive() != null) {
            user.setActive(request.getActive());
            userRepository.save(user);
        }

        return ResponseEntity.ok(ApiResponse.success(userService.toUserSummary(user), "Resident status updated"));
    }

    @GetMapping("/safety-reports")
    public ResponseEntity<ApiResponse<List<SafetyReportResponse>>> getSafetyReports(
            @RequestParam(required = false) SafetyCategory category,
            @RequestParam(required = false) SafetyStatus status) {
        List<SafetyReportResponse> reports = safetyReportService.getAllReports(category, status);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @PutMapping("/safety-reports/{id}/verify")
    public ResponseEntity<ApiResponse<SafetyReportResponse>> verifySafetyReport(@PathVariable Long id) {
        SafetyReportResponse response = safetyReportService.verifyReport(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Safety hazard report verified by admin"));
    }

    @PutMapping("/safety-reports/{id}/reject")
    public ResponseEntity<ApiResponse<SafetyReportResponse>> rejectSafetyReport(@PathVariable Long id) {
        SafetyReportResponse response = safetyReportService.rejectReport(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Safety report rejected by admin"));
    }

    @PutMapping("/safety-reports/{id}/resolve")
    public ResponseEntity<ApiResponse<SafetyReportResponse>> resolveSafetyReport(@PathVariable Long id) {
        SafetyReportResponse response = safetyReportService.resolveReport(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Safety hazard marked as resolved"));
    }

    @DeleteMapping("/safety-reports/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSafetyReport(@PathVariable Long id) {
        safetyReportService.deleteReport(null, id); // Admin bypasses ownership check
        return ResponseEntity.ok(ApiResponse.success(null, "Safety report dismissed and removed"));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEventsForAdmin() {
        List<EventResponse> events = eventService.getAllEvents(null);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEventByAdmin(@PathVariable Long id) {
        eventService.deleteEvent(null, id); // Admin bypasses ownership check
        return ResponseEntity.ok(ApiResponse.success(null, "Inappropriate event removed by Admin"));
    }
}

