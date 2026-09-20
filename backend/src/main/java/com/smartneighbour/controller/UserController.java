package com.smartneighbour.controller;

import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.dto.AuthDto.UpdateUserRequest;
import com.smartneighbour.dto.AuthDto.UserSummary;
import com.smartneighbour.security.UserPrincipal;
import com.smartneighbour.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        UserSummary summary = userService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateUserRequest request) {
        UserSummary updated = userService.updateCurrentUser(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserSummary>> getUserById(@PathVariable Long id) {
        UserSummary summary = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
