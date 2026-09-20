package com.smartneighbour.service;

import com.smartneighbour.dto.TrustDto.TrustSummaryResponse;
import com.smartneighbour.dto.TrustDto.TrustTransactionResponse;
import com.smartneighbour.entity.TrustTransaction;
import com.smartneighbour.entity.User;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.TrustTransactionRepository;
import com.smartneighbour.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrustService {

    private final TrustTransactionRepository trustTransactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Data
    @AllArgsConstructor
    public static class LevelInfo {
        private String levelTitle;
        private String nextLevelTitle;
        private int pointsToNextLevel;
        private int nextLevelThreshold;
        private int progressPercentage;
    }

    public static LevelInfo calculateLevelInfo(int points) {
        if (points >= 200) {
            return new LevelInfo("Community Leader", null, 0, 200, 100);
        } else if (points >= 100) {
            int threshold = 200;
            int needed = threshold - points;
            int progress = (int) Math.min(100, Math.round((double) points / threshold * 100));
            return new LevelInfo("Community Champion", "Community Leader", needed, threshold, progress);
        } else if (points >= 50) {
            int threshold = 100;
            int needed = threshold - points;
            int progress = (int) Math.min(100, Math.round((double) points / threshold * 100));
            return new LevelInfo("Trusted Neighbor", "Community Champion", needed, threshold, progress);
        } else if (points >= 25) {
            int threshold = 50;
            int needed = threshold - points;
            int progress = (int) Math.min(100, Math.round((double) points / threshold * 100));
            return new LevelInfo("Active Neighbor", "Trusted Neighbor", needed, threshold, progress);
        } else {
            int threshold = 25;
            int needed = Math.max(0, threshold - points);
            int progress = (int) Math.min(100, Math.round((double) Math.max(0, points) / threshold * 100));
            return new LevelInfo("New Neighbor", "Active Neighbor", needed, threshold, progress);
        }
    }

    @Transactional
    public void addPoints(Long userId, int points, String reason, String referenceType, Long referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        int newScore = Math.max(0, user.getTrustPoints() + points);
        user.setTrustPoints(newScore);
        userRepository.save(user);

        TrustTransaction transaction = TrustTransaction.builder()
                .user(user)
                .points(points)
                .reason(reason)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();

        trustTransactionRepository.save(transaction);

        // Generate readable notification for trust points
        if (points > 0 && notificationService != null) {
            notificationService.createNotification(
                    userId,
                    "Trust Points Earned 🎉",
                    "You earned +" + points + " Trust Points for: " + reason,
                    "TRUST_AWARD",
                    "/trust-points"
            );
        }
    }

    @Transactional(readOnly = true)
    public TrustSummaryResponse getTrustSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        int points = user.getTrustPoints();
        LevelInfo info = calculateLevelInfo(points);

        return TrustSummaryResponse.builder()
                .userId(user.getId())
                .userName(user.getFullName())
                .trustPoints(points)
                .trustLevel(info.getLevelTitle())
                .nextTrustLevel(info.getNextLevelTitle())
                .pointsToNextLevel(info.getPointsToNextLevel())
                .nextLevelThreshold(info.getNextLevelThreshold())
                .progressPercentage(info.getProgressPercentage())
                .itemsShared(user.getItems().size())
                .successfulBorrows(user.getBorrowRequests().size())
                .eventsOrganized(user.getEvents().size())
                .verifiedSafetyReports(user.getSafetyReports().size())
                .build();
    }

    @Transactional(readOnly = true)
    public List<TrustTransactionResponse> getTrustHistory(Long userId) {
        return trustTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(tx -> TrustTransactionResponse.builder()
                        .id(tx.getId())
                        .userId(tx.getUser().getId())
                        .userName(tx.getUser().getFullName())
                        .apartmentNumber(tx.getUser().getApartmentNumber())
                        .points(tx.getPoints())
                        .reason(tx.getReason())
                        .referenceType(tx.getReferenceType())
                        .referenceId(tx.getReferenceId())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrustTransactionResponse> getAllTrustTransactionsForAdmin() {
        return trustTransactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(tx -> TrustTransactionResponse.builder()
                        .id(tx.getId())
                        .userId(tx.getUser().getId())
                        .userName(tx.getUser().getFullName())
                        .apartmentNumber(tx.getUser().getApartmentNumber())
                        .points(tx.getPoints())
                        .reason(tx.getReason())
                        .referenceType(tx.getReferenceType())
                        .referenceId(tx.getReferenceId())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .toList();
    }
}

