import { apiClient } from './api';
import { SafetyReport, SafetyCategory, SafetySeverity, SafetyStatus } from '../types';
import { societyStore } from './store';

export interface CreateSafetyReportPayload {
  title: string;
  description: string;
  category: SafetyCategory;
  severity: SafetySeverity;
  location?: string;
  block?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export const safetyService = {
  /**
   * GET /api/safety-reports
   */
  async getSafetyReports(filter?: { category?: string; severity?: string; status?: string }): Promise<SafetyReport[]> {
    try {
      const params: any = {};
      if (filter?.category && filter.category !== 'ALL') params.category = filter.category;
      if (filter?.status && filter.status !== 'ALL') params.status = filter.status;

      const response = await apiClient.get<any>('/safety-reports', { params });
      const rawList: any[] = response.data?.data || response.data || [];

      return rawList.map((r: any) => ({
        id: String(r.id),
        title: r.title,
        description: r.description,
        category: (r.category as SafetyCategory) || 'OTHER',
        severity: (r.severity as SafetySeverity) || 'MEDIUM',
        block: r.block,
        location: r.location || r.block || 'Campus Location',
        latitude: r.latitude || 11.9340,
        longitude: r.longitude || 79.8320,
        imageUrl: r.imageUrl,
        reporterId: r.reporterId ? String(r.reporterId) : undefined,
        reporterName: r.reporterName || 'Verified Resident',
        reporterApartment: r.reporterApartment ? `${r.reporterBlock || ''} · ${r.reporterApartment}` : undefined,
        reporterBlock: r.reporterBlock,
        status: (r.status as SafetyStatus) || 'PENDING',
        isVerifiedByAdmin: r.status === 'VERIFIED' || r.status === 'RESOLVED',
        upvotes: 4,
        hasUpvoted: false,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      }));
    } catch {
      let reports = societyStore.getSafetyReports();
      if (filter?.category && filter.category !== 'ALL') {
        reports = reports.filter(r => r.category === filter.category);
      }
      if (filter?.status && filter.status !== 'ALL') {
        reports = reports.filter(r => r.status === filter.status);
      }
      return reports;
    }
  },

  async getReports(filter?: { category?: string; severity?: string; status?: string }): Promise<SafetyReport[]> {
    return this.getSafetyReports(filter);
  },

  /**
   * POST /api/safety-reports
   */
  async createReport(payload: CreateSafetyReportPayload, reporter?: any): Promise<SafetyReport> {
    // Client side neutral language pre-check
    const combinedText = `${payload.title} ${payload.description}`.toLowerCase();
    const prohibited = ["person ", "suspicious resident", "resident in flat", "stole", "thief", "he is suspicious", "she is suspicious"];
    if (prohibited.some(term => combinedText.includes(term))) {
      throw new Error("Safety reports must describe neutral physical issues or hazards (e.g. broken light, open gate, water leak), not personal accusations or targeting individuals.");
    }

    try {
      const response = await apiClient.post<any>('/safety-reports', {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        severity: payload.severity,
        latitude: payload.latitude || 11.9340,
        longitude: payload.longitude || 79.8320,
        block: payload.block,
        location: payload.location || payload.block || 'Campus Grounds',
        imageUrl: payload.imageUrl,
      });

      const r = response.data?.data || response.data;
      return {
        id: String(r.id),
        title: r.title,
        description: r.description,
        category: r.category,
        severity: r.severity,
        block: r.block,
        location: r.location || r.block || 'Campus Grounds',
        latitude: r.latitude,
        longitude: r.longitude,
        imageUrl: r.imageUrl,
        reporterId: r.reporterId ? String(r.reporterId) : reporter?.id,
        reporterName: r.reporterName || reporter?.name || 'Resident',
        reporterApartment: r.reporterApartment || `${reporter?.block} · ${reporter?.apartmentNumber}`,
        status: (r.status as SafetyStatus) || 'PENDING',
        isVerifiedByAdmin: false,
        upvotes: 1,
        hasUpvoted: true,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      };
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      const newReport: SafetyReport = {
        id: `rep-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        severity: payload.severity,
        block: payload.block,
        location: payload.location || payload.block || 'Pondicherry Promenade Gate',
        latitude: payload.latitude || 11.9324,
        longitude: payload.longitude || 79.8298,
        imageUrl: payload.imageUrl,
        reporterId: reporter?.id || 'usr-1',
        reporterName: reporter?.name || 'Priya Sharma',
        reporterApartment: `${reporter?.block || 'Block B'} · ${reporter?.apartmentNumber || '402'}`,
        status: 'PENDING',
        isVerifiedByAdmin: false,
        upvotes: 1,
        hasUpvoted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      societyStore.setSafetyReports([newReport, ...societyStore.getSafetyReports()]);
      return newReport;
    }
  },

  /**
   * Corroborate / Upvote Report
   */
  async upvoteReport(reportId: string): Promise<SafetyReport> {
    const list = societyStore.getSafetyReports();
    const target = list.find(r => r.id === reportId);
    if (!target) throw new Error('Report not found');

    const updated = {
      ...target,
      upvotes: (target.upvotes || 0) + 1,
      hasUpvoted: true,
    };
    societyStore.setSafetyReports(list.map(r => r.id === reportId ? updated : r));
    return updated;
  }
};

export default safetyService;
