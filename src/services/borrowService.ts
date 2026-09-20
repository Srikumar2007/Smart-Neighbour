import { apiClient } from './api';
import { BorrowRequest } from '../types';
import { societyStore } from './store';

export interface CreateBorrowRequestPayload {
  itemId: string | number;
  requestedFrom?: string;
  requestedUntil?: string;
  requestedDays?: number;
  message?: string;
  purpose?: string;
}

export const borrowService = {
  /**
   * POST /api/borrow-requests
   */
  async createRequest(payload: CreateBorrowRequestPayload, requester?: any): Promise<BorrowRequest> {
    try {
      const now = new Date();
      const from = payload.requestedFrom || now.toISOString();
      const until = payload.requestedUntil || new Date(now.getTime() + (payload.requestedDays || 2) * 86400000).toISOString();

      const response = await apiClient.post<any>('/borrow-requests', {
        itemId: Number(payload.itemId) || 1,
        requestedFrom: from,
        requestedUntil: until,
        message: payload.message || payload.purpose || 'Would like to borrow this item for society use.',
      });

      const data = response.data?.data || response.data;
      return {
        id: String(data.id),
        itemId: String(data.itemId),
        itemTitle: data.itemName || 'Requested Item',
        requesterId: String(data.borrowerId),
        requesterName: data.borrowerName,
        requesterApartment: `${data.borrowerBlock || ''} ${data.borrowerApartment || ''}`.trim(),
        requesterTrustScore: data.borrowerTrustPoints || 80,
        ownerId: String(data.ownerId),
        requestedDays: payload.requestedDays || 2,
        purpose: data.message,
        status: data.status,
        requestedAt: data.createdAt || new Date().toISOString(),
      };
    } catch {
      const newReq: BorrowRequest = {
        id: `req-${Date.now()}`,
        itemId: String(payload.itemId),
        itemTitle: 'Item',
        requesterId: requester?.id || 'usr-1',
        requesterName: requester?.name || 'Priya Sharma',
        requesterApartment: `${requester?.block || 'Block B'}-${requester?.apartmentNumber || '402'}`,
        requesterTrustScore: requester?.trustScore || 88,
        ownerId: 'usr-2',
        requestedDays: payload.requestedDays || 2,
        purpose: payload.message || payload.purpose || 'Curtain fitting in living room',
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
      };
      societyStore.setBorrowRequests([newReq, ...societyStore.getBorrowRequests()]);
      return newReq;
    }
  },

  /**
   * GET /api/borrow-requests/my
   */
  async getMyRequests(): Promise<BorrowRequest[]> {
    try {
      const response = await apiClient.get<any>('/borrow-requests/my');
      const list: any[] = response.data?.data || response.data || [];
      return list.map(req => ({
        id: String(req.id),
        itemId: String(req.itemId),
        itemTitle: req.itemName,
        requesterId: String(req.borrowerId),
        requesterName: req.borrowerName,
        requesterApartment: `${req.borrowerBlock || ''} ${req.borrowerApartment || ''}`.trim(),
        requesterTrustScore: req.borrowerTrustPoints || 80,
        ownerId: String(req.ownerId),
        requestedDays: 2,
        purpose: req.message,
        status: req.status,
        requestedAt: req.createdAt,
      }));
    } catch {
      return societyStore.getBorrowRequests();
    }
  },

  /**
   * GET /api/borrow-requests/received
   */
  async getReceivedRequests(): Promise<BorrowRequest[]> {
    try {
      const response = await apiClient.get<any>('/borrow-requests/received');
      const list: any[] = response.data?.data || response.data || [];
      return list.map(req => ({
        id: String(req.id),
        itemId: String(req.itemId),
        itemTitle: req.itemName,
        requesterId: String(req.borrowerId),
        requesterName: req.borrowerName,
        requesterApartment: `${req.borrowerBlock || ''} ${req.borrowerApartment || ''}`.trim(),
        requesterTrustScore: req.borrowerTrustPoints || 80,
        ownerId: String(req.ownerId),
        requestedDays: 2,
        purpose: req.message,
        status: req.status,
        requestedAt: req.createdAt,
      }));
    } catch {
      return [];
    }
  },

  /**
   * PUT /api/borrow-requests/{id}/approve
   */
  async approveRequest(requestId: string | number): Promise<void> {
    try {
      await apiClient.put(`/borrow-requests/${requestId}/approve`);
    } catch {
      const reqs = societyStore.getBorrowRequests();
      const updated = reqs.map((r: BorrowRequest) => String(r.id) === String(requestId) ? { ...r, status: 'APPROVED' as const } : r);
      societyStore.setBorrowRequests(updated);
    }
  },

  /**
   * PUT /api/borrow-requests/{id}/reject
   */
  async rejectRequest(requestId: string | number): Promise<void> {
    try {
      await apiClient.put(`/borrow-requests/${requestId}/reject`);
    } catch {
      const reqs = societyStore.getBorrowRequests();
      const updated = reqs.map((r: BorrowRequest) => String(r.id) === String(requestId) ? { ...r, status: 'REJECTED' as const } : r);
      societyStore.setBorrowRequests(updated);
    }
  },

  /**
   * PUT /api/borrow-requests/{id}/return
   */
  async returnItem(requestId: string | number): Promise<void> {
    try {
      await apiClient.put(`/borrow-requests/${requestId}/return`);
    } catch {
      const reqs = societyStore.getBorrowRequests();
      const updated = reqs.map((r: BorrowRequest) => String(r.id) === String(requestId) ? { ...r, status: 'RETURNED' as const } : r);
      societyStore.setBorrowRequests(updated);
    }
  }
};

export default borrowService;
