package com.smartneighbour.repository;

import com.smartneighbour.entity.SafetyCategory;
import com.smartneighbour.entity.SafetyReport;
import com.smartneighbour.entity.SafetyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafetyReportRepository extends JpaRepository<SafetyReport, Long> {
    List<SafetyReport> findByStatusOrderByCreatedAtDesc(SafetyStatus status);
    List<SafetyReport> findByCategory(SafetyCategory category);
    List<SafetyReport> findByCategoryAndStatusOrderByCreatedAtDesc(SafetyCategory category, SafetyStatus status);
    List<SafetyReport> findByStatusInOrderByCreatedAtDesc(List<SafetyStatus> statuses);
    List<SafetyReport> findByReporterIdOrderByCreatedAtDesc(Long reporterId);
    List<SafetyReport> findAllByOrderByCreatedAtDesc();
}
