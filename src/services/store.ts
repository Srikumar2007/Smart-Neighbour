import { 
  User, 
  LendingItem, 
  BorrowRequest, 
  SafetyReport, 
  CommunityEvent, 
  TrustTransaction, 
  Notification, 
  SocietyStats 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_ITEMS, 
  INITIAL_REQUESTS, 
  INITIAL_SAFETY_REPORTS, 
  INITIAL_EVENTS, 
  INITIAL_TRUST_HISTORY, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_STATS 
} from '../data/societySeedData';
import {
  INITIAL_POSTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_POLLS
} from '../data/communitySeedData';
import { CommunityPost, SocietyAnnouncement, SocietyPoll } from '../types';

const STORAGE_KEYS = {
  USERS: 'sn_users',
  ITEMS: 'sn_items',
  REQUESTS: 'sn_requests',
  SAFETY: 'sn_safety',
  EVENTS: 'sn_events',
  TRUST: 'sn_trust',
  NOTIFICATIONS: 'sn_notifications',
  STATS: 'sn_stats',
  POSTS: 'sn_posts',
  ANNOUNCEMENTS: 'sn_announcements',
  POLLS: 'sn_polls',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(item);
    if (key === STORAGE_KEYS.POSTS && Array.isArray(parsed)) {
      const hasLadderPost = parsed.some((p: any) => p.content?.toLowerCase().includes('ladder'));
      if (!hasLadderPost) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to persist ${key}`, err);
  }
}

export const societyStore = {
  getUsers: (): User[] => getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  setUsers: (data: User[]) => setLocal(STORAGE_KEYS.USERS, data),

  getItems: (): LendingItem[] => getLocal<LendingItem[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS),
  setItems: (data: LendingItem[]) => setLocal(STORAGE_KEYS.ITEMS, data),

  getRequests: (): BorrowRequest[] => getLocal<BorrowRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS),
  setRequests: (data: BorrowRequest[]) => setLocal(STORAGE_KEYS.REQUESTS, data),
  getBorrowRequests: (): BorrowRequest[] => getLocal<BorrowRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS),
  setBorrowRequests: (data: BorrowRequest[]) => setLocal(STORAGE_KEYS.REQUESTS, data),

  getSafetyReports: (): SafetyReport[] => getLocal<SafetyReport[]>(STORAGE_KEYS.SAFETY, INITIAL_SAFETY_REPORTS),
  setSafetyReports: (data: SafetyReport[]) => setLocal(STORAGE_KEYS.SAFETY, data),

  getEvents: (): CommunityEvent[] => getLocal<CommunityEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS),
  setEvents: (data: CommunityEvent[]) => setLocal(STORAGE_KEYS.EVENTS, data),

  getTrust: (): TrustTransaction[] => getLocal<TrustTransaction[]>(STORAGE_KEYS.TRUST, INITIAL_TRUST_HISTORY),
  setTrust: (data: TrustTransaction[]) => setLocal(STORAGE_KEYS.TRUST, data),
  addTrustTransaction: (tx: Omit<TrustTransaction, 'id' | 'timestamp'>) => {
    const list = getLocal<TrustTransaction[]>(STORAGE_KEYS.TRUST, INITIAL_TRUST_HISTORY);
    const newTx: TrustTransaction = {
      ...tx,
      id: `tt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setLocal(STORAGE_KEYS.TRUST, [newTx, ...list]);
  },

  getNotifications: (): Notification[] => getLocal<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  setNotifications: (data: Notification[]) => setLocal(STORAGE_KEYS.NOTIFICATIONS, data),

  getStats: (): SocietyStats => getLocal<SocietyStats>(STORAGE_KEYS.STATS, INITIAL_STATS),
  setStats: (data: SocietyStats) => setLocal(STORAGE_KEYS.STATS, data),

  getPosts: (): CommunityPost[] => getLocal<CommunityPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS),
  setPosts: (data: CommunityPost[]) => setLocal(STORAGE_KEYS.POSTS, data),
  addPost: (post: Omit<CommunityPost, 'id' | 'timestamp' | 'timeAgo' | 'likesCount' | 'hasLiked' | 'comments'>) => {
    const list = getLocal<CommunityPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const newPost: CommunityPost = {
      ...post,
      id: `post-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      likesCount: 0,
      hasLiked: false,
      comments: [],
    };
    setLocal(STORAGE_KEYS.POSTS, [newPost, ...list]);
    return newPost;
  },
  toggleLikePost: (postId: string): CommunityPost | null => {
    const list = getLocal<CommunityPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const post = list.find(p => p.id === postId);
    if (!post) return null;
    post.hasLiked = !post.hasLiked;
    post.likesCount += post.hasLiked ? 1 : -1;
    setLocal(STORAGE_KEYS.POSTS, [...list]);
    return post;
  },
  addCommentToPost: (postId: string, comment: { authorName: string; authorApartment: string; authorAvatar?: string; text: string }): CommunityPost | null => {
    const list = getLocal<CommunityPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const post = list.find(p => p.id === postId);
    if (!post) return null;
    const newComment = {
      ...comment,
      id: `c-${Date.now()}`,
      timeAgo: 'Just now',
    };
    post.comments.push(newComment);
    setLocal(STORAGE_KEYS.POSTS, [...list]);
    return post;
  },

  getAnnouncements: (): SocietyAnnouncement[] => getLocal<SocietyAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS),
  setAnnouncements: (data: SocietyAnnouncement[]) => setLocal(STORAGE_KEYS.ANNOUNCEMENTS, data),

  getPolls: (): SocietyPoll[] => getLocal<SocietyPoll[]>(STORAGE_KEYS.POLLS, INITIAL_POLLS),
  setPolls: (data: SocietyPoll[]) => setLocal(STORAGE_KEYS.POLLS, data),
  votePoll: (pollId: string, optionId: string): SocietyPoll | null => {
    const list = getLocal<SocietyPoll[]>(STORAGE_KEYS.POLLS, INITIAL_POLLS);
    const poll = list.find(p => p.id === pollId);
    if (!poll || poll.userVotedOptionId) return null;
    const opt = poll.options.find(o => o.id === optionId);
    if (opt) {
      opt.votes += 1;
      poll.totalVotes += 1;
      poll.userVotedOptionId = optionId;
      setLocal(STORAGE_KEYS.POLLS, [...list]);
    }
    return poll;
  },

  resetToDefaults: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
};
