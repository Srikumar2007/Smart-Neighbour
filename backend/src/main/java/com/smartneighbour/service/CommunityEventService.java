package com.smartneighbour.service;

import com.smartneighbour.dto.EventDto.CreateEventRequest;
import com.smartneighbour.dto.EventDto.EventResponse;
import com.smartneighbour.dto.EventDto.ParticipantSummary;
import com.smartneighbour.dto.EventDto.UpdateEventRequest;
import com.smartneighbour.entity.CommunityEvent;
import com.smartneighbour.entity.EventParticipant;
import com.smartneighbour.entity.Role;
import com.smartneighbour.entity.User;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.CommunityEventRepository;
import com.smartneighbour.repository.EventParticipantRepository;
import com.smartneighbour.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityEventService {

    private final CommunityEventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final TrustTransactionRepository trustTransactionRepository;
    private final TrustService trustService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents(Long currentUserId) {
        List<CommunityEvent> events = eventRepository.findAllByOrderByEventDateDesc();
        return events.stream().map(e -> toResponse(e, currentUserId)).toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id, Long currentUserId) {
        CommunityEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new AppException("Event not found with id: " + id, HttpStatus.NOT_FOUND));
        return toResponse(event, currentUserId);
    }

    @Transactional
    public EventResponse createEvent(Long organizerId, CreateEventRequest request) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (request.getEndTime() != null && request.getStartTime() != null && request.getEndTime().isBefore(request.getStartTime())) {
            throw new AppException("End time cannot be before start time", HttpStatus.BAD_REQUEST);
        }

        CommunityEvent event = CommunityEvent.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation().trim())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .category(request.getCategory() != null ? request.getCategory() : com.smartneighbour.entity.EventCategory.OTHER)
                .status(com.smartneighbour.entity.EventStatus.UPCOMING)
                .organizer(organizer)
                .imageUrl(request.getImageUrl())
                .build();

        CommunityEvent saved = eventRepository.save(event);

        // Organizer automatically joins their own event
        EventParticipant participant = EventParticipant.builder()
                .event(saved)
                .user(organizer)
                .build();
        participantRepository.save(participant);

        // Award trust points for organizing (if not already awarded)
        if (!trustTransactionRepository.existsByUserIdAndReferenceTypeAndReferenceId(organizerId, "EVENT_ORGANIZE", saved.getId())) {
            trustService.addPoints(organizerId, 20, "Organized community event: " + saved.getTitle(), "EVENT_ORGANIZE", saved.getId());
        }

        return toResponse(saved, organizerId);
    }

    @Transactional
    public EventResponse updateEvent(Long currentUserId, Long eventId, UpdateEventRequest request) {
        CommunityEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException("Event not found with id: " + eventId, HttpStatus.NOT_FOUND));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (!event.getOrganizer().getId().equals(currentUserId) && currentUser.getRole() != Role.ADMIN) {
            throw new AppException("Only the organizer or an admin can modify this event", HttpStatus.FORBIDDEN);
        }

        if (request.getTitle() != null) event.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) event.setDescription(request.getDescription().trim());
        if (request.getEventDate() != null) event.setEventDate(request.getEventDate());
        if (request.getStartTime() != null) event.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) event.setEndTime(request.getEndTime());
        if (request.getLocation() != null) event.setLocation(request.getLocation().trim());
        if (request.getLatitude() != null) event.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) event.setLongitude(request.getLongitude());
        if (request.getCategory() != null) event.setCategory(request.getCategory());
        if (request.getStatus() != null) event.setStatus(request.getStatus());
        if (request.getImageUrl() != null) event.setImageUrl(request.getImageUrl());

        CommunityEvent updated = eventRepository.save(event);

        // Notify participants about event update
        List<EventParticipant> participants = participantRepository.findByEventId(eventId);
        for (EventParticipant p : participants) {
            if (!p.getUser().getId().equals(currentUserId)) {
                notificationService.createNotification(
                        p.getUser().getId(),
                        "Event Updated",
                        "Organizer updated event details for: " + updated.getTitle(),
                        "EVENT_UPDATE"
                );
            }
        }

        return toResponse(updated, currentUserId);
    }

    @Transactional
    public void deleteEvent(Long currentUserId, Long eventId) {
        CommunityEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException("Event not found with id: " + eventId, HttpStatus.NOT_FOUND));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (!event.getOrganizer().getId().equals(currentUserId) && currentUser.getRole() != Role.ADMIN) {
            throw new AppException("Only the organizer or an admin can cancel this event", HttpStatus.FORBIDDEN);
        }

        // Notify participants before deleting
        List<EventParticipant> participants = participantRepository.findByEventId(eventId);
        for (EventParticipant p : participants) {
            if (!p.getUser().getId().equals(currentUserId)) {
                notificationService.createNotification(
                        p.getUser().getId(),
                        "Event Cancelled",
                        "The community event '" + event.getTitle() + "' has been cancelled by the organizer.",
                        "EVENT_CANCEL"
                );
            }
        }

        eventRepository.delete(event);
    }

    @Transactional
    public void joinEvent(Long currentUserId, Long eventId) {
        CommunityEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException("Event not found with id: " + eventId, HttpStatus.NOT_FOUND));

        if (participantRepository.existsByEventIdAndUserId(eventId, currentUserId)) {
            throw new AppException("You are already registered for this event", HttpStatus.CONFLICT);
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        EventParticipant participant = EventParticipant.builder()
                .event(event)
                .user(user)
                .build();

        participantRepository.save(participant);

        // Community participation trust point (Prevent duplicate rewards)
        if (!trustTransactionRepository.existsByUserIdAndReferenceTypeAndReferenceId(currentUserId, "EVENT_JOIN", event.getId())) {
            trustService.addPoints(currentUserId, 5, "Joined community event: " + event.getTitle(), "EVENT_JOIN", event.getId());
        }

        // Notify organizer
        if (!event.getOrganizer().getId().equals(currentUserId)) {
            notificationService.createNotification(
                    event.getOrganizer().getId(),
                    "New Event Attendee",
                    user.getFullName() + " joined your event: " + event.getTitle(),
                    "EVENT_JOIN"
            );
        }
    }

    @Transactional
    public void leaveEvent(Long currentUserId, Long eventId) {
        if (!participantRepository.existsByEventIdAndUserId(eventId, currentUserId)) {
            throw new AppException("You are not registered for this event", HttpStatus.BAD_REQUEST);
        }
        participantRepository.deleteByEventIdAndUserId(eventId, currentUserId);
    }

    public EventResponse toResponse(CommunityEvent event, Long currentUserId) {
        List<EventParticipant> participants = participantRepository.findByEventId(event.getId());

        boolean isJoined = currentUserId != null && participants.stream()
                .anyMatch(p -> p.getUser().getId().equals(currentUserId));

        List<ParticipantSummary> participantSummaries = participants.stream()
                .map(p -> ParticipantSummary.builder()
                        .userId(p.getUser().getId())
                        .userName(p.getUser().getFullName())
                        .apartmentNumber(p.getUser().getApartmentNumber())
                        .profileImage(p.getUser().getProfileImage())
                        .joinedAt(p.getJoinedAt())
                        .build())
                .toList();

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .location(event.getLocation())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .category(event.getCategory() != null ? event.getCategory() : com.smartneighbour.entity.EventCategory.OTHER)
                .status(event.getStatus() != null ? event.getStatus() : com.smartneighbour.entity.EventStatus.UPCOMING)
                .organizerId(event.getOrganizer().getId())
                .organizerName(event.getOrganizer().getFullName())
                .organizerApartment(event.getOrganizer().getApartmentNumber())
                .imageUrl(event.getImageUrl())
                .createdAt(event.getCreatedAt())
                .participantsCount(participants.size())
                .isJoinedByMe(isJoined)
                .participants(participantSummaries)
                .build();
    }
}
