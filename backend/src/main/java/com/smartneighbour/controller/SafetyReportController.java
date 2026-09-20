package com.smartneighbour.controller;

import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.dto.SafetyReportDto.CreateSafetyReportRequest;
import com.smartneighbour.dto.SafetyReportDto.SafetyReportResponse;
import com.smartneighbour.dto.SafetyReportDto.UpdateSafetyReportRequest;
import com.smartneighbour.entity.SafetyCategory;
import com.smartneighbour.entity.SafetyStatus;
import com.smartneighbour.security.UserPrincipal;
import com.smartneighbour.service.SafetyReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/safety-reports")
@RequiredArgsConstructor
public class SafetyReportController {

    private final SafetyReportService safetyReportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SafetyReportResponse>>> getAllReports(
            @RequestParam(required = false) SafetyCategory category,
            @RequestParam(required = false) SafetyStatus status) {
        List<SafetyReportResponse> reports;
        if (status != null) {
            reports = safetyReportService.getAllReports(category, status);
        } else {
            reports = safetyReportService.getPublicVerifiedReports(category);
        }
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SafetyReportResponse>> getReportById(@PathVariable Long id) {
        SafetyReportResponse report = safetyReportService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SafetyReportResponse>> createReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateSafetyReportRequest request) {
        SafetyReportResponse report = safetyReportService.createReport(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(report, "Safety hazard report submitted"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SafetyReportResponse>> updateReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody UpdateSafetyReportRequest request) {
        SafetyReportResponse report = safetyReportService.updateReport(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(report, "Safety hazard report updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        safetyReportService.deleteReport(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Safety hazard report removed"));
    }
}
