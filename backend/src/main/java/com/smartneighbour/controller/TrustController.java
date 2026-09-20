package com.smartneighbour.controller;

import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.dto.TrustDto.TrustSummaryResponse;
import com.smartneighbour.dto.TrustDto.TrustTransactionResponse;
import com.smartneighbour.security.UserPrincipal;
import com.smartneighbour.service.TrustService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trust")
@RequiredArgsConstructor
public class TrustController {

    private final TrustService trustService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<TrustSummaryResponse>> getMyTrustSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        TrustSummaryResponse summary = trustService.getTrustSummary(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/me/history")
    public ResponseEntity<ApiResponse<List<TrustTransactionResponse>>> getMyTrustHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TrustTransactionResponse> history = trustService.getTrustHistory(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<TrustSummaryResponse>> getUserTrustSummary(
            @PathVariable Long userId) {
        TrustSummaryResponse summary = trustService.getTrustSummary(userId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/user/{userId}/history")
    public ResponseEntity<ApiResponse<List<TrustTransactionResponse>>> getUserTrustHistory(
            @PathVariable Long userId) {
        List<TrustTransactionResponse> history = trustService.getTrustHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/admin/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TrustTransactionResponse>>> getAllTransactionsForAdmin() {
        List<TrustTransactionResponse> history = trustService.getAllTrustTransactionsForAdmin();
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}

