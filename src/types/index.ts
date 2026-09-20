export type UserRole = 'RESIDENT' | 'ADMIN';

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  apartmentNumber: string;
  block: string;
  phone: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  active?: boolean;
  avatarUrl?: string;
  trustScore: number;
  badges: string[];
  joinedDate: string;
  bio?: string;
  emergencyContact?: string;
}

export type ItemCategory = 
  | 'TOOLS' 
  | 'ELECTRONICS' 
  | 'HOME_APPLIANCES' 
  | 'SPORTS_FITNESS' 
  | 'BOOKS_MEDIA' 
  | 'GARDENING' 
  | 'CAMPING' 
  | 'OTHER';

export type ItemStatus = 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE';

export interface LendingItem {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  ownerId: string;
  ownerName: string;
  ownerApartment: string;
  ownerTrustScore: number;
  status: ItemStatus;
  maxBorrowDays: number;
  depositRequired: number; // in local currency / zero if free
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  usageCount?: number;
  usageText?: string;
  rules?: string[];
  borrowHistory?: {
    borrowerName: string;
    borrowerApartment: string;
    date: string;
    returnedInCondition: string;
    rating: number;
  }[];
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';

export interface BorrowRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  requesterId: string;
  requesterName: string;
  requesterApartment: string;
  requesterTrustScore: number;
  ownerId: string;
  requestedDays: number;
  purpose: string;
  status: RequestStatus;
  requestedAt: string;
  responseAt?: string;
}

export type SafetyCategory = 
  | 'SECURITY'
  | 'INFRASTRUCTURE'
  | 'LIGHTING'
  | 'MAINTENANCE'
  | 'WATER'
  | 'OTHER';

export type SafetySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type SafetyStatus = 'PENDING' | 'VERIFIED' | 'RESOLVED' | 'REJECTED';

export interface SafetyReport {
  id: string;
  title: string;
  description: string;
  category: SafetyCategory;
  severity: SafetySeverity;
  block?: string;
  location: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  reporterId?: string;
  reporterName: string;
  reporterApartment?: string;
  reporterBlock?: string;
  status: SafetyStatus;
  isVerifiedByAdmin: boolean;
  adminNotes?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory = 
  | 'CLEANUP' 
  | 'TREE_PLANTING' 
  | 'SPORTS' 
  | 'MEETING' 
  | 'FESTIVAL' 
  | 'BLOOD_DONATION' 
  | 'KIDS' 
  | 'MAINTENANCE' 
  | 'OTHER';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventParticipantSummary {
  userId: string;
  userName: string;
  apartmentNumber?: string;
  profileImage?: string;
  joinedAt?: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  latitude: number;
  longitude: number;
  organizerId: string;
  organizerName: string;
  organizerApartment?: string;
  participantsCount: number;
  isJoinedByMe?: boolean;
  status: EventStatus;
  imageUrl?: string;
  createdAt?: string;
  participants?: EventParticipantSummary[];
}

export type TrustCategory = 
  | 'RESOURCE_SHARING' 
  | 'SAFETY_REPORT' 
  | 'EVENT_ORGANIZING' 
  | 'COMMUNITY_HELP' 
  | 'VERIFICATION_BONUS'
  | 'PENALTY';

export interface TrustTransaction {
  id: string;
  userId: string;
  userName?: string;
  apartmentNumber?: string;
  points: number;
  reason: string;
  category?: TrustCategory;
  referenceType?: string;
  referenceId?: string | number;
  timestamp: string;
}

export type NotificationType = 
  | 'BORROW_REQUEST' 
  | 'BORROW_APPROVED' 
  | 'SAFETY_ALERT' 
  | 'EVENT_UPDATE' 
  | 'TRUST_AWARD' 
  | 'VERIFICATION';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface SocietyStats {
  totalResidents: number;
  verifiedResidents: number;
  activeLendings: number;
  totalBorrowingsCompleted: number;
  openSafetyReports: number;
  resolvedSafetyReports: number;
  upcomingEvents: number;
  societyAverageTrustScore: number;
}

export type PostType = 
  | 'BORROW_ASK' 
  | 'EVENT_SHARE' 
  | 'SAFETY_UPDATE' 
  | 'GENERAL_NOTICE' 
  | 'ITEM_SHARE';

export interface PostComment {
  id: string;
  authorName: string;
  authorApartment: string;
  authorAvatar?: string;
  text: string;
  timeAgo: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorApartment: string;
  authorBlock: string;
  authorAvatar?: string;
  authorTrustScore?: number;
  type: PostType;
  content: string;
  timestamp: string;
  timeAgo: string;
  tag?: string;
  imageUrl?: string;
  actionLabel?: string;
  actionUrl?: string;
  likesCount: number;
  hasLiked?: boolean;
  comments: PostComment[];
  relatedEntityId?: string;
  eventDetails?: {
    date: string;
    time: string;
    location: string;
    attendeesCount: number;
    hasJoined?: boolean;
  };
  safetyDetails?: {
    severity: string;
    location: string;
    status: string;
    isVerified?: boolean;
  };
  itemDetails?: {
    itemId: string;
    title: string;
    category: string;
    status: string;
    imageUrl?: string;
  };
}

export interface SocietyAnnouncement {
  id: string;
  title: string;
  message: string;
  category: 'MAINTENANCE' | 'SECURITY' | 'MEETING' | 'FESTIVAL';
  effectiveDate: string;
  affectedBlocks: string;
  issuedBy: string;
  timestamp: string;
  isUrgent?: boolean;
}

export interface SocietyPoll {
  id: string;
  question: string;
  description?: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userVotedOptionId?: string;
  expiresAt: string;
  isActive: boolean;
}

