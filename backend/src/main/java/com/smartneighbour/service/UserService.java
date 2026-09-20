package com.smartneighbour.service;

import com.smartneighbour.dto.AuthDto;
import com.smartneighbour.dto.AuthDto.AuthResponse;
import com.smartneighbour.dto.AuthDto.LoginRequest;
import com.smartneighbour.dto.AuthDto.RegisterRequest;
import com.smartneighbour.dto.AuthDto.UserSummary;
import com.smartneighbour.entity.Role;
import com.smartneighbour.entity.User;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.UserRepository;
import com.smartneighbour.security.JwtTokenProvider;
import com.smartneighbour.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email is already in use by another resident", HttpStatus.CONFLICT);
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.RESIDENT;

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .apartmentNumber(request.getApartmentNumber())
                .block(request.getBlock())
                .role(assignedRole)
                .trustPoints(50) // Initial community trust points
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toUserSummary(savedUser))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        return AuthResponse.builder()
                .token(token)
                .user(toUserSummary(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserSummary getCurrentUser(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return toUserSummary(user);
    }

    @Transactional
    public UserSummary updateCurrentUser(Long currentUserId, AuthDto.UpdateUserRequest request) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getApartmentNumber() != null) user.setApartmentNumber(request.getApartmentNumber());
        if (request.getBlock() != null) user.setBlock(request.getBlock());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());

        User updatedUser = userRepository.save(user);
        return toUserSummary(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserSummary getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found with id: " + id, HttpStatus.NOT_FOUND));
        return toUserSummary(user);
    }

    public UserSummary toUserSummary(User user) {
        return UserSummary.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .apartmentNumber(user.getApartmentNumber())
                .block(user.getBlock())
                .role(user.getRole())
                .trustPoints(user.getTrustPoints())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .active(user.getActive())
                .build();
    }
}
