import { apiClient } from './api';
import { CommunityPost, SocietyAnnouncement, SocietyPoll, User } from '../types';
import { societyStore } from './store';

export const communityService = {
  /**
   * GET /api/v1/community/posts
   */
  async getPosts(): Promise<CommunityPost[]> {
    try {
      const response = await apiClient.get<CommunityPost[]>('/community/posts');
      return response.data;
    } catch {
      return societyStore.getPosts();
    }
  },

  /**
   * POST /api/v1/community/posts
   */
  async createPost(
    data: {
      content: string;
      type: CommunityPost['type'];
      tag?: string;
      imageUrl?: string;
      actionLabel?: string;
      eventDetails?: CommunityPost['eventDetails'];
      safetyDetails?: CommunityPost['safetyDetails'];
      itemDetails?: CommunityPost['itemDetails'];
    },
    user: User
  ): Promise<CommunityPost> {
    try {
      const response = await apiClient.post<CommunityPost>('/community/posts', data);
      return response.data;
    } catch {
      return societyStore.addPost({
        authorId: user.id,
        authorName: user.name,
        authorApartment: user.apartmentNumber,
        authorBlock: user.block,
        authorAvatar: user.avatarUrl,
        authorTrustScore: user.trustScore,
        type: data.type,
        content: data.content,
        tag: data.tag,
        imageUrl: data.imageUrl,
        actionLabel: data.actionLabel,
        eventDetails: data.eventDetails,
        safetyDetails: data.safetyDetails,
        itemDetails: data.itemDetails,
      });
    }
  },

  /**
   * POST /api/v1/community/posts/{id}/like
   */
  async toggleLikePost(postId: string): Promise<CommunityPost | null> {
    try {
      const response = await apiClient.post<CommunityPost>(`/community/posts/${postId}/like`);
      return response.data;
    } catch {
      return societyStore.toggleLikePost(postId);
    }
  },

  /**
   * POST /api/v1/community/posts/{id}/comments
   */
  async addComment(postId: string, text: string, user: User): Promise<CommunityPost | null> {
    try {
      const response = await apiClient.post<CommunityPost>(`/community/posts/${postId}/comments`, { text });
      return response.data;
    } catch {
      return societyStore.addCommentToPost(postId, {
        authorName: user.name,
        authorApartment: `${user.block} · ${user.apartmentNumber}`,
        authorAvatar: user.avatarUrl,
        text,
      });
    }
  },

  /**
   * GET /api/v1/community/announcements
   */
  async getAnnouncements(): Promise<SocietyAnnouncement[]> {
    try {
      const response = await apiClient.get<SocietyAnnouncement[]>('/community/announcements');
      return response.data;
    } catch {
      return societyStore.getAnnouncements();
    }
  },

  /**
   * GET /api/v1/community/polls
   */
  async getPolls(): Promise<SocietyPoll[]> {
    try {
      const response = await apiClient.get<SocietyPoll[]>('/community/polls');
      return response.data;
    } catch {
      return societyStore.getPolls();
    }
  },

  /**
   * POST /api/v1/community/polls/{id}/vote
   */
  async votePoll(pollId: string, optionId: string): Promise<SocietyPoll | null> {
    try {
      const response = await apiClient.post<SocietyPoll>(`/community/polls/${pollId}/vote`, { optionId });
      return response.data;
    } catch {
      return societyStore.votePoll(pollId, optionId);
    }
  }
};
