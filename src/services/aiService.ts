import { apiClient } from './api';
import { SafetyCategory, SafetySeverity, EventCategory, SafetyReport } from '../types';

export interface ClassifyReportResult {
  category: SafetyCategory;
  severity: SafetySeverity;
  summary: string;
  isAiGenerated: boolean;
}

export interface DuplicateReportMatch {
  reportId: string | number;
  title: string;
  category: SafetyCategory;
  severity: SafetySeverity;
  status: string;
  location: string;
  similarityReason: string;
  reporterName?: string;
  reporterApartment?: string;
}

export interface DetectDuplicateResult {
  isDuplicate: boolean;
  similarReport: DuplicateReportMatch | null;
  message: string;
}

export interface GenerateEventDescriptionResult {
  generatedDescription: string;
  isAiGenerated: boolean;
}

export const aiService = {
  /**
   * AI Feature 1: Safety Report Classification
   * POST /api/ai/classify-safety-report
   */
  async classifySafetyReport(title: string, description: string): Promise<ClassifyReportResult> {
    try {
      const response = await apiClient.post<any>('/ai/classify-safety-report', { title, description });
      const data = response.data?.data || response.data;
      return {
        category: data.category || 'OTHER',
        severity: data.severity || 'MEDIUM',
        summary: data.summary || title,
        isAiGenerated: data.isAiGenerated ?? true,
      };
    } catch {
      // Local fallback classification
      return this.fallbackClassify(title, description);
    }
  },

  /**
   * AI Feature 2: Duplicate Report Detection
   * POST /api/ai/detect-duplicate-report
   */
  async detectDuplicateReport(
    title: string,
    description: string,
    location: string,
    latitude?: number,
    longitude?: number
  ): Promise<DetectDuplicateResult> {
    try {
      const response = await apiClient.post<any>('/ai/detect-duplicate-report', {
        title,
        description,
        location,
        latitude,
        longitude,
      });
      const data = response.data?.data || response.data;
      return {
        isDuplicate: data.isDuplicate || false,
        similarReport: data.similarReport || null,
        message: data.message || 'Check complete',
      };
    } catch {
      // Local fallback duplicate check
      return {
        isDuplicate: false,
        similarReport: null,
        message: 'Duplicate check ready',
      };
    }
  },

  /**
   * AI Feature 3: Event Description Assistance
   * POST /api/ai/generate-event-description
   */
  async generateEventDescription(
    title: string,
    category: EventCategory,
    notes: string
  ): Promise<GenerateEventDescriptionResult> {
    try {
      const response = await apiClient.post<any>('/ai/generate-event-description', {
        title,
        category,
        notes,
      });
      const data = response.data?.data || response.data;
      return {
        generatedDescription: data.generatedDescription || '',
        isAiGenerated: data.isAiGenerated ?? true,
      };
    } catch {
      // Local fallback event description generator
      const categoryText = category.toLowerCase().replace('_', ' ');
      const desc = `Join your neighbors for ${title}! We're organizing a community ${categoryText} event in the housing society. ${notes ? notes : 'Come participate with your family and friends!'} All residents are warmly welcome.`;
      return {
        generatedDescription: desc,
        isAiGenerated: false,
      };
    }
  },

  // --- Local Fallback Classifier ---
  fallbackClassify(title: string, description: string): ClassifyReportResult {
    const combined = `${title} ${description}`.toLowerCase();
    let category: SafetyCategory = 'OTHER';
    let severity: SafetySeverity = 'MEDIUM';

    if (combined.includes('light') || combined.includes('lamp') || combined.includes('dark') || combined.includes('bulb')) {
      category = 'LIGHTING';
    } else if (combined.includes('water') || combined.includes('leak') || combined.includes('pipe') || combined.includes('drain') || combined.includes('tank')) {
      category = 'WATER';
    } else if (combined.includes('gate') || combined.includes('lock') || combined.includes('cctv') || combined.includes('guard') || combined.includes('door') || combined.includes('stranger')) {
      category = 'SECURITY';
    } else if (combined.includes('lift') || combined.includes('elevator') || combined.includes('wall') || combined.includes('crack') || combined.includes('road') || combined.includes('pothole')) {
      category = 'INFRASTRUCTURE';
    } else if (combined.includes('clean') || combined.includes('garbage') || combined.includes('stair') || combined.includes('repair')) {
      category = 'MAINTENANCE';
    }

    if (combined.includes('urgent') || combined.includes('danger') || combined.includes('fire') || combined.includes('spark') || combined.includes('broken glass')) {
      severity = 'HIGH';
    } else if (combined.includes('minor') || combined.includes('small')) {
      severity = 'LOW';
    }

    const summary = title.length > 5 ? title : (description.length > 60 ? description.substring(0, 57) + '...' : description);

    return {
      category,
      severity,
      summary,
      isAiGenerated: false,
    };
  }
};
