import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2,
  Bell,
  Wrench, 
  Package, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  Shield,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { communityService } from '../../services/communityService';
import { lendingService } from '../../services/lendingService';
import { safetyService } from '../../services/safetyService';
import { CommunityPost, LendingItem, SafetyReport, CommunityEvent } from '../../types';
import { CommunityFeedCard } from '../../components/community/CommunityFeedCard';
import { NotificationPanel } from '../../components/common/NotificationPanel';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../hooks/useNotification';

export const DashboardPage: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const navigate = useNavigate();
  const { showToast, unreadCount } = useNotification();

  // Data states
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [nearbyItems, setNearbyItems] = useState<LendingItem[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BORROW' | 'EVENTS' | 'SAFETY'>('ALL');
  const [nearbyTab, setNearbyTab] = useState<'ALL' | 'ITEMS' | 'EVENTS' | 'SAFETY'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // UI modal and dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [postType, setPostType] = useState<CommunityPost['type']>('BORROW_ASK');
  const [postContent, setPostContent] = useState('');
  const [postTag, setPostTag] = useState('Borrow Request');
  const [postImageUrl, setPostImageUrl] = useState('');

  // Event RSVP interactive state
  const [joinedEvents, setJoinedEvents] = useState<Record<string, boolean>>({
    'evt-cleanup': true,
    'evt-yoga': false,
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [feedPosts, items, reports] = await Promise.all([
        communityService.getPosts(),
        lendingService.getItems(),
        safetyService.getReports(),
      ]);
      setPosts(feedPosts);
      setNearbyItems(items.filter((i) => i.status === 'AVAILABLE').slice(0, 3));
      setSafetyReports(reports);
    } catch (err) {
      console.error('Failed loading community feed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !user) return;

    try {
      await communityService.createPost(
        {
          content: postContent.trim(),
          type: postType,
          tag: postTag,
          imageUrl: postImageUrl.trim() || undefined,
          actionLabel: postType === 'BORROW_ASK' ? 'Offer to Lend' : undefined,
        },
        user
      );
      showToast('Post Shared', 'Your message has been posted to the society feed!', 'success');
      setIsNewPostModalOpen(false);
      setPostContent('');
      setPostImageUrl('');
      loadData();
    } catch {
      showToast('Error', 'Failed to create post. Please try again.', 'error');
    }
  };

  const toggleEventJoin = (eventId: string, title: string) => {
    setJoinedEvents(prev => {
      const newState = !prev[eventId];
      showToast(
        newState ? 'RSVP Confirmed' : 'RSVP Cancelled',
        newState ? `You are attending "${title}"` : `Removed from "${title}"`,
        'success'
      );
      return { ...prev, [eventId]: newState };
    });
  };

  // Filtered community posts
  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'BORROW') return p.type === 'BORROW_ASK' || p.type === 'ITEM_SHARE';
    if (activeFilter === 'EVENTS') return p.type === 'EVENT_SHARE';
    if (activeFilter === 'SAFETY') return p.type === 'SAFETY_UPDATE';
    return true;
  });

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Priya';
  const trustScore = user?.trustScore || 88;

  // Static realistic upcoming events for preview (strictly next 1-2 events)
  const upcomingEventsPreview: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    organizer: string;
    categoryBadge: string;
  }> = [
    {
      id: 'evt-cleanup',
      title: 'Community Cleanup Drive & Garden Beautification',
      date: 'This Sunday',
      time: '08:00 AM – 10:30 AM',
      location: 'Central Lawns & Perimeter Walkway',
      attendees: 18,
      organizer: 'Arjun Mehta (Green Committee)',
      categoryBadge: '🧹 Cleanliness',
    },
    {
      id: 'evt-yoga',
      title: 'Sunrise Pranayama & Weekend Yoga Session',
      date: 'This Saturday',
      time: '06:30 AM – 07:45 AM',
      location: 'Clubhouse Rooftop Terrace',
      attendees: 12,
      organizer: 'Anita Rao (Block C · 302)',
      categoryBadge: '🧘 Fitness',
    },
  ];

  // Latest important safety update (strictly 1 latest notice)
  const latestSafetyUpdate = {
    title: 'Water Supply Valve Servicing & Tank Maintenance',
    status: 'Scheduled Tomorrow',
    time: '10:00 AM – 01:00 PM',
    location: 'All Blocks (A, B & C) · Gate 1 Pumping Station',
    note: 'Municipal supply servicing & rooftop overhead tank flush. Please store sufficient water in advance.',
    severity: 'MEDIUM',
    issuedBy: 'Estate Facilities & Security Desk',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      {/* ========================================================================= */}
      {/* 1. COMPACT APP HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 rounded-2xl border border-indigo-100/80 shadow-[0_2px_12px_rgba(99,102,241,0.06)] flex items-center justify-between transition-all">
        {/* Left: Society Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight tracking-tight">
                Oakridge Heights
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Verified Campus" />
            </div>
            <p className="text-[10.5px] text-slate-500 font-medium">
              {user?.block || 'Block B'} · Apt {user?.apartmentNumber || '402'}
            </p>
          </div>
        </div>

        {/* Right: Notification Icon, Demo Role Switcher & Avatar */}
        <div className="flex items-center space-x-2">
          {/* Subtle Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center space-x-1 px-2 py-1 text-[11px] font-semibold rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="text-violet-700 font-bold">
                {role === 'ADMIN' ? 'Admin' : 'Resident'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn"
                onClick={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Persona
                </div>
                <button
                  type="button"
                  onClick={() => switchRole('RESIDENT')}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    role === 'RESIDENT' ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-3.5 h-3.5 text-violet-600" />
                    <span>Priya (Resident)</span>
                  </div>
                  {role === 'RESIDENT' && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('ADMIN')}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Srikumar (Admin)</span>
                  </div>
                  {role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Notification Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
            <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* Avatar */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center p-0.5 rounded-full ring-2 ring-violet-400/40 hover:ring-violet-600 transition-all cursor-pointer active:scale-95"
            aria-label="My Profile"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Priya Sharma'}
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. GREETING */}
      {/* ========================================================================= */}
      <section className="px-1 pt-1">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          {getGreeting()}, {firstName} <span className="text-xl sm:text-2xl">👋</span>
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
          Here's what's happening around you.
        </p>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK ACTIONS (Horizontal Scrolling) */}
      {/* ========================================================================= */}
      <section aria-label="Quick actions" className="pt-0.5">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {/* Borrow */}
          <button
            type="button"
            onClick={() => navigate('/share-borrow')}
            className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[82px] bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 p-2.5 rounded-2xl shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-950 leading-tight">Borrow</span>
          </button>

          {/* Lend */}
          <button
            type="button"
            onClick={() => navigate('/share-borrow?action=create')}
            className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[82px] bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/90 p-2.5 rounded-2xl shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-950 leading-tight">Lend</span>
          </button>

          {/* Report */}
          <button
            type="button"
            onClick={() => navigate('/safety-watch?action=report')}
            className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[82px] bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200/90 p-2.5 rounded-2xl shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-950 leading-tight">Report</span>
          </button>

          {/* Events */}
          <button
            type="button"
            onClick={() => navigate('/community?tab=events')}
            className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[82px] bg-fuchsia-50/90 hover:bg-fuchsia-100/90 border border-fuchsia-200/90 p-2.5 rounded-2xl shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-fuchsia-100 text-fuchsia-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-fuchsia-950 leading-tight">Events</span>
          </button>

          {/* Map */}
          <button
            type="button"
            onClick={() => navigate('/community-map')}
            className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[82px] bg-sky-50/90 hover:bg-sky-100/90 border border-sky-200/90 p-2.5 rounded-2xl shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-sky-950 leading-tight">Map</span>
          </button>
        </div>
      </section>

      {/* Quick Post Prompt Input */}
      <div 
        onClick={() => setIsNewPostModalOpen(true)}
        className="bg-white/95 backdrop-blur-xs rounded-2xl border border-indigo-200/90 p-3 flex items-center space-x-3 shadow-2xs cursor-pointer hover:border-indigo-400 transition-all hover:shadow-xs"
      >
        <img
          src={user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
          alt="My Avatar"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-300"
        />
        <div className="flex-1 text-xs text-slate-500 bg-slate-50/90 py-2 px-3.5 rounded-full border border-slate-200/70 select-none">
          Ask a neighbour or share something...
        </div>
        <div className="text-violet-700 bg-violet-100 px-3 py-1 rounded-full text-xs font-bold hover:bg-violet-200 transition-colors">
          Post
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. COMMUNITY ACTIVITY FEED */}
      {/* ========================================================================= */}
      <section aria-label="Community activity feed" className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Community Activity
          </h3>

          {/* Feed Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('BORROW')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === 'BORROW'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              Borrow
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('EVENTS')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === 'EVENTS'
                  ? 'bg-fuchsia-600 text-white shadow-2xs'
                  : 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 hover:bg-fuchsia-100'
              }`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('SAFETY')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === 'SAFETY'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Safety
            </button>
          </div>
        </div>

        {/* Post Items */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto" />
            <p>Loading neighborhood feed...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
            <p className="text-xs text-slate-500">No posts found in this category.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <CommunityFeedCard
              key={post.id}
              post={post}
              currentUser={user}
              onPostUpdated={loadData}
            />
          ))
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. NEARBY SECTION ("Things near you") */}
      {/* ========================================================================= */}
      <section aria-label="Things near you" className="bg-white/95 backdrop-blur-xs rounded-2xl border border-indigo-100/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Things near you
            </h3>
            <p className="text-[11px] text-slate-500">
              Available tools, upcoming meetups & active notices
            </p>
          </div>

          {/* Quick tab filters for nearby section */}
          <div className="flex items-center space-x-1 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setNearbyTab('ALL')}
              className={`px-2 py-0.8 rounded-lg transition-colors cursor-pointer ${
                nearbyTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setNearbyTab('ITEMS')}
              className={`px-2 py-0.8 rounded-lg transition-colors cursor-pointer ${
                nearbyTab === 'ITEMS' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Items
            </button>
            <button
              type="button"
              onClick={() => setNearbyTab('EVENTS')}
              className={`px-2 py-0.8 rounded-lg transition-colors cursor-pointer ${
                nearbyTab === 'EVENTS' ? 'bg-fuchsia-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => setNearbyTab('SAFETY')}
              className={`px-2 py-0.8 rounded-lg transition-colors cursor-pointer ${
                nearbyTab === 'SAFETY' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Safety
            </button>
          </div>
        </div>

        {/* Nearby Cards List */}
        <div className="space-y-2.5">
          {/* Nearby Items */}
          {(nearbyTab === 'ALL' || nearbyTab === 'ITEMS') && nearbyItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10.5px] text-slate-500">
                    {item.ownerName} · {item.ownerApartment} · <span className="text-emerald-700 font-semibold">Available</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/share-borrow')}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors shrink-0 cursor-pointer ml-2"
              >
                Borrow
              </button>
            </div>
          ))}

          {/* Nearby Event */}
          {(nearbyTab === 'ALL' || nearbyTab === 'EVENTS') && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 hover:border-fuchsia-300 transition-colors">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-100 text-fuchsia-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    Cleanup Drive & Garden Beautification
                  </h4>
                  <p className="text-[10.5px] text-slate-500">
                    Sunday 8 AM · Central Lawn · 18 neighbors
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleEventJoin('evt-cleanup', 'Cleanup Drive')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors shrink-0 cursor-pointer ml-2 ${
                  joinedEvents['evt-cleanup']
                    ? 'bg-fuchsia-600 text-white'
                    : 'text-fuchsia-800 bg-fuchsia-100 hover:bg-fuchsia-200'
                }`}
              >
                {joinedEvents['evt-cleanup'] ? 'Going ✓' : 'Join'}
              </button>
            </div>
          )}

          {/* Nearby Safety Notice */}
          {(nearbyTab === 'ALL' || nearbyTab === 'SAFETY') && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 hover:border-rose-300 transition-colors">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    Block B Pathway Streetlight Maintenance
                  </h4>
                  <p className="text-[10.5px] text-slate-500">
                    Pole #3 repair in progress · Technician assigned
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/safety-watch')}
                className="px-2.5 py-1 text-[11px] font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors shrink-0 cursor-pointer ml-2"
              >
                Sentinel
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SMALL TRUST / REPUTATION WIDGET (Compact, Non-Dominating) */}
      {/* ========================================================================= */}
      <section aria-label="Reputation widget">
        <button
          type="button"
          onClick={() => navigate('/trust-points')}
          className="w-full bg-white/90 hover:bg-white border border-indigo-100/90 hover:border-indigo-200 px-3.5 py-2.5 rounded-xl shadow-2xs flex items-center justify-between transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-base leading-none">⭐</span>
            <div>
              <span className="text-xs font-bold text-slate-900">
                {trustScore} Trust Points
              </span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="text-[11px] font-medium text-slate-500">
                Level 3 Pillar of Community
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700">
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </section>

      {/* ========================================================================= */}
      {/* 7. UPCOMING EVENT PREVIEW (Only Next 1–2 Events) */}
      {/* ========================================================================= */}
      <section aria-label="Upcoming events" className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Upcoming Events
          </h3>
          <button
            type="button"
            onClick={() => navigate('/community?tab=events')}
            className="text-[11px] font-bold text-fuchsia-700 hover:text-fuchsia-900 flex items-center space-x-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {upcomingEventsPreview.map((event) => (
            <article 
              key={event.id}
              className="bg-white/95 rounded-2xl border border-fuchsia-200/70 p-3.5 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-fuchsia-800 bg-fuchsia-100/80 px-2 py-0.5 rounded-full">
                    {event.categoryBadge}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                    {event.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEventJoin(event.id, event.title)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    joinedEvents[event.id]
                      ? 'bg-fuchsia-600 text-white shadow-2xs'
                      : 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 hover:bg-fuchsia-100'
                  }`}
                >
                  {joinedEvents[event.id] ? 'RSVP ✓' : 'Join'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                <div className="flex items-center space-x-1 font-semibold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-fuchsia-600" />
                  <span>{event.date} · {event.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SAFETY PREVIEW (Only Latest Important Safety Update) */}
      {/* ========================================================================= */}
      <section aria-label="Safety Sentinel update" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Latest Safety Update</span>
          </h3>
          <button
            type="button"
            onClick={() => navigate('/safety-watch')}
            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 flex items-center space-x-0.5 cursor-pointer"
          >
            <span>Safety Sentinel</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <article className="bg-rose-50/60 rounded-2xl border border-rose-200/80 p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-rose-950">
                  {latestSafetyUpdate.title}
                </h4>
                <p className="text-[11px] font-medium text-rose-800/80 mt-0.5">
                  {latestSafetyUpdate.location}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 shrink-0">
              {latestSafetyUpdate.status}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white/70 p-2.5 rounded-xl border border-rose-100">
            {latestSafetyUpdate.note}
          </p>

          <div className="flex items-center justify-between pt-0.5 text-[11px]">
            <span className="text-slate-500 font-medium">
              Issued by: {latestSafetyUpdate.issuedBy}
            </span>
            <button
              type="button"
              onClick={() => {
                showToast('Acknowledged', 'Noted water maintenance for tomorrow 10 AM', 'success');
              }}
              className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200/80 transition-colors cursor-pointer"
            >
              Acknowledge ✓
            </button>
          </div>
        </article>
      </section>

      {/* ========================================================================= */}
      {/* NEW POST MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        title="Post to Oakridge Neighbours"
        subtitle="Visible to all verified residents in Block A, B & C"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              What would you like to share?
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPostType('BORROW_ASK');
                  setPostTag('Borrow Request');
                }}
                className={`p-2.5 rounded-xl border text-center font-medium transition-colors cursor-pointer ${
                  postType === 'BORROW_ASK'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🔧 Need to Borrow
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostType('GENERAL_NOTICE');
                  setPostTag('Neighbour Notice');
                }}
                className={`p-2.5 rounded-xl border text-center font-medium transition-colors cursor-pointer ${
                  postType === 'GENERAL_NOTICE'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                💬 General Update
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostType('ITEM_SHARE');
                  setPostTag('Offering to Share');
                }}
                className={`p-2.5 rounded-xl border text-center font-medium transition-colors cursor-pointer ${
                  postType === 'ITEM_SHARE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                📦 Share an Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your message
            </label>
            <textarea
              required
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={
                postType === 'BORROW_ASK'
                  ? 'e.g., Does anyone have a step ladder I could borrow for 30 minutes to clean AC filters?'
                  : 'e.g., Someone found a set of keys near the lobby...'
              }
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional Image URL
            </label>
            <input
              type="url"
              value={postImageUrl}
              onChange={(e) => setPostImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewPostModalOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!postContent.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 rounded-xl cursor-pointer shadow-xs"
            >
              Post to Community
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
