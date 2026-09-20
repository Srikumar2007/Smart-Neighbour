import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Bell, 
  Vote, 
  MapPin, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Share2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { communityService } from '../../services/communityService';
import { adminService } from '../../services/adminService';
import { CommunityPost, SocietyAnnouncement, SocietyPoll, User } from '../../types';
import { CommunityFeedCard } from '../../components/community/CommunityFeedCard';
import { Modal } from '../../components/common/Modal';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'announcements' | 'polls' | 'residents'>(
    (tabParam as any) || 'feed'
  );

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [announcements, setAnnouncements] = useState<SocietyAnnouncement[]>([]);
  const [polls, setPolls] = useState<SocietyPoll[]>([]);
  const [residents, setResidents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // RSVP state for events
  const [joinedEvents, setJoinedEvents] = useState<Record<string, boolean>>({
    'ev-cleanup': false,
    'ev-agm': true,
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [feedPosts, annList, pollList, resList] = await Promise.all([
        communityService.getPosts(),
        communityService.getAnnouncements(),
        communityService.getPolls(),
        adminService.getAllResidents(),
      ]);
      setPosts(feedPosts);
      setAnnouncements(annList);
      setPolls(pollList);
      setResidents(resList);
    } catch (err) {
      console.error('Error loading community data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVote = async (pollId: string, optionId: string) => {
    const updated = await communityService.votePoll(pollId, optionId);
    if (updated) {
      setPolls(prev => prev.map(p => (p.id === pollId ? updated : p)));
      showToast('Vote Recorded', 'Thank you for your community participation!', 'success');
    }
  };

  const handleToggleEvent = (eventId: string, title: string) => {
    setJoinedEvents(prev => {
      const next = !prev[eventId];
      showToast(
        next ? 'RSVP Confirmed 🎉' : 'RSVP Removed',
        next ? `You're attending "${title}"` : 'Your reservation has been cancelled',
        'info'
      );
      return { ...prev, [eventId]: next };
    });
  };

  // New Post modal state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<CommunityPost['type']>('BORROW_ASK');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    try {
      setIsSubmittingPost(true);
      await communityService.createPost(
        {
          content: newPostContent.trim(),
          type: newPostType,
          tag: newPostType === 'BORROW_ASK' ? 'Borrow Request' : newPostType === 'SAFETY_UPDATE' ? 'Safety Notice' : 'Community Activity',
          actionLabel: newPostType === 'BORROW_ASK' ? 'Offer Item' : undefined,
        },
        user
      );
      showToast('Post Published 🎉', 'Your update has been shared with your neighbours!', 'success');
      setNewPostContent('');
      setIsCreatePostOpen(false);
      await loadData();
    } catch (err) {
      showToast('Error', 'Failed to publish post. Please try again.', 'error');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-3.5 sm:px-4 pt-3 pb-12 space-y-4">
      {/* Community Screen Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Oakridge Community
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oakridge Heights Society · Blocks A, B & C
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/community-map')}
          className="text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-full flex items-center space-x-1 cursor-pointer transition-colors border border-violet-200/60"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Society Map</span>
        </button>
      </header>

      {/* Segmented Tab Navigation */}
      <nav 
        aria-label="Community sections"
        className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-2xl text-xs font-semibold overflow-x-auto no-scrollbar border border-slate-200/50"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('feed');
            setSearchParams({ tab: 'feed' });
          }}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-white text-violet-950 font-bold shadow-2xs border border-violet-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Feed
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('events');
            setSearchParams({ tab: 'events' });
          }}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'bg-white text-violet-950 font-bold shadow-2xs border border-violet-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Events
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('announcements');
            setSearchParams({ tab: 'announcements' });
          }}
          className={`flex-1 min-w-[90px] py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-white text-violet-950 font-bold shadow-2xs border border-violet-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Notices
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('polls');
            setSearchParams({ tab: 'polls' });
          }}
          className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
            activeTab === 'polls'
              ? 'bg-white text-violet-950 font-bold shadow-2xs border border-violet-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Polls
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('residents');
            setSearchParams({ tab: 'residents' });
          }}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
            activeTab === 'residents'
              ? 'bg-white text-violet-950 font-bold shadow-2xs border border-violet-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Neighbors
        </button>
      </nav>

      {/* Tab 1: Community Feed */}
      {activeTab === 'feed' && (
        <section aria-label="Community Feed" className="space-y-3">
          {/* Post Composer Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center space-x-3">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-100"
            />
            <button
              type="button"
              onClick={() => setIsCreatePostOpen(true)}
              className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left px-4 py-2 rounded-xl text-xs text-slate-500 transition-all cursor-pointer flex items-center justify-between"
            >
              <span>Ask neighbours to borrow, share updates or notices...</span>
              <Plus className="w-4 h-4 text-violet-600 shrink-0" />
            </button>
          </div>

          {posts.map((post) => (
            <CommunityFeedCard
              key={post.id}
              post={post}
              currentUser={user}
              onPostUpdated={loadData}
            />
          ))}
        </section>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        title="Share with Neighbours"
        subtitle="Post a borrow request, lost & found, or general community notice"
      >
        <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category</label>
            <select
              value={newPostType}
              onChange={(e) => setNewPostType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-violet-500"
            >
              <option value="BORROW_ASK">🔧 Borrow Request (Tools, Items)</option>
              <option value="GENERAL_NOTICE">📢 General Notice / Lost & Found</option>
              <option value="EVENT_SHARE">🎉 Community Activity</option>
              <option value="SAFETY_UPDATE">⚠️ Safety Update</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What would you like to ask or share with your neighbours?"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 resize-none text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatePostOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPost || !newPostContent.trim()}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingPost ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Tab 2: Events */}
      {activeTab === 'events' && (
        <section aria-label="Community Events" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">Upcoming Community Activities</span>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              Explore All & Host &rarr;
            </button>
          </div>

          {/* Clean modern listing redirecting to main Events page */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200 text-teal-950 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">Apartment Community Events</span>
              <h3 className="text-sm font-bold text-slate-900">Host cleanups, tree planting, sports, festivals & blood donation camps</h3>
              <p className="text-xs text-slate-600">Earn +20 Trust Points for organizing and +5 Trust Points for attending.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-xs shrink-0 cursor-pointer"
            >
              View Events Page
            </button>
          </div>
        </section>
      )}

      {/* Tab 3: Announcements */}
      {activeTab === 'announcements' && (
        <section aria-label="Official Society Notices" className="space-y-3">
          {announcements.map((ann) => (
            <article 
              key={ann.id} 
              className={`bg-white rounded-2xl border p-4 shadow-2xs space-y-2.5 ${
                ann.isUrgent ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base leading-none">📢</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                    Society Notice
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {ann.effectiveDate}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                {ann.title}
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed">
                {ann.message}
              </p>

              <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Affected: <strong className="text-slate-800 font-semibold">{ann.affectedBlocks}</strong></span>
                <span>By: {ann.issuedBy}</span>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Tab 4: Polls */}
      {activeTab === 'polls' && (
        <section aria-label="Society Polls" className="space-y-4">
          {polls.map((poll) => (
            <article key={poll.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-violet-800 bg-violet-50 px-2 py-0.5 rounded-md uppercase border border-violet-100">
                  🗳️ Resident Poll
                </span>
                <span className="text-[11px] text-slate-400">
                  {poll.expiresAt} · {poll.totalVotes} votes
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {poll.question}
              </h3>

              {poll.description && (
                <p className="text-xs text-slate-500">
                  {poll.description}
                </p>
              )}

              {/* Poll Options */}
              <div className="space-y-2 pt-1">
                {poll.options.map((opt) => {
                  const percentage = poll.totalVotes > 0 
                    ? Math.round((opt.votes / poll.totalVotes) * 100) 
                    : 0;
                  const isUserPick = poll.userVotedOptionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!!poll.userVotedOptionId}
                      onClick={() => handleVote(poll.id, opt.id)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all relative overflow-hidden cursor-pointer ${
                        isUserPick
                          ? 'border-violet-600 bg-violet-50/70 font-semibold text-violet-950 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {/* Background Vote Percentage Bar */}
                      {poll.userVotedOptionId && (
                        <div 
                          className="absolute inset-y-0 left-0 bg-violet-100/70 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      )}

                      <div className="relative flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          {isUserPick && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />}
                          <span>{opt.text}</span>
                        </span>
                        {poll.userVotedOptionId && (
                          <span className="font-semibold text-slate-700 ml-2">
                            {percentage}% ({opt.votes})
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!poll.userVotedOptionId && (
                <p className="text-[11px] text-slate-400 text-center italic">
                  Tap an option to cast your vote. One vote per resident flat.
                </p>
              )}
            </article>
          ))}
        </section>
      )}

      {/* Tab 5: Residents Directory */}
      {activeTab === 'residents' && (
        <section aria-label="Residents Directory" className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-500 px-1">
            Verified Oakridge Neighbours ({residents.length})
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {residents.map((r) => (
              <div key={r.id} className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center space-x-3">
                  <img
                    src={r.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={r.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-100"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-900">{r.name}</span>
                      {r.verificationStatus === 'VERIFIED' && (
                        <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.2 rounded-full font-semibold">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {r.block} · Apt {r.apartmentNumber}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-amber-600">
                    ⭐ {r.trustScore}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Trust score
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
