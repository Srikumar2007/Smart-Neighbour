import { apiClient } from './api';
import { User } from '../types';
import { societyStore } from './store';

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  apartmentNumber?: string;
  block?: string;
  profileImage?: string;
}

export const userService = {
  /**
   * GET /api/users/me
   */
  async getMyProfile(): Promise<User> {
    try {
      const response = await apiClient.get<any>('/users/me');
      const u = response.data?.data || response.data;
      return {
        id: String(u.id),
        name: u.fullName,
        email: u.email,
        apartmentNumber: u.apartmentNumber,
        block: u.block,
        phone: u.phone,
        role: u.role,
        verificationStatus: 'VERIFIED',
        avatarUrl: u.profileImage,
        trustScore: u.trustPoints,
        badges: u.trustPoints >= 75 ? ['Verified Resident', 'Active Contributor'] : ['Verified Resident'],
        joinedDate: u.createdAt ? u.createdAt.split('T')[0] : '2026-01-01',
      };
    } catch {
      return societyStore.getUsers()[0];
    }
  },

  /**
   * PUT /api/users/me
   */
  async updateProfile(payload: UpdateUserPayload): Promise<User> {
    try {
      const response = await apiClient.put<any>('/users/me', payload);
      const u = response.data?.data || response.data;
      const updated: User = {
        id: String(u.id),
        name: u.fullName,
        email: u.email,
        apartmentNumber: u.apartmentNumber,
        block: u.block,
        phone: u.phone,
        role: u.role,
        verificationStatus: 'VERIFIED',
        avatarUrl: u.profileImage,
        trustScore: u.trustPoints,
        badges: ['Verified Resident'],
        joinedDate: u.createdAt ? u.createdAt.split('T')[0] : '2026-01-01',
      };
      localStorage.setItem('smart_neighbour_user', JSON.stringify(updated));
      return updated;
    } catch {
      const current = societyStore.getUsers()[0];
      const updated: User = {
        ...current,
        name: payload.fullName || current.name,
        phone: payload.phone || current.phone,
        apartmentNumber: payload.apartmentNumber || current.apartmentNumber,
        block: payload.block || current.block,
      };
      localStorage.setItem('smart_neighbour_user', JSON.stringify(updated));
      return updated;
    }
  },

  /**
   * GET /api/users/{id}
   */
  async getUserById(id: string | number): Promise<User> {
    try {
      const response = await apiClient.get<any>(`/users/${id}`);
      const u = response.data?.data || response.data;
      return {
        id: String(u.id),
        name: u.fullName,
        email: u.email,
        apartmentNumber: u.apartmentNumber,
        block: u.block,
        phone: u.phone,
        role: u.role,
        verificationStatus: 'VERIFIED',
        avatarUrl: u.profileImage,
        trustScore: u.trustPoints,
        badges: ['Verified Resident'],
        joinedDate: u.createdAt ? u.createdAt.split('T')[0] : '2026-01-01',
      };
    } catch {
      const match = societyStore.getUsers().find(u => String(u.id) === String(id));
      if (match) return match;
      return societyStore.getUsers()[0];
    }
  }
};

export default userService;
