import { apiClient } from './api';
import { CommunityEvent, EventCategory, EventStatus, EventParticipantSummary } from '../types';
import { societyStore } from './store';

export interface CreateEventPayload {
  title: string;
  description: string;
  category?: EventCategory;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  category?: EventCategory;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: EventStatus;
  imageUrl?: string;
}

const mapBackendToEvent = (e: any): CommunityEvent => {
  const participants: EventParticipantSummary[] = (e.participants || []).map((p: any) => ({
    userId: String(p.userId),
    userName: p.userName || 'Neighbor',
    apartmentNumber: p.apartmentNumber || 'Apt',
    profileImage: p.profileImage || undefined,
    joinedAt: p.joinedAt,
  }));

  return {
    id: String(e.id),
    title: e.title,
    description: e.description,
    category: (e.category as EventCategory) || 'OTHER',
    eventDate: e.eventDate || new Date().toISOString().split('T')[0],
    startTime: e.startTime ? String(e.startTime).slice(0, 5) : '09:00',
    endTime: e.endTime ? String(e.endTime).slice(0, 5) : '11:00',
    location: e.location,
    latitude: e.latitude || 11.9336,
    longitude: e.longitude || 79.8338,
    organizerId: String(e.organizerId),
    organizerName: e.organizerName || 'Community Organizer',
    organizerApartment: e.organizerApartment || 'Resident',
    participantsCount: e.participantsCount ?? (participants.length || 1),
    isJoinedByMe: Boolean(e.isJoinedByMe),
    status: (e.status as EventStatus) || 'UPCOMING',
    imageUrl: e.imageUrl || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500',
    createdAt: e.createdAt || new Date().toISOString(),
    participants,
  };
};

export const eventService = {
  /**
   * GET /api/events
   */
  async getEvents(): Promise<CommunityEvent[]> {
    try {
      const response = await apiClient.get<any>('/events');
      const rawList: any[] = response.data?.data || response.data || [];
      return rawList.map(mapBackendToEvent);
    } catch {
      return societyStore.getEvents();
    }
  },

  /**
   * GET /api/events/{id}
   */
  async getEventById(id: string | number): Promise<CommunityEvent> {
    try {
      const response = await apiClient.get<any>(`/events/${id}`);
      return mapBackendToEvent(response.data?.data || response.data);
    } catch {
      const list = societyStore.getEvents();
      const found = list.find(e => String(e.id) === String(id));
      if (found) return found;
      throw new Error('Event not found');
    }
  },

  /**
   * POST /api/events
   */
  async createEvent(payload: CreateEventPayload, organizer?: any): Promise<CommunityEvent> {
    try {
      const response = await apiClient.post<any>('/events', {
        title: payload.title,
        description: payload.description,
        eventDate: payload.eventDate,
        startTime: payload.startTime.length === 5 ? `${payload.startTime}:00` : payload.startTime,
        endTime: payload.endTime.length === 5 ? `${payload.endTime}:00` : payload.endTime,
        location: payload.location,
        latitude: payload.latitude || 11.9336,
        longitude: payload.longitude || 79.8338,
        category: payload.category || 'OTHER',
        imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500',
      });

      return mapBackendToEvent(response.data?.data || response.data);
    } catch {
      const newEvent: CommunityEvent = {
        id: `evt-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        category: payload.category || 'OTHER',
        eventDate: payload.eventDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        location: payload.location,
        latitude: payload.latitude || 11.9336,
        longitude: payload.longitude || 79.8338,
        organizerId: organizer?.id || 'usr-1',
        organizerName: organizer?.name || 'Priya Sharma',
        organizerApartment: `${organizer?.block || 'Block B'}-${organizer?.apartmentNumber || '402'}`,
        participantsCount: 1,
        isJoinedByMe: true,
        status: 'UPCOMING',
        imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500',
        createdAt: new Date().toISOString(),
        participants: [
          {
            userId: organizer?.id || 'usr-1',
            userName: organizer?.name || 'Priya Sharma',
            apartmentNumber: `${organizer?.block || 'Block B'}-${organizer?.apartmentNumber || '402'}`,
          }
        ]
      };
      societyStore.setEvents([newEvent, ...societyStore.getEvents()]);
      return newEvent;
    }
  },

  /**
   * PUT /api/events/{id}
   */
  async updateEvent(id: string | number, payload: UpdateEventPayload): Promise<CommunityEvent> {
    try {
      const body: any = { ...payload };
      if (payload.startTime && payload.startTime.length === 5) body.startTime = `${payload.startTime}:00`;
      if (payload.endTime && payload.endTime.length === 5) body.endTime = `${payload.endTime}:00`;

      const response = await apiClient.put<any>(`/events/${id}`, body);
      return mapBackendToEvent(response.data?.data || response.data);
    } catch {
      const list = societyStore.getEvents();
      const updated = list.map(e => {
        if (String(e.id) === String(id)) {
          return {
            ...e,
            ...payload,
          };
        }
        return e;
      });
      societyStore.setEvents(updated);
      const res = updated.find(e => String(e.id) === String(id));
      if (!res) throw new Error('Event not found');
      return res;
    }
  },

  /**
   * DELETE /api/events/{id}
   */
  async deleteEvent(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/events/${id}`);
    } catch {
      const list = societyStore.getEvents();
      const filtered = list.filter(e => String(e.id) !== String(id));
      societyStore.setEvents(filtered);
    }
  },

  /**
   * POST /api/events/{id}/join
   */
  async joinEvent(id: string | number): Promise<void> {
    try {
      await apiClient.post(`/events/${id}/join`);
    } catch {
      const list = societyStore.getEvents();
      const updated = list.map(e => String(e.id) === String(id) ? { ...e, isJoinedByMe: true, participantsCount: e.participantsCount + 1 } : e);
      societyStore.setEvents(updated);
    }
  },

  /**
   * DELETE /api/events/{id}/leave
   */
  async leaveEvent(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/events/${id}/leave`);
    } catch {
      const list = societyStore.getEvents();
      const updated = list.map(e => String(e.id) === String(id) ? { ...e, isJoinedByMe: false, participantsCount: Math.max(1, e.participantsCount - 1) } : e);
      societyStore.setEvents(updated);
    }
  },

  /**
   * Toggle join RSVP
   */
  async toggleJoinEvent(eventId: string | number): Promise<CommunityEvent> {
    const list = await this.getEvents();
    const target = list.find(e => String(e.id) === String(eventId));
    if (!target) throw new Error('Event not found');

    const shouldJoin = !target.isJoinedByMe;
    if (shouldJoin) {
      await this.joinEvent(eventId);
    } else {
      await this.leaveEvent(eventId);
    }

    return {
      ...target,
      isJoinedByMe: shouldJoin,
      participantsCount: shouldJoin ? target.participantsCount + 1 : Math.max(1, target.participantsCount - 1),
    };
  }
};

export const eventsService = eventService;
export default eventService;

