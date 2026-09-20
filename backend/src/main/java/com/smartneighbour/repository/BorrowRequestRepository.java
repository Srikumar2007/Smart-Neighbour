package com.smartneighbour.repository;

import com.smartneighbour.entity.BorrowRequest;
import com.smartneighbour.entity.BorrowRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {
    List<BorrowRequest> findByBorrowerIdOrderByCreatedAtDesc(Long borrowerId);
    List<BorrowRequest> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<BorrowRequest> findByItemId(Long itemId);
    List<BorrowRequest> findByItemIdAndStatus(Long itemId, BorrowRequestStatus status);
}
