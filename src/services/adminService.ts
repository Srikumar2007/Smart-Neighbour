import { apiClient } from './api';
import { User, SocietyStats, SafetyReport } from '../types';
import { societyStore } from './store';

export const adminService = {
  /**
   * GET /api/v1/admin/stats
   */
  async getSocietyStats(): Promise<SocietyStats> {
    try {
      const response = await apiClient.get<SocietyStats>('/admin/stats');
      return response.data;
    } catch {
      const stats = societyStore.getStats();
      const users = societyStore.getUsers();
      const items = societyStore.getItems();
      const safety = societyStore.getSafetyReports();
      const events = societyStore.getEvents();

      return {
        ...stats,
        totalResidents: users.length,
        verifiedResidents: users.filter(u => u.verificationStatus === 'VERIFIED').length,
        activeLendings: items.filter(i => i.status === 'BORROWED').length,
        openSafetyReports: safety.filter(s => s.status === 'REPORTED' || s.status === 'IN_PROGRESS').length,
        resolvedSafetyReports: safety.filter(s => s.status === 'RESOLVED').length,
        upcomingEvents: events.filter(e => e.status === 'UPCOMING').length,
      };
    }
  },

  /**
   * GET /api/v1/admin/residents
   */
  async getAllResidents(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/admin/residents');
      return response.data;
    } catch {
      return societyStore.getUsers();
    }
  },

  /**
   * PUT /api/admin/users/{id}/status
   */
  async toggleUserActive(userId: string, active: boolean): Promise<User> {
    try {
      const response = await apiClient.put<any>(`/admin/users/${userId}/status`, { active });
      const u = response.data?.data || response.data;
      return u;
    } catch {
      const users = societyStore.getUsers();
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      user.active = active;
      societyStore.setUsers([...users]);
      return user;
    }
  },

  /**
   * PATCH /api/v1/admin/residents/{id}/verify
   */
  async updateResidentVerification(userId: string, status: 'VERIFIED' | 'REJECTED'): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/admin/residents/${userId}/verify`, { status });
      return response.data;
    } catch {
      const users = societyStore.getUsers();
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      user.verificationStatus = status;
      if (status === 'VERIFIED' && !user.badges.includes('Verified Resident')) {
        user.badges.push('Verified Resident');
        user.trustScore += 25;
      }
      societyStore.setUsers([...users]);
      return user;
    }
  },

  /**
   * POST /api/v1/admin/residents/{id}/trust
   */
  async adjustResidentTrustScore(userId: string, delta: number, reason: string): Promise<User> {
    try {
      const response = await apiClient.post<User>(`/admin/residents/${userId}/trust`, { delta, reason });
      return response.data;
    } catch {
      const users = societyStore.getUsers();
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      user.trustScore = Math.max(0, Math.min(100, user.trustScore + delta));
      societyStore.setUsers([...users]);
      societyStore.addTrustTransaction({
        userId,
        points: delta,
        reason: `[Admin Action] ${reason}`,
        category: delta >= 0 ? 'COMMUNITY_HELP' : 'PENALTY',
      });
      return user;
    }
  },

  /**
   * PUT /api/admin/safety-reports/{id}/verify
   */
  async verifySafetyReport(reportId: string): Promise<SafetyReport> {
    try {
      const response = await apiClient.put<any>(`/admin/safety-reports/${reportId}/verify`);
      const r = response.data?.data || response.data;
      return {
        id: String(r.id),
        title: r.title,
        description: r.description,
        category: r.category,
        severity: r.severity,
        block: r.block,
        location: r.location || r.block || 'Campus Location',
        latitude: r.latitude,
        longitude: r.longitude,
        reporterName: r.reporterName || 'Resident',
        status: 'VERIFIED',
        isVerifiedByAdmin: true,
        upvotes: 4,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      };
    } catch {
      const reports = societyStore.getSafetyReports();
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');
      report.status = 'VERIFIED';
      report.isVerifiedByAdmin = true;
      societyStore.setSafetyReports([...reports]);
      return report;
    }
  },

  /**
   * PUT /api/admin/safety-reports/{id}/reject
   */
  async rejectSafetyReport(reportId: string): Promise<SafetyReport> {
    try {
      const response = await apiClient.put<any>(`/admin/safety-reports/${reportId}/reject`);
      const r = response.data?.data || response.data;
      return {
        id: String(r.id),
        title: r.title,
        description: r.description,
        category: r.category,
        severity: r.severity,
        block: r.block,
        location: r.location || r.block || 'Campus Location',
        latitude: r.latitude,
        longitude: r.longitude,
        reporterName: r.reporterName || 'Resident',
        status: 'REJECTED',
        isVerifiedByAdmin: false,
        upvotes: 4,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      };
    } catch {
      const reports = societyStore.getSafetyReports();
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');
      report.status = 'REJECTED';
      report.isVerifiedByAdmin = false;
      societyStore.setSafetyReports([...reports]);
      return report;
    }
  },

  /**
   * PUT /api/admin/safety-reports/{id}/resolve
   */
  async resolveSafetyReport(reportId: string): Promise<SafetyReport> {
    try {
      const response = await apiClient.put<any>(`/admin/safety-reports/${reportId}/resolve`);
      const r = response.data?.data || response.data;
      return {
        id: String(r.id),
        title: r.title,
        description: r.description,
        category: r.category,
        severity: r.severity,
        block: r.block,
        location: r.location || r.block || 'Campus Location',
        latitude: r.latitude,
        longitude: r.longitude,
        reporterName: r.reporterName || 'Resident',
        status: 'RESOLVED',
        isVerifiedByAdmin: true,
        upvotes: 4,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      };
    } catch {
      const reports = societyStore.getSafetyReports();
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');
      report.status = 'RESOLVED';
      report.isVerifiedByAdmin = true;
      societyStore.setSafetyReports([...reports]);
      return report;
    }
  },

  /**
   * Legacy / Generic status updater
   */
  async updateSafetyReportStatus(reportId: string, status: import('../types').SafetyStatus, adminNotes?: string): Promise<SafetyReport> {
    if (status === 'VERIFIED') return this.verifySafetyReport(reportId);
    if (status === 'REJECTED') return this.rejectSafetyReport(reportId);
    if (status === 'RESOLVED') return this.resolveSafetyReport(reportId);

    const reports = societyStore.getSafetyReports();
    const report = reports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');
    report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    societyStore.setSafetyReports([...reports]);
    return report;
  },

  /**
   * DELETE /api/v1/admin/content
   */
  async deleteContent(type: 'item' | 'safety' | 'event', id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/admin/content/${type}/${id}`);
      return true;
    } catch {
      if (type === 'item') {
        societyStore.setItems(societyStore.getItems().filter(i => i.id !== id));
      } else if (type === 'safety') {
        societyStore.setSafetyReports(societyStore.getSafetyReports().filter(s => s.id !== id));
      } else if (type === 'event') {
        societyStore.setEvents(societyStore.getEvents().filter(e => e.id !== id));
      }
      return true;
    }
  }
};

export const notificationService = {
  /**
   * GET /api/v1/notifications
   */
  async getNotifications(): Promise<import('../types').Notification[]> {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch {
      return societyStore.getNotifications();
    }
  },

  /**
   * PATCH /api/v1/notifications/{id}/read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      const list = societyStore.getNotifications();
      const notif = list.find(n => n.id === id);
      if (notif) notif.isRead = true;
      societyStore.setNotifications([...list]);
    }
  },

  /**
   * POST /api/v1/notifications/read-all
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.post('/notifications/read-all');
    } catch {
      const list = societyStore.getNotifications().map(n => ({ ...n, isRead: true }));
      societyStore.setNotifications(list);
    }
  }
};
