import { apiClient } from './api';
import { LendingItem, ItemCategory } from '../types';
import { societyStore } from './store';

export interface CreateItemPayload {
  title?: string;
  name?: string;
  description: string;
  category: ItemCategory;
  imageUrl?: string;
  maxBorrowDays?: number;
  depositRequired?: number;
  tags?: string[];
}

export const itemService = {
  /**
   * GET /api/items
   */
  async getItems(category?: string, search?: string): Promise<LendingItem[]> {
    try {
      const params: any = {};
      if (category && category !== 'ALL') {
        params.category = category;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiClient.get<any>('/items', { params });
      const rawList: any[] = response.data?.data || response.data || [];

      return rawList.map((item: any) => ({
        id: String(item.id),
        title: item.name || item.title,
        description: item.description,
        category: (item.category as ItemCategory) || 'TOOLS',
        ownerId: String(item.ownerId),
        ownerName: item.ownerName || 'Neighbour',
        ownerApartment: item.ownerApartment ? `${item.ownerBlock || ''} · ${item.ownerApartment}` : 'Community Member',
        ownerTrustScore: item.ownerTrustPoints || 75,
        status: item.availabilityStatus || 'AVAILABLE',
        maxBorrowDays: 5,
        depositRequired: 0,
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600',
        tags: [item.category ? String(item.category).toLowerCase() : 'shareable'],
        createdAt: item.createdAt || new Date().toISOString(),
        usageText: 'Verified society item',
      }));
    } catch {
      // Fallback to store if server is unreachable
      let items = societyStore.getItems();
      if (category && category !== 'ALL') {
        items = items.filter(i => i.category === category);
      }
      if (search && search.trim()) {
        const q = search.toLowerCase();
        items = items.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
        );
      }
      return items;
    }
  },

  /**
   * GET /api/items/{id}
   */
  async getItemById(id: string | number): Promise<LendingItem> {
    try {
      const response = await apiClient.get<any>(`/items/${id}`);
      const item = response.data?.data || response.data;
      return {
        id: String(item.id),
        title: item.name || item.title,
        description: item.description,
        category: (item.category as ItemCategory) || 'TOOLS',
        ownerId: String(item.ownerId),
        ownerName: item.ownerName || 'Neighbour',
        ownerApartment: item.ownerApartment ? `${item.ownerBlock || ''} · ${item.ownerApartment}` : 'Community Member',
        ownerTrustScore: item.ownerTrustPoints || 75,
        status: item.availabilityStatus || 'AVAILABLE',
        maxBorrowDays: 5,
        depositRequired: 0,
        imageUrl: item.imageUrl,
        tags: [String(item.category).toLowerCase()],
        createdAt: item.createdAt || new Date().toISOString(),
      };
    } catch {
      const fallback = societyStore.getItems().find(i => String(i.id) === String(id));
      if (fallback) return fallback;
      throw new Error('Item could not be found.');
    }
  },

  /**
   * POST /api/items
   */
  async createItem(payload: CreateItemPayload, currentUser?: any): Promise<LendingItem> {
    try {
      const backendPayload = {
        name: payload.name || payload.title,
        description: payload.description,
        category: payload.category,
        imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600',
      };

      const response = await apiClient.post<any>('/items', backendPayload);
      const item = response.data?.data || response.data;

      return {
        id: String(item.id),
        title: item.name,
        description: item.description,
        category: item.category,
        ownerId: String(item.ownerId),
        ownerName: item.ownerName || currentUser?.name,
        ownerApartment: item.ownerApartment || `${currentUser?.block} · ${currentUser?.apartmentNumber}`,
        ownerTrustScore: item.ownerTrustPoints || currentUser?.trustScore || 80,
        status: item.availabilityStatus || 'AVAILABLE',
        maxBorrowDays: 5,
        depositRequired: 0,
        imageUrl: item.imageUrl,
        tags: [String(item.category).toLowerCase()],
        createdAt: item.createdAt || new Date().toISOString(),
      };
    } catch {
      const newItem: LendingItem = {
        id: `itm-${Date.now()}`,
        title: payload.name || payload.title || 'Community Item',
        description: payload.description,
        category: payload.category,
        ownerId: currentUser?.id || 'usr-1',
        ownerName: currentUser?.name || 'Priya Sharma',
        ownerApartment: `${currentUser?.block || 'Block B'} · ${currentUser?.apartmentNumber || '402'}`,
        ownerTrustScore: currentUser?.trustScore || 88,
        status: 'AVAILABLE',
        maxBorrowDays: payload.maxBorrowDays || 5,
        depositRequired: payload.depositRequired || 0,
        imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600',
        tags: payload.tags || ['tool'],
        createdAt: new Date().toISOString().split('T')[0],
      };
      societyStore.setItems([newItem, ...societyStore.getItems()]);
      return newItem;
    }
  },

  /**
   * DELETE /api/items/{id}
   */
  async deleteItem(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/items/${id}`);
    } catch {
      const items = societyStore.getItems().filter(i => String(i.id) !== String(id));
      societyStore.setItems(items);
    }
  }
};

export default itemService;
