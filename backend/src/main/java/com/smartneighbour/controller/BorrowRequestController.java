package com.smartneighbour.controller;

import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.dto.BorrowRequestDto.BorrowRequestResponse;
import com.smartneighbour.dto.BorrowRequestDto.CreateBorrowRequest;
import com.smartneighbour.security.UserPrincipal;
import com.smartneighbour.service.BorrowRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow-requests")
@RequiredArgsConstructor
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<BorrowRequestResponse>> createRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateBorrowRequest request) {
        BorrowRequestResponse response = borrowRequestService.createBorrowRequest(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Borrow request sent to owner"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BorrowRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<BorrowRequestResponse> requests = borrowRequestService.getMyRequests(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/received")
    public ResponseEntity<ApiResponse<List<BorrowRequestResponse>>> getReceivedRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<BorrowRequestResponse> requests = borrowRequestService.getReceivedRequests(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BorrowRequestResponse>> approveRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BorrowRequestResponse response = borrowRequestService.approveRequest(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Borrow request approved"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BorrowRequestResponse>> rejectRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BorrowRequestResponse response = borrowRequestService.rejectRequest(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Borrow request rejected"));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<ApiResponse<BorrowRequestResponse>> returnItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BorrowRequestResponse response = borrowRequestService.returnItem(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Item marked as returned and trust points awarded"));
    }
}
