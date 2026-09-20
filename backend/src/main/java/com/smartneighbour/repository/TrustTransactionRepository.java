package com.smartneighbour.repository;

import com.smartneighbour.entity.TrustTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrustTransactionRepository extends JpaRepository<TrustTransaction, Long> {
    List<TrustTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndReferenceTypeAndReferenceId(Long userId, String referenceType, Long referenceId);
}
