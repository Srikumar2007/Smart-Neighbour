package com.smartneighbour.service;

import com.smartneighbour.dto.SafetyReportDto.CreateSafetyReportRequest;
import com.smartneighbour.dto.SafetyReportDto.SafetyReportResponse;
import com.smartneighbour.dto.SafetyReportDto.UpdateSafetyReportRequest;
import com.smartneighbour.entity.Role;
import com.smartneighbour.entity.SafetyCategory;
import com.smartneighbour.entity.SafetyReport;
import com.smartneighbour.entity.SafetyStatus;
import com.smartneighbour.entity.User;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.SafetyReportRepository;
import com.smartneighbour.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SafetyReportService {

    private final SafetyReportRepository safetyReportRepository;
    private final UserRepository userRepository;
    private final TrustService trustService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<SafetyReportResponse> getAllReports(SafetyCategory category, SafetyStatus status) {
        List<SafetyReport> reports;
        if (category != null && status != null) {
            reports = safetyReportRepository.findByCategoryAndStatusOrderByCreatedAtDesc(category, status);
        } else if (category != null) {
            reports = safetyReportRepository.findByCategory(category);
        } else if (status != null) {
            reports = safetyReportRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            reports = safetyReportRepository.findAllByOrderByCreatedAtDesc();
        }
        return reports.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SafetyReportResponse> getPublicVerifiedReports(SafetyCategory category) {
        List<SafetyStatus> publicStatuses = List.of(SafetyStatus.VERIFIED, SafetyStatus.RESOLVED);
        List<SafetyReport> reports;
        if (category != null) {
            reports = safetyReportRepository.findByCategoryAndStatusOrderByCreatedAtDesc(category, SafetyStatus.VERIFIED);
        } else {
            reports = safetyReportRepository.findByStatusInOrderByCreatedAtDesc(publicStatuses);
        }
        return reports.stream().map(this::toPublicResponse).toList();
    }

    @Transactional(readOnly = true)
    public SafetyReportResponse getReportById(Long id) {
        SafetyReport report = safetyReportRepository.findById(id)
                .orElseThrow(() -> new AppException("Safety report not found with id: " + id, HttpStatus.NOT_FOUND));
        return toResponse(report);
    }

    @Transactional
    public SafetyReportResponse createReport(Long reporterId, CreateSafetyReportRequest request) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        validateCoordinates(request.getLatitude(), request.getLongitude());
        validateNeutralLanguage(request.getTitle(), request.getDescription());

        String resolvedLocation = request.getLocation() != null && !request.getLocation().isBlank()
                ? request.getLocation().trim()
                : (request.getBlock() != null ? request.getBlock() : "Campus Location");

        SafetyReport report = SafetyReport.builder()
                .reporter(reporter)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory())
                .severity(request.getSeverity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .block(request.getBlock() != null ? request.getBlock().trim() : null)
                .location(resolvedLocation)
                .imageUrl(request.getImageUrl())
                .status(SafetyStatus.PENDING)
                .build();

        SafetyReport saved = safetyReportRepository.save(report);

        // Community reward for active vigilance
        trustService.addPoints(reporterId, 5, "Submitted community hazard report: " + saved.getTitle(), "SAFETY_REPORT", saved.getId());

        return toResponse(saved);
    }

    @Transactional
    public SafetyReportResponse updateReport(Long currentUserId, Long reportId, UpdateSafetyReportRequest request) {
        SafetyReport report = safetyReportRepository.findById(reportId)
                .orElseThrow(() -> new AppException("Safety report not found with id: " + reportId, HttpStatus.NOT_FOUND));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        boolean isAuthor = report.getReporter().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new AppException("You do not have permission to modify this safety report", HttpStatus.FORBIDDEN);
        }

        if (request.getTitle() != null || request.getDescription() != null) {
            String checkTitle = request.getTitle() != null ? request.getTitle() : report.getTitle();
            String checkDesc = request.getDescription() != null ? request.getDescription() : report.getDescription();
            validateNeutralLanguage(checkTitle, checkDesc);
        }

        if (request.getLatitude() != null && request.getLongitude() != null) {
            validateCoordinates(request.getLatitude(), request.getLongitude());
            report.setLatitude(request.getLatitude());
            report.setLongitude(request.getLongitude());
        }

        if (request.getTitle() != null) report.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) report.setDescription(request.getDescription().trim());
        if (request.getCategory() != null) report.setCategory(request.getCategory());
        if (request.getSeverity() != null) report.setSeverity(request.getSeverity());
        if (request.getBlock() != null) report.setBlock(request.getBlock().trim());
        if (request.getLocation() != null) report.setLocation(request.getLocation().trim());
        if (request.getImageUrl() != null) report.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null && isAdmin) report.setStatus(request.getStatus());

        SafetyReport updated = safetyReportRepository.save(report);
        return toResponse(updated);
    }

    @Transactional
    public void deleteReport(Long currentUserId, Long reportId) {
        SafetyReport report = safetyReportRepository.findById(reportId)
                .orElseThrow(() -> new AppException("Safety report not found with id: " + reportId, HttpStatus.NOT_FOUND));

        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

            if (!report.getReporter().getId().equals(currentUserId) && currentUser.getRole() != Role.ADMIN) {
                throw new AppException("You do not have permission to delete this safety report", HttpStatus.FORBIDDEN);
            }
        }

        safetyReportRepository.delete(report);
    }

    @Transactional
    public SafetyReportResponse verifyReport(Long reportId) {
        SafetyReport report = safetyReportRepository.findById(reportId)
                .orElseThrow(() -> new AppException("Safety report not found with id: " + reportId, HttpStatus.NOT_FOUND));

        report.setStatus(SafetyStatus.VERIFIED);
        SafetyReport updated = safetyReportRepository.save(report);

        // Award extra trust points to reporter for verified alert
        trustService.addPoints(report.getReporter().getId(), 10, "Safety hazard verified by Admin: " + report.getTitle(), "SAFETY_VERIFY", report.getId());

        notificationService.createNotification(
                report.getReporter().getId(),
                "Safety Report Verified",
                "Your issue report '" + report.getTitle() + "' was verified by society administration and published on the community map.",
                "SAFETY_VERIFIED"
        );

        return toResponse(updated);
    }

    @Transactional
    public SafetyReportResponse rejectReport(Long reportId) {
        SafetyReport report = safetyReportRepository.findById(reportId)
                .orElseThrow(() -> new AppException("Safety report not found with id: " + reportId, HttpStatus.NOT_FOUND));

        report.setStatus(SafetyStatus.REJECTED);
        SafetyReport updated = safetyReportRepository.save(report);

        notificationService.createNotification(
                report.getReporter().getId(),
                "Safety Report Reviewed",
                "Your issue report '" + report.getTitle() + "' was reviewed and rejected as not meeting guidelines.",
                "SAFETY_REJECTED"
        );

        return toResponse(updated);
    }

    @Transactional
    public SafetyReportResponse resolveReport(Long reportId) {
        SafetyReport report = safetyReportRepository.findById(reportId)
                .orElseThrow(() -> new AppException("Safety report not found with id: " + reportId, HttpStatus.NOT_FOUND));

        report.setStatus(SafetyStatus.RESOLVED);
        SafetyReport updated = safetyReportRepository.save(report);

        notificationService.createNotification(
                report.getReporter().getId(),
                "Hazard Resolved",
                "The reported hazard '" + report.getTitle() + "' has been resolved.",
                "SAFETY_RESOLVED"
        );

        return toResponse(updated);
    }

    private void validateCoordinates(Double lat, Double lng) {
        if (lat == null || lat < -90.0 || lat > 90.0) {
            throw new AppException("Invalid latitude value. Latitude must be between -90 and 90 degrees.", HttpStatus.BAD_REQUEST);
        }
        if (lng == null || lng < -180.0 || lng > 180.0) {
            throw new AppException("Invalid longitude value. Longitude must be between -180 and 180 degrees.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateNeutralLanguage(String title, String description) {
        String combined = (title + " " + description).toLowerCase();
        // Check for personal accusations or targeted naming
        String[] prohibitedPatterns = {
            "person ", "suspicious resident", "resident in flat", "stole", "thief",
            "he is suspicious", "she is suspicious", "looks suspicious", "suspicious guy", "suspicious man", "suspicious woman"
        };
        for (String pattern : prohibitedPatterns) {
            if (combined.contains(pattern)) {
                throw new AppException("Reports must describe neutral physical issues or hazards (e.g. broken light, open gate, water leak), not personal accusations or targeting individuals.", HttpStatus.BAD_REQUEST);
            }
        }
    }

    public SafetyReportResponse toResponse(SafetyReport report) {
        User reporter = report.getReporter();
        return SafetyReportResponse.builder()
                .id(report.getId())
                .reporterId(reporter.getId())
                .reporterName(reporter.getFullName())
                .reporterApartment(reporter.getApartmentNumber())
                .reporterBlock(reporter.getBlock())
                .title(report.getTitle())
                .description(report.getDescription())
                .category(report.getCategory())
                .severity(report.getSeverity())
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .block(report.getBlock())
                .location(report.getLocation() != null ? report.getLocation() : report.getBlock())
                .imageUrl(report.getImageUrl())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }

    public SafetyReportResponse toPublicResponse(SafetyReport report) {
        // Public response hides reporter identity to protect resident privacy
        return SafetyReportResponse.builder()
                .id(report.getId())
                .reporterId(null)
                .reporterName("Verified Resident")
                .reporterApartment(null)
                .reporterBlock(null)
                .title(report.getTitle())
                .description(report.getDescription())
                .category(report.getCategory())
                .severity(report.getSeverity())
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .block(report.getBlock())
                .location(report.getLocation() != null ? report.getLocation() : report.getBlock())
                .imageUrl(report.getImageUrl())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
