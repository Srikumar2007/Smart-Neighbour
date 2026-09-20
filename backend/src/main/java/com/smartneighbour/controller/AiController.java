package com.smartneighbour.controller;

import com.smartneighbour.dto.AiDto.*;
import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.service.GeminiAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiAiService geminiAiService;

    @PostMapping("/classify-safety-report")
    public ResponseEntity<ApiResponse<ClassifyReportResponse>> classifySafetyReport(
            @Valid @RequestBody ClassifyReportRequest request) {
        ClassifyReportResponse response = geminiAiService.classifySafetyReport(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Safety report classified successfully"));
    }

    @PostMapping("/detect-duplicate-report")
    public ResponseEntity<ApiResponse<DetectDuplicateResponse>> detectDuplicateReport(
            @Valid @RequestBody DetectDuplicateRequest request) {
        DetectDuplicateResponse response = geminiAiService.detectDuplicateReport(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Duplicate check complete"));
    }

    @PostMapping("/generate-event-description")
    public ResponseEntity<ApiResponse<GenerateEventDescriptionResponse>> generateEventDescription(
            @Valid @RequestBody GenerateEventDescriptionRequest request) {
        GenerateEventDescriptionResponse response = geminiAiService.generateEventDescription(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Event description suggestion generated"));
    }
}
