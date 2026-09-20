import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  ExternalLink,
  Sparkles,
  Wrench,
  Package
} from 'lucide-react';
import { CommunityPost, User } from '../../types';
import { communityService } from '../../services/communityService';
import { useNotification } from '../../hooks/useNotification';

interface CommunityFeedCardProps {
  post: CommunityPost;
  currentUser: User | null;
  onPostUpdated?: () => void;
  onHelpNeighbor?: (post: CommunityPost) => void;
}

export const CommunityFeedCard: React.FC<CommunityFeedCardProps> = ({
  post,
  currentUser,
  onPostUpdated,
  onHelpNeighbor,
}) => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [hasJoinedEvent, setHasJoinedEvent] = useState(post.eventDetails?.hasJoined || false);
  const [attendeesCount, setAttendeesCount] = useState(post.eventDetails?.attendeesCount || 0);

  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount(prev => prev + (nextState ? 1 : -1));
    await communityService.toggleLikePost(post.id);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    const updatedPost = await communityService.addComment(post.id, commentText.trim(), currentUser);
    if (updatedPost) {
      setComments(updatedPost.comments);
      setCommentText('');
      showToast('Comment Posted', 'Your reply has been added.', 'success');
      if (onPostUpdated) onPostUpdated();
    }
  };

  const handleJoinEvent = () => {
    const next = !hasJoinedEvent;
    setHasJoinedEvent(next);
    setAttendeesCount(prev => prev + (next ? 1 : -1));
    showToast(
      next ? 'Joined Event! 🎉' : 'RSVP Cancelled',
      next ? `You're attending "${post.content.slice(0, 30)}..."` : 'RSVP removed',
      'info'
    );
  };

  const getCardBorder = () => {
    switch (post.type) {
      case 'BORROW_ASK': return 'border-amber-300/85 hover:border-amber-400 bg-amber-50/25 shadow-amber-500/5';
      case 'SAFETY_UPDATE': return 'border-rose-300/85 hover:border-rose-400 bg-rose-50/25 shadow-rose-500/5';
      case 'EVENT_SHARE': return 'border-fuchsia-300/85 hover:border-fuchsia-400 bg-fuchsia-50/25 shadow-fuchsia-500/5';
      case 'ITEM_SHARE': return 'border-emerald-300/85 hover:border-emerald-400 bg-emerald-50/25 shadow-emerald-500/5';
      default: return 'border-indigo-200/85 hover:border-indigo-400 bg-indigo-50/20 shadow-indigo-500/5';
    }
  };

  return (
    <article className={`bg-white/95 backdrop-blur-xs rounded-2xl border ${getCardBorder()} shadow-sm p-4 transition-all`}>
      {/* Post Header: Avatar, Name, Block, Timestamp */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-200"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-bold text-slate-900 leading-none">
                {post.authorName}
              </h4>
              {post.authorTrustScore && post.authorTrustScore >= 85 && (
                <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-full font-bold">
                  ⭐ {post.authorTrustScore}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {post.authorBlock} · Apt {post.authorApartment} · <span className="text-slate-400">{post.timeAgo}</span>
            </p>
          </div>
        </div>

        {/* Post Type Tag */}
        {post.tag && (
          <span className={`text-[10px] font-bold px-2.5 py-0.8 rounded-full ${
            post.type === 'BORROW_ASK'
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : post.type === 'SAFETY_UPDATE'
              ? 'bg-rose-100 text-rose-900 border border-rose-200'
              : post.type === 'EVENT_SHARE'
              ? 'bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200'
              : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
          }`}>
            {post.tag}
          </span>
        )}
      </div>

      {/* Post Body Content */}
      <p className="text-slate-800 text-sm mt-2.5 leading-relaxed font-normal whitespace-pre-line">
        {post.content}
      </p>

      {/* Optional Post Image */}
      {post.imageUrl && (
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100">
          <img
            src={post.imageUrl}
            alt="Community attachment"
            className="w-full h-44 sm:h-52 object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Embedded Rich Context: Event Attachment */}
      {post.eventDetails && (
        <div className="mt-3 bg-fuchsia-50/80 rounded-xl p-3 border border-fuchsia-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-1 text-xs text-slate-700">
            <div className="flex items-center space-x-2 font-bold text-fuchsia-950">
              <Calendar className="w-3.5 h-3.5 text-fuchsia-700" />
              <span>{post.eventDetails.date} · {post.eventDetails.time}</span>
            </div>
            <div className="flex items-center space-x-2 text-fuchsia-800/80 font-medium">
              <MapPin className="w-3.5 h-3.5 text-fuchsia-600" />
              <span>{post.eventDetails.location}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleJoinEvent}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
              hasJoinedEvent
                ? 'bg-fuchsia-700 text-white shadow-xs'
                : 'bg-white text-fuchsia-700 border border-fuchsia-300 hover:bg-fuchsia-100'
            }`}
          >
            {hasJoinedEvent ? `Attending (${attendeesCount}) ✓` : `Join ${attendeesCount} neighbors`}
          </button>
        </div>
      )}

      {/* Embedded Rich Context: Safety Location / Issue */}
      {post.safetyDetails && (
        <div className="mt-3 bg-rose-50/70 rounded-xl p-2.5 border border-rose-200/70 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-950">{post.safetyDetails.location}</span>
              <span className="mx-1.5 text-rose-300">·</span>
              <span className="text-[11px] text-rose-800 font-semibold">
                Status: {post.safetyDetails.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/safety-watch')}
            className="text-xs font-bold text-rose-800 hover:text-rose-950 flex items-center space-x-1 cursor-pointer bg-white/80 px-2.5 py-1 rounded-lg border border-rose-200"
          >
            <span>Sentinel View</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Embedded Rich Context: Shared Marketplace Item */}
      {post.itemDetails && (
        <div className="mt-3 bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-200/70 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            {post.itemDetails.imageUrl ? (
              <img
                src={post.itemDetails.imageUrl}
                alt={post.itemDetails.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 truncate">
                {post.itemDetails.title}
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Available now in {post.authorBlock}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/share-borrow')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs"
          >
            Borrow
          </button>
        </div>
      )}

      {/* Relevant Action Button for General & Safety Notice posts */}
      {post.actionLabel && !post.eventDetails && post.type !== 'BORROW_ASK' && (
        <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (post.actionUrl) {
                navigate(post.actionUrl);
              } else {
                showToast('Action Recorded', `Updated response for "${post.tag || 'Society Notice'}"`, 'success');
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200/80 active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <span>{post.actionLabel}</span>
          </button>
          <span className="text-[10px] text-slate-400 font-medium">Oakridge Verified</span>
        </div>
      )}

      {/* Primary Action Buttons if this is a neighbor borrow request */}
      {post.type === 'BORROW_ASK' && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              if (onHelpNeighbor) onHelpNeighbor(post);
              else {
                setShowComments(true);
                setCommentText(`I have one you can borrow! Let me know when you'd like to pick it up.`);
              }
            }}
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-1.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-xs"
          >
            {post.actionLabel || `Help ${post.authorName.split(' ')[0]}`}
          </button>
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reply
          </button>
        </div>
      )}

      {/* Engagement bar: Likes, Comments Toggle */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isLiked ? 'text-rose-600 font-semibold' : 'hover:text-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1.5 hover:text-slate-700 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400">
          Oakridge · {post.authorBlock}
        </span>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-fadeIn">
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-slate-50 rounded-xl p-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{comment.authorName}</span>
                    <span className="text-[10px] text-slate-400">{comment.timeAgo}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{comment.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a helpful reply..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-1.5 focus:ring-violet-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-1.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
