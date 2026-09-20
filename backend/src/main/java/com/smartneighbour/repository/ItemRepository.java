package com.smartneighbour.repository;

import com.smartneighbour.entity.AvailabilityStatus;
import com.smartneighbour.entity.Item;
import com.smartneighbour.entity.ItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByOwnerId(Long ownerId);
    List<Item> findByAvailabilityStatus(AvailabilityStatus status);
    List<Item> findByCategory(ItemCategory category);
    List<Item> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
