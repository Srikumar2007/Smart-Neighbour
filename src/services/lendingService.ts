import { apiClient } from './api';
import { LendingItem, BorrowRequest, ItemCategory } from '../types';
import { societyStore } from './store';
import { itemService } from './itemService';
import { borrowService } from './borrowService';

export interface CreateItemPayload {
  title: string;
  description: string;
  category: ItemCategory;
  maxBorrowDays?: number;
  depositRequired?: number;
  imageUrl?: string;
  tags?: string[];
}

export interface CreateBorrowRequestPayload {
  itemId: string;
  requestedDays: number;
  purpose: string;
}

export const lendingService = {
  /**
   * GET /api/items
   */
  async getItems(category?: string, search?: string): Promise<LendingItem[]> {
    return itemService.getItems(category, search);
  },

  /**
   * POST /api/items
   */
  async createItem(
    payload: CreateItemPayload,
    currentUser?: { id: string; name: string; apartmentNumber: string; block: string; trustScore: number }
  ): Promise<LendingItem> {
    return itemService.createItem(payload, currentUser);
  },

  /**
   * GET all borrow requests
   */
  async getBorrowRequests(): Promise<BorrowRequest[]> {
    const my = await borrowService.getMyRequests();
    const rec = await borrowService.getReceivedRequests();
    const combined = [...my, ...rec];
    if (combined.length > 0) return combined;
    return societyStore.getBorrowRequests();
  },

  /**
   * GET /api/borrow-requests/my
   */
  async getMyRequests(): Promise<BorrowRequest[]> {
    return borrowService.getMyRequests();
  },

  /**
   * GET /api/borrow-requests/received
   */
  async getReceivedRequests(): Promise<BorrowRequest[]> {
    return borrowService.getReceivedRequests();
  },

  /**
   * POST /api/borrow-requests
   */
  async createBorrowRequest(payload: CreateBorrowRequestPayload, requester?: any): Promise<BorrowRequest> {
    return borrowService.createRequest({
      itemId: payload.itemId,
      requestedDays: payload.requestedDays,
      purpose: payload.purpose,
      message: payload.purpose,
    }, requester);
  },

  /**
   * Alias for requestBorrow matching legacy UI components
   */
  async requestBorrow(payload: CreateBorrowRequestPayload, requester?: any): Promise<BorrowRequest> {
    return this.createBorrowRequest(payload, requester);
  },

  /**
   * PUT /api/borrow-requests/{id}/approve or reject
   */
  async updateBorrowStatus(requestId: string, status: 'APPROVED' | 'REJECTED' | 'RETURNED'): Promise<void> {
    if (status === 'APPROVED') {
      await borrowService.approveRequest(requestId);
    } else if (status === 'REJECTED') {
      await borrowService.rejectRequest(requestId);
    } else if (status === 'RETURNED') {
      await borrowService.returnItem(requestId);
    }
  },

  /**
   * Alias for updateBorrowRequestStatus matching legacy UI components
   */
  async updateBorrowRequestStatus(requestId: string, status: 'APPROVED' | 'REJECTED' | 'RETURNED'): Promise<void> {
    return this.updateBorrowStatus(requestId, status);
  }
};

export default lendingService;
