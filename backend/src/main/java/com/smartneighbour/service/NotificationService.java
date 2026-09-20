package com.smartneighbour.service;

import com.smartneighbour.dto.NotificationDto.NotificationResponse;
import com.smartneighbour.entity.Notification;
import com.smartneighbour.entity.User;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.NotificationRepository;
import com.smartneighbour.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(Long userId, String title, String message, String type, String link) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            String resolvedLink = link;
            if (resolvedLink == null || resolvedLink.isBlank()) {
                if ("BORROW_REQUEST".equals(type) || "BORROW_APPROVED".equals(type) || "BORROW_REJECTED".equals(type) || "BORROW_DUE_SOON".equals(type) || "ITEM_RETURNED".equals(type)) {
                    resolvedLink = "/share-borrow";
                } else if ("SAFETY_ALERT".equals(type) || "SAFETY_VERIFIED".equals(type) || "SAFETY_RESOLVED".equals(type)) {
                    resolvedLink = "/safety-watch";
                } else if ("EVENT_UPDATE".equals(type) || "EVENT_JOIN".equals(type) || "EVENT_CANCEL".equals(type)) {
                    resolvedLink = "/events";
                } else if ("TRUST_AWARD".equals(type)) {
                    resolvedLink = "/trust-points";
                } else {
                    resolvedLink = "/dashboard";
                }
            }

            Notification notif = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .link(resolvedLink)
                    .isRead(false)
                    .build();
            notificationRepository.save(notif);
        }
    }

    @Transactional
    public void createNotification(Long userId, String title, String message, String type) {
        createNotification(userId, title, message, type, null);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException("Notification not found", HttpStatus.NOT_FOUND));

        if (!notif.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .link(n.getLink() != null ? n.getLink() : "/dashboard")
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

