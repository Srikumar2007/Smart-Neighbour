import { apiClient } from './api';
import { Notification, NotificationType } from '../types';
import { societyStore } from './store';

export const notificationService = {
  /**
   * GET /api/notifications
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<any>('/notifications');
      const rawList: any[] = response.data?.data || response.data || [];

      return rawList.map((n: any) => ({
        id: String(n.id),
        userId: String(n.userId),
        title: n.title,
        message: n.message,
        type: (n.type as NotificationType) || 'EVENT_UPDATE',
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt || new Date().toISOString(),
        link: n.type === 'BORROW_REQUEST' ? '/share-borrow' : n.type === 'SAFETY_ALERT' ? '/safety-watch' : '/community',
      }));
    } catch {
      return societyStore.getNotifications();
    }
  },

  /**
   * PUT /api/notifications/{id}/read
   */
  async markAsRead(id: string | number): Promise<void> {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch {
      const list = societyStore.getNotifications();
      societyStore.setNotifications(list.map(n => String(n.id) === String(id) ? { ...n, isRead: true } : n));
    }
  },

  /**
   * PUT /api/notifications/read-all
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put('/notifications/read-all');
    } catch {
      const list = societyStore.getNotifications();
      societyStore.setNotifications(list.map(n => ({ ...n, isRead: true })));
    }
  }
};

export default notificationService;
