package com.smartneighbour.service;

import com.smartneighbour.dto.BorrowRequestDto.BorrowRequestResponse;
import com.smartneighbour.dto.BorrowRequestDto.CreateBorrowRequest;
import com.smartneighbour.entity.*;
import com.smartneighbour.exception.AppException;
import com.smartneighbour.repository.BorrowRequestRepository;
import com.smartneighbour.repository.ItemRepository;
import com.smartneighbour.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final TrustService trustService;
    private final NotificationService notificationService;

    @Transactional
    public BorrowRequestResponse createBorrowRequest(Long borrowerId, CreateBorrowRequest request) {
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new AppException("Item not found", HttpStatus.NOT_FOUND));

        if (item.getOwner().getId().equals(borrowerId)) {
            throw new AppException("You cannot borrow your own item", HttpStatus.BAD_REQUEST);
        }

        if (item.getAvailabilityStatus() == AvailabilityStatus.BORROWED) {
            throw new AppException("Item is currently borrowed by another resident", HttpStatus.CONFLICT);
        }

        if (request.getRequestedUntil().isBefore(request.getRequestedFrom())) {
            throw new AppException("Requested end time cannot be before start time", HttpStatus.BAD_REQUEST);
        }

        User borrower = userRepository.findById(borrowerId)
                .orElseThrow(() -> new AppException("Borrower not found", HttpStatus.NOT_FOUND));

        BorrowRequest borrowRequest = BorrowRequest.builder()
                .item(item)
                .borrower(borrower)
                .owner(item.getOwner())
                .requestedFrom(request.getRequestedFrom())
                .requestedUntil(request.getRequestedUntil())
                .message(request.getMessage())
                .status(BorrowRequestStatus.PENDING)
                .build();

        BorrowRequest saved = borrowRequestRepository.save(borrowRequest);

        // Notify owner
        notificationService.createNotification(
                item.getOwner().getId(),
                "New Borrow Request",
                borrower.getFullName() + " requested to borrow your " + item.getName(),
                "BORROW_REQUEST"
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BorrowRequestResponse> getMyRequests(Long borrowerId) {
        return borrowRequestRepository.findByBorrowerIdOrderByCreatedAtDesc(borrowerId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRequestResponse> getReceivedRequests(Long ownerId) {
        return borrowRequestRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public BorrowRequestResponse approveRequest(Long currentUserId, Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException("Borrow request not found", HttpStatus.NOT_FOUND));

        if (!request.getOwner().getId().equals(currentUserId)) {
            throw new AppException("Only the item owner can approve this request", HttpStatus.FORBIDDEN);
        }

        if (request.getStatus() != BorrowRequestStatus.PENDING) {
            throw new AppException("Only PENDING requests can be approved", HttpStatus.BAD_REQUEST);
        }

        request.setStatus(BorrowRequestStatus.APPROVED);
        request.getItem().setAvailabilityStatus(AvailabilityStatus.BORROWED);

        borrowRequestRepository.save(request);
        itemRepository.save(request.getItem());

        // Notify borrower
        notificationService.createNotification(
                request.getBorrower().getId(),
                "Borrow Request Approved",
                request.getOwner().getFullName() + " approved your request for " + request.getItem().getName(),
                "BORROW_APPROVED"
        );

        return toResponse(request);
    }

    @Transactional
    public BorrowRequestResponse rejectRequest(Long currentUserId, Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException("Borrow request not found", HttpStatus.NOT_FOUND));

        if (!request.getOwner().getId().equals(currentUserId)) {
            throw new AppException("Only the item owner can reject this request", HttpStatus.FORBIDDEN);
        }

        request.setStatus(BorrowRequestStatus.REJECTED);
        borrowRequestRepository.save(request);

        notificationService.createNotification(
                request.getBorrower().getId(),
                "Borrow Request Declined",
                "Your request for " + request.getItem().getName() + " was declined",
                "BORROW_REJECTED"
        );

        return toResponse(request);
    }

    @Transactional
    public BorrowRequestResponse returnItem(Long currentUserId, Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException("Borrow request not found", HttpStatus.NOT_FOUND));

        // Either owner or borrower can mark return
        boolean isOwner = request.getOwner().getId().equals(currentUserId);
        boolean isBorrower = request.getBorrower().getId().equals(currentUserId);

        if (!isOwner && !isBorrower) {
            throw new AppException("You are not part of this borrow transaction", HttpStatus.FORBIDDEN);
        }

        request.setStatus(BorrowRequestStatus.RETURNED);
        request.getItem().setAvailabilityStatus(AvailabilityStatus.AVAILABLE);

        borrowRequestRepository.save(request);
        itemRepository.save(request.getItem());

        // Award trust points to both for successful sharing!
        trustService.addPoints(request.getOwner().getId(), 15, "Successfully lent " + request.getItem().getName(), "LEND", request.getId());
        trustService.addPoints(request.getBorrower().getId(), 10, "Returned " + request.getItem().getName() + " on time", "BORROW", request.getId());

        notificationService.createNotification(
                request.getOwner().getId(),
                "Item Returned",
                request.getItem().getName() + " has been marked as returned! +15 Trust Points",
                "ITEM_RETURNED"
        );

        return toResponse(request);
    }

    public BorrowRequestResponse toResponse(BorrowRequest req) {
        return BorrowRequestResponse.builder()
                .id(req.getId())
                .itemId(req.getItem().getId())
                .itemName(req.getItem().getName())
                .itemImageUrl(req.getItem().getImageUrl())
                .borrowerId(req.getBorrower().getId())
                .borrowerName(req.getBorrower().getFullName())
                .borrowerApartment(req.getBorrower().getApartmentNumber())
                .borrowerBlock(req.getBorrower().getBlock())
                .borrowerTrustPoints(req.getBorrower().getTrustPoints())
                .ownerId(req.getOwner().getId())
                .ownerName(req.getOwner().getFullName())
                .ownerApartment(req.getOwner().getApartmentNumber())
                .requestedFrom(req.getRequestedFrom())
                .requestedUntil(req.getRequestedUntil())
                .message(req.getMessage())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
