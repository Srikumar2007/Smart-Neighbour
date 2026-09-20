package com.smartneighbour.service;

import com.smartneighbour.dto.ItemDto.CreateItemRequest;
import com.smartneighbour.dto.ItemDto.ItemResponse;
import com.smartneighbour.dto.ItemDto.UpdateItemRequest;
import com.smartneighbour.entity.AvailabilityStatus;
import com.smartneighbour.entity.Item;
import com.smartneighbour.entity.ItemCategory;
import com.smartneighbour.entity.User;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.ItemRepository;
import com.smartneighbour.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ItemResponse> getAllItems(ItemCategory category, AvailabilityStatus status, String search) {
        List<Item> items;
        if (category != null) {
            items = itemRepository.findByCategory(category);
        } else if (status != null) {
            items = itemRepository.findByAvailabilityStatus(status);
        } else if (search != null && !search.trim().isEmpty()) {
            items = itemRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search.trim(), search.trim());
        } else {
            items = itemRepository.findAll();
        }

        return items.stream().map(this::toItemResponse).toList();
    }

    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new AppException("Item not found with id: " + id, HttpStatus.NOT_FOUND));
        return toItemResponse(item);
    }

    @Transactional
    public ItemResponse createItem(Long currentUserId, CreateItemRequest request) {
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Item item = Item.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .owner(owner)
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .build();

        Item saved = itemRepository.save(item);
        return toItemResponse(saved);
    }

    @Transactional
    public ItemResponse updateItem(Long currentUserId, Long itemId, UpdateItemRequest request) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new AppException("Item not found with id: " + itemId, HttpStatus.NOT_FOUND));

        if (!item.getOwner().getId().equals(currentUserId)) {
            throw new AppException("You do not have permission to edit this item", HttpStatus.FORBIDDEN);
        }

        if (request.getName() != null) item.setName(request.getName().trim());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getCategory() != null) item.setCategory(request.getCategory());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());
        if (request.getAvailabilityStatus() != null) item.setAvailabilityStatus(request.getAvailabilityStatus());

        Item updated = itemRepository.save(item);
        return toItemResponse(updated);
    }

    @Transactional
    public void deleteItem(Long currentUserId, Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new AppException("Item not found with id: " + itemId, HttpStatus.NOT_FOUND));

        if (!item.getOwner().getId().equals(currentUserId)) {
            throw new AppException("You do not have permission to delete this item", HttpStatus.FORBIDDEN);
        }

        itemRepository.delete(item);
    }

    public ItemResponse toItemResponse(Item item) {
        User owner = item.getOwner();
        return ItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .imageUrl(item.getImageUrl())
                .ownerId(owner.getId())
                .ownerName(owner.getFullName())
                .ownerApartment(owner.getApartmentNumber())
                .ownerBlock(owner.getBlock())
                .ownerTrustPoints(owner.getTrustPoints())
                .availabilityStatus(item.getAvailabilityStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
