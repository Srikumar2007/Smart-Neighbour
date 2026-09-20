package com.smartneighbour.repository;

import com.smartneighbour.entity.CommunityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CommunityEventRepository extends JpaRepository<CommunityEvent, Long> {
    List<CommunityEvent> findByEventDateGreaterThanEqualOrderByEventDateAscStartTimeAsc(LocalDate date);
    List<CommunityEvent> findAllByOrderByEventDateDesc();
    List<CommunityEvent> findByOrganizerId(Long organizerId);
}
