package com.smartneighbour.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartneighbour.dto.AiDto.*;
import com.smartneighbour.entity.EventCategory;
import com.smartneighbour.entity.SafetyCategory;
import com.smartneighbour.entity.SafetyReport;
import com.smartneighbour.entity.SafetySeverity;
import com.smartneighbour.repository.SafetyReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiAiService {

    private final SafetyReportRepository safetyReportRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String modelName;

    private static final String AI_SAFETY_SYSTEM_PROMPT = """
        IMPORTANT SAFETY & ETHICS CONSTRAINTS FOR SMART NEIGHBOUR AI:
        - NEVER identify any specific person as a criminal or make personal accusations.
        - NEVER label any resident or individual as 'suspicious' or 'guilty'.
        - NEVER recommend automatic punishments, automatic rejections of reports, or trust score modifications.
        - Focus strictly on objective physical housing hazards (e.g. broken lights, water leaks, infrastructure damage).
        - Respond in strict JSON format when requested.
        """;

    /**
     * AI Feature 1: Safety Report Classification
     */
    public ClassifyReportResponse classifySafetyReport(ClassifyReportRequest request) {
        String title = request.getTitle() != null ? request.getTitle() : "";
        String description = request.getDescription() != null ? request.getDescription() : "";
        String fullText = title + " " + description;

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String prompt = String.format("""
                    %s
                    Classify the following residential housing safety issue.
                    Issue Title: "%s"
                    Issue Description: "%s"

                    Choose Category strictly from: [SECURITY, INFRASTRUCTURE, LIGHTING, MAINTENANCE, WATER, OTHER]
                    Choose Severity strictly from: [LOW, MEDIUM, HIGH]

                    Return ONLY valid JSON matching this structure:
                    {
                      "category": "LIGHTING",
                      "severity": "MEDIUM",
                      "summary": "Short clean 1-sentence summary"
                    }
                    """, AI_SAFETY_SYSTEM_PROMPT, title, description);

                String aiResponse = callGeminiApi(prompt);
                if (aiResponse != null) {
                    JsonNode jsonNode = parseJsonFromResponse(aiResponse);
                    if (jsonNode != null && jsonNode.has("category")) {
                        SafetyCategory cat = parseCategory(jsonNode.get("category").asText());
                        SafetySeverity sev = parseSeverity(jsonNode.get("severity").asText());
                        String sum = jsonNode.has("summary") ? jsonNode.get("summary").asText() : title;

                        return ClassifyReportResponse.builder()
                                .category(cat)
                                .severity(sev)
                                .summary(sum)
                                .isAiGenerated(true)
                                .build();
                    }
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed for classification, using fallback: {}", e.getMessage());
            }
        }

        // Graceful Rule-Based Fallback
        return fallbackClassify(fullText);
    }

    /**
     * AI Feature 2: Duplicate Report Detection
     */
    public DetectDuplicateResponse detectDuplicateReport(DetectDuplicateRequest request) {
        List<SafetyReport> existingReports = safetyReportRepository.findAll();
        String newTitle = request.getTitle() != null ? request.getTitle().toLowerCase() : "";
        String newDesc = request.getDescription() != null ? request.getDescription().toLowerCase() : "";
        String newLoc = request.getLocation() != null ? request.getLocation().toLowerCase() : "";

        // Filter active open reports
        List<SafetyReport> activeReports = existingReports.stream()
                .filter(r => r.getStatus() != com.smartneighbour.entity.SafetyStatus.REJECTED)
                .toList();

        if (apiKey != null && !apiKey.trim().isEmpty() && !activeReports.isEmpty()) {
            try {
                StringBuilder reportsContext = new StringBuilder();
                for (SafetyReport r : activeReports) {
                    reportsContext.append(String.format("- [ID: %d] Title: \"%s\", Location: \"%s\", Category: %s, Description: \"%s\"\n",
                            r.getId(), r.getTitle(), r.getLocation(), r.getCategory(), r.getDescription()));
                }

                String prompt = String.format("""
                    %s
                    Compare this new safety report against existing community reports.
                    NEW REPORT: Title: "%s", Location: "%s", Description: "%s"

                    EXISTING REPORTS IN DB:
                    %s

                    Check if any existing report refers to the EXACT SAME physical issue or hazard near the same location.
                    Return ONLY valid JSON:
                    {
                      "isDuplicate": true or false,
                      "matchingReportId": <ID or null>,
                      "similarityReason": "Similar issue may already have been reported near this location."
                    }
                    """, AI_SAFETY_SYSTEM_PROMPT, newTitle, newLoc, newDesc, reportsContext.toString());

                String aiResponse = callGeminiApi(prompt);
                if (aiResponse != null) {
                    JsonNode jsonNode = parseJsonFromResponse(aiResponse);
                    if (jsonNode != null && jsonNode.has("isDuplicate")) {
                        boolean isDup = jsonNode.get("isDuplicate").asBoolean();
                        Long matchId = jsonNode.has("matchingReportId") && !jsonNode.get("matchingReportId").isNull()
                                ? jsonNode.get("matchingReportId").asLong() : null;
                        String reason = jsonNode.has("similarityReason") ? jsonNode.get("similarityReason").asText()
                                : "Similar issue may already have been reported near this location.";

                        if (isDup && matchId != null) {
                            Optional<SafetyReport> matchReportOpt = safetyReportRepository.findById(matchId);
                            if (matchReportOpt.isPresent()) {
                                SafetyReport m = matchReportOpt.get();
                                DuplicateReportMatch match = DuplicateReportMatch.builder()
                                        .reportId(m.getId())
                                        .title(m.getTitle())
                                        .category(m.getCategory())
                                        .severity(m.getSeverity())
                                        .status(m.getStatus())
                                        .location(m.getLocation())
                                        .similarityReason(reason)
                                        .reporterName(m.getReporter() != null ? m.getReporter().getName() : "Resident")
                                        .reporterApartment(m.getReporter() != null ? m.getReporter().getApartmentNumber() : "")
                                        .build();

                                return DetectDuplicateResponse.builder()
                                        .isDuplicate(true)
                                        .similarReport(match)
                                        .message(reason)
                                        .build();
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Gemini duplicate detection failed, using fallback: {}", e.getMessage());
            }
        }

        // Graceful Rule-Based Fallback
        return fallbackDuplicateDetection(newTitle, newDesc, newLoc, activeReports);
    }

    /**
     * AI Feature 3: Event Description Assistance
     */
    public GenerateEventDescriptionResponse generateEventDescription(GenerateEventDescriptionRequest request) {
        String title = request.getTitle() != null ? request.getTitle() : "Community Event";
        EventCategory category = request.getCategory() != null ? request.getCategory() : EventCategory.OTHER;
        String notes = request.getNotes() != null ? request.getNotes() : "";

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String prompt = String.format("""
                    %s
                    Write a concise, warm, community-friendly event announcement for a residential housing society app.
                    Event Title: "%s"
                    Event Category: %s
                    Resident Notes: "%s"

                    Requirements:
                    - Keep it under 3 short sentences.
                    - Welcoming tone inviting neighbors and families.
                    - Do not use markdown code blocks, return raw text.
                    """, AI_SAFETY_SYSTEM_PROMPT, title, category.name(), notes);

                String aiResponse = callGeminiApi(prompt);
                if (aiResponse != null && !aiResponse.trim().isEmpty()) {
                    return GenerateEventDescriptionResponse.builder()
                            .generatedDescription(aiResponse.trim())
                            .isAiGenerated(true)
                            .build();
                }
            } catch (Exception e) {
                log.warn("Gemini event description generation failed, using fallback: {}", e.getMessage());
            }
        }

        // Fallback generator
        String fallbackDesc = String.format(
                "Join your neighbors for %s! We are organizing a society %s activity. %s All residents, families, and friends are warmly welcome to participate.",
                title,
                category.name().toLowerCase().replace('_', ' '),
                notes.isEmpty() ? "Come meet fellow residents and build a connected community." : notes
        );

        return GenerateEventDescriptionResponse.builder()
                .generatedDescription(fallbackDesc)
                .isAiGenerated(false)
                .build();
    }

    // --- Private Helper Methods ---

    private String callGeminiApi(String prompt) {
        try {
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    modelName, apiKey.trim());

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> contentObj = Map.of("parts", List.of(textPart));
            Map<String, Object> requestBody = Map.of("contents", List.of(contentObj));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode candidates = rootNode.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Gemini API REST call error: {}", e.getMessage());
        }
        return null;
    }

    private JsonNode parseJsonFromResponse(String rawText) {
        try {
            String cleaned = rawText.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();
            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            return null;
        }
    }

    private ClassifyReportResponse fallbackClassify(String fullText) {
        String lower = fullText.toLowerCase();

        SafetyCategory category = SafetyCategory.OTHER;
        SafetySeverity severity = SafetySeverity.MEDIUM;

        if (lower.contains("light") || lower.contains("lamp") || lower.contains("dark") || lower.contains("bulb")) {
            category = SafetyCategory.LIGHTING;
        } else if (lower.contains("water") || lower.contains("leak") || lower.contains("pipe") || lower.contains("drain") || lower.contains("tank")) {
            category = SafetyCategory.WATER;
        } else if (lower.contains("gate") || lower.contains("lock") || lower.contains("cctv") || lower.contains("guard") || lower.contains("door")) {
            category = SafetyCategory.SECURITY;
        } else if (lower.contains("lift") || lower.contains("elevator") || lower.contains("wall") || lower.contains("crack") || lower.contains("road") || lower.contains("pothole")) {
            category = SafetyCategory.INFRASTRUCTURE;
        } else if (lower.contains("clean") || lower.contains("garbage") || lower.contains("stair") || lower.contains("repair")) {
            category = SafetyCategory.MAINTENANCE;
        }

        if (lower.contains("urgent") || lower.contains("danger") || lower.contains("fire") || lower.contains("spark") || lower.contains("broken glass")) {
            severity = SafetySeverity.HIGH;
        } else if (lower.contains("minor") || lower.contains("small")) {
            severity = SafetySeverity.LOW;
        }

        String summary = fullText.length() > 60 ? fullText.substring(0, 57) + "..." : fullText;

        return ClassifyReportResponse.builder()
                .category(category)
                .severity(severity)
                .summary(summary)
                .isAiGenerated(false)
                .build();
    }

    private DetectDuplicateResponse fallbackDuplicateDetection(String title, String desc, String loc, List<SafetyReport> reports) {
        for (SafetyReport r : reports) {
            String rTitle = r.getTitle().toLowerCase();
            String rLoc = r.getLocation().toLowerCase();

            boolean titleMatch = !title.isEmpty() && (rTitle.contains(title) || title.contains(rTitle));
            boolean locMatch = !loc.isEmpty() && (rLoc.contains(loc) || loc.contains(rLoc));

            if (titleMatch || (locMatch && r.getCategory() != null)) {
                DuplicateReportMatch match = DuplicateReportMatch.builder()
                        .reportId(r.getId())
                        .title(r.getTitle())
                        .category(r.getCategory())
                        .severity(r.getSeverity())
                        .status(r.getStatus())
                        .location(r.getLocation())
                        .similarityReason("Similar issue may already have been reported near this location.")
                        .reporterName(r.getReporter() != null ? r.getReporter().getName() : "Resident")
                        .reporterApartment(r.getReporter() != null ? r.getReporter().getApartmentNumber() : "")
                        .build();

                return DetectDuplicateResponse.builder()
                        .isDuplicate(true)
                        .similarReport(match)
                        .message("Similar issue may already have been reported near this location.")
                        .build();
            }
        }

        return DetectDuplicateResponse.builder()
                .isDuplicate(false)
                .similarReport(null)
                .message("No duplicate reports detected.")
                .build();
    }

    private SafetyCategory parseCategory(String text) {
        try {
            return SafetyCategory.valueOf(text.toUpperCase().trim());
        } catch (Exception e) {
            return SafetyCategory.OTHER;
        }
    }

    private SafetySeverity parseSeverity(String text) {
        try {
            return SafetySeverity.valueOf(text.toUpperCase().trim());
        } catch (Exception e) {
            return SafetySeverity.MEDIUM;
        }
    }
}
