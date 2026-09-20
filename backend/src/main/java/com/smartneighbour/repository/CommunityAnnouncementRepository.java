package com.smartneighbour.repository;

import com.smartneighbour.entity.CommunityAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityAnnouncementRepository extends JpaRepository<CommunityAnnouncement, Long> {
    List<CommunityAnnouncement> findByActiveTrueOrderByCreatedAtDesc();
    List<CommunityAnnouncement> findAllByOrderByCreatedAtDesc();
}
