package com.smartneighbour.controller;

import com.smartneighbour.dto.ApiResponse;
import com.smartneighbour.dto.AuthDto.AuthResponse;
import com.smartneighbour.dto.AuthDto.LoginRequest;
import com.smartneighbour.dto.AuthDto.RegisterRequest;
import com.smartneighbour.dto.AuthDto.UserSummary;
import com.smartneighbour.security.UserPrincipal;
import com.smartneighbour.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Resident account registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Logged in successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserSummary summary = userService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
