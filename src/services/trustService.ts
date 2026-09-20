import { apiClient } from './api';
import { TrustTransaction } from '../types';
import { societyStore } from './store';

export interface TrustSummary {
  userId: number | string;
  userName: string;
  trustPoints: number;
  trustLevel: string;
  nextTrustLevel?: string;
  pointsToNextLevel?: number;
  nextLevelThreshold?: number;
  progressPercentage?: number;
  itemsShared?: number;
  successfulBorrows?: number;
  eventsOrganized?: number;
  verifiedSafetyReports?: number;
}

export const calculateTrustLevel = (points: number) => {
  if (points >= 200) {
    return {
      levelTitle: 'Community Leader',
      nextLevelTitle: undefined,
      pointsToNextLevel: 0,
      nextLevelThreshold: 200,
      progressPercentage: 100,
    };
  } else if (points >= 100) {
    const threshold = 200;
    const needed = Math.max(0, threshold - points);
    const progress = Math.min(100, Math.round((points / threshold) * 100));
    return {
      levelTitle: 'Community Champion',
      nextLevelTitle: 'Community Leader',
      pointsToNextLevel: needed,
      nextLevelThreshold: threshold,
      progressPercentage: progress,
    };
  } else if (points >= 50) {
    const threshold = 100;
    const needed = Math.max(0, threshold - points);
    const progress = Math.min(100, Math.round((points / threshold) * 100));
    return {
      levelTitle: 'Trusted Neighbor',
      nextLevelTitle: 'Community Champion',
      pointsToNextLevel: needed,
      nextLevelThreshold: threshold,
      progressPercentage: progress,
    };
  } else if (points >= 25) {
    const threshold = 50;
    const needed = Math.max(0, threshold - points);
    const progress = Math.min(100, Math.round((points / threshold) * 100));
    return {
      levelTitle: 'Active Neighbor',
      nextLevelTitle: 'Trusted Neighbor',
      pointsToNextLevel: needed,
      nextLevelThreshold: threshold,
      progressPercentage: progress,
    };
  } else {
    const threshold = 25;
    const needed = Math.max(0, threshold - points);
    const progress = Math.min(100, Math.round((Math.max(0, points) / threshold) * 100));
    return {
      levelTitle: 'New Neighbor',
      nextLevelTitle: 'Active Neighbor',
      pointsToNextLevel: needed,
      nextLevelThreshold: threshold,
      progressPercentage: progress,
    };
  }
};

export const trustService = {
  /**
   * GET /api/trust/me
   */
  async getMyTrustSummary(): Promise<TrustSummary> {
    try {
      const response = await apiClient.get<any>('/trust/me');
      const data = response.data?.data || response.data;
      const pts = data.trustPoints ?? 88;
      const computed = calculateTrustLevel(pts);

      return {
        userId: data.userId,
        userName: data.userName,
        trustPoints: pts,
        trustLevel: data.trustLevel || computed.levelTitle,
        nextTrustLevel: data.nextTrustLevel || computed.nextLevelTitle,
        pointsToNextLevel: data.pointsToNextLevel ?? computed.pointsToNextLevel,
        nextLevelThreshold: data.nextLevelThreshold ?? computed.nextLevelThreshold,
        progressPercentage: data.progressPercentage ?? computed.progressPercentage,
        itemsShared: data.itemsShared,
        successfulBorrows: data.successfulBorrows,
        eventsOrganized: data.eventsOrganized,
        verifiedSafetyReports: data.verifiedSafetyReports,
      };
    } catch {
      const pts = 88;
      const computed = calculateTrustLevel(pts);
      return {
        userId: 'usr-1',
        userName: 'Priya Sharma',
        trustPoints: pts,
        trustLevel: computed.levelTitle,
        nextTrustLevel: computed.nextLevelTitle,
        pointsToNextLevel: computed.pointsToNextLevel,
        nextLevelThreshold: computed.nextLevelThreshold,
        progressPercentage: computed.progressPercentage,
        itemsShared: 4,
        successfulBorrows: 7,
        eventsOrganized: 2,
        verifiedSafetyReports: 3,
      };
    }
  },

  /**
   * GET /api/trust/me/history
   */
  async getTrustHistory(userId?: string): Promise<TrustTransaction[]> {
    try {
      const endpoint = userId && userId !== 'me' ? `/trust/user/${userId}/history` : '/trust/me/history';
      const response = await apiClient.get<any>(endpoint);
      const rawList: any[] = response.data?.data || response.data || [];

      return rawList.map((tx: any) => ({
        id: String(tx.id),
        userId: String(tx.userId || userId || 'me'),
        userName: tx.userName,
        apartmentNumber: tx.apartmentNumber,
        points: tx.points,
        reason: tx.reason,
        referenceType: tx.referenceType,
        referenceId: tx.referenceId,
        category: 'RESOURCE_SHARING',
        timestamp: tx.createdAt || new Date().toISOString(),
      }));
    } catch {
      return societyStore.getTrust();
    }
  },

  /**
   * Admin: GET /api/trust/admin/transactions
   */
  async getAllTransactionsForAdmin(): Promise<TrustTransaction[]> {
    try {
      const response = await apiClient.get<any>('/trust/admin/transactions');
      const rawList: any[] = response.data?.data || response.data || [];

      return rawList.map((tx: any) => ({
        id: String(tx.id),
        userId: String(tx.userId),
        userName: tx.userName || 'Resident',
        apartmentNumber: tx.apartmentNumber || 'Apt',
        points: tx.points,
        reason: tx.reason,
        referenceType: tx.referenceType,
        referenceId: tx.referenceId,
        timestamp: tx.createdAt || new Date().toISOString(),
      }));
    } catch {
      return societyStore.getTrust();
    }
  }
};

export default trustService;

