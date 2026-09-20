package com.smartneighbour.service;

import com.smartneighbour.dto.AnnouncementDto.AnnouncementResponse;
import com.smartneighbour.dto.AnnouncementDto.CreateAnnouncementRequest;
import com.smartneighbour.dto.AnnouncementDto.UpdateAnnouncementRequest;
import com.smartneighbour.entity.CommunityAnnouncement;
import com.smartneighbour.entity.User;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.CommunityAnnouncementRepository;
import com.smartneighbour.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final CommunityAnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getActiveAnnouncements() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public AnnouncementResponse createAnnouncement(Long authorId, CreateAnnouncementRequest request) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        CommunityAnnouncement announcement = CommunityAnnouncement.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .author(author)
                .active(true)
                .build();

        CommunityAnnouncement saved = announcementRepository.save(announcement);
        return toResponse(saved);
    }

    @Transactional
    public AnnouncementResponse updateAnnouncement(Long announcementId, UpdateAnnouncementRequest request) {
        CommunityAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new AppException("Announcement not found", HttpStatus.NOT_FOUND));

        if (request.getTitle() != null) announcement.setTitle(request.getTitle().trim());
        if (request.getContent() != null) announcement.setContent(request.getContent().trim());
        if (request.getActive() != null) announcement.setActive(request.getActive());

        CommunityAnnouncement updated = announcementRepository.save(announcement);
        return toResponse(updated);
    }

    @Transactional
    public void deleteAnnouncement(Long announcementId) {
        CommunityAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new AppException("Announcement not found", HttpStatus.NOT_FOUND));
        announcementRepository.delete(announcement);
    }

    private AnnouncementResponse toResponse(CommunityAnnouncement a) {
        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .authorId(a.getAuthor().getId())
                .authorName(a.getAuthor().getFullName())
                .active(a.getActive())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
