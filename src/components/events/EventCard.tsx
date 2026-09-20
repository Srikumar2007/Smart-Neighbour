import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  Plus, 
  Edit3, 
  Trash2,
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { CommunityEvent, EventCategory } from '../../types';

interface EventCardProps {
  event: CommunityEvent;
  currentUserId?: string;
  onToggleJoin?: (id: string) => void;
  onViewDetails?: (event: CommunityEvent) => void;
  onEdit?: (event: CommunityEvent) => void;
  onCancel?: (event: CommunityEvent) => void;
  onViewOnMap?: (event: CommunityEvent) => void;
}

export const getCategoryConfig = (category: EventCategory) => {
  switch (category) {
    case 'CLEANUP':
      return { label: 'Cleanup Drive', emoji: '🧹', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'TREE_PLANTING':
      return { label: 'Tree Planting', emoji: '🌿', color: 'bg-green-50 text-green-700 border-green-200' };
    case 'SPORTS':
      return { label: 'Sports & Fitness', emoji: '⚽', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'MEETING':
      return { label: 'Community Meeting', emoji: '🏛️', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'FESTIVAL':
      return { label: 'Festival Activity', emoji: '🎉', color: 'bg-pink-50 text-pink-700 border-pink-200' };
    case 'BLOOD_DONATION':
      return { label: 'Blood Donation', emoji: '🩸', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'KIDS':
      return { label: 'Kids Activity', emoji: '🎨', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    case 'MAINTENANCE':
      return { label: 'Maintenance Awareness', emoji: '🛠️', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    default:
      return { label: 'Community Event', emoji: '🎈', color: 'bg-violet-50 text-violet-700 border-violet-200' };
  }
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  currentUserId,
  onToggleJoin,
  onViewDetails,
  onEdit,
  onCancel,
  onViewOnMap,
}) => {
  const isOrganizer = String(currentUserId) === String(event.organizerId);
  const catConfig = getCategoryConfig(event.category);
  const isCancelled = event.status === 'CANCELLED';

  const participants = event.participants || [];
  const displayCount = event.participantsCount || participants.length || 0;

  // Format date nicely
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
      isCancelled ? 'border-slate-200 bg-slate-50/50 opacity-75' : 'border-slate-200/90 hover:border-teal-300 hover:shadow-md'
    }`}>
      <div>
        {/* Event Banner */}
        <div className="relative h-44 w-full bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-tr from-teal-900 via-teal-800 to-emerald-700 p-4 text-center">
              <span className="text-4xl mb-2">{catConfig.emoji}</span>
              <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">{catConfig.label}</span>
            </div>
          )}

          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Category Pill */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-md ${catConfig.color}`}>
              <span>{catConfig.emoji}</span>
              <span>{catConfig.label}</span>
            </span>
          </div>

          {/* Status / Organizer Badge */}
          <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5">
            {isCancelled ? (
              <span className="bg-rose-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                CANCELLED
              </span>
            ) : isOrganizer ? (
              <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Organized by You</span>
              </span>
            ) : null}
          </div>

          {/* Title overlay on image bottom */}
          <div className="absolute bottom-3 inset-x-3 text-white">
            <h3 className="text-base font-bold leading-snug line-clamp-1 drop-shadow-xs">
              {event.title}
            </h3>
            <p className="text-xs text-slate-200 flex items-center space-x-2 mt-0.5">
              <span>By {event.organizerName}</span>
              {event.organizerApartment && (
                <>
                  <span>•</span>
                  <span className="text-teal-200">{event.organizerApartment}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Date, Time & Location Pill Box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-medium">
                <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <div className="flex items-center space-x-2 text-slate-700 truncate pr-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate font-medium">{event.location}</span>
              </div>
              {onViewOnMap && (
                <button
                  type="button"
                  onClick={() => onViewOnMap(event)}
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-800 shrink-0 cursor-pointer"
                >
                  Map &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Attendees & Avatar Stack */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              {/* Avatar Stack */}
              <div className="flex -space-x-2 overflow-hidden">
                {participants.length > 0 ? (
                  participants.slice(0, 4).map((p, idx) => (
                    <div
                      key={p.userId || idx}
                      className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-2xs"
                      title={`${p.userName} (${p.apartmentNumber || 'Resident'})`}
                    >
                      {p.profileImage ? (
                        <img src={p.profileImage} alt={p.userName} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        p.userName.slice(0, 2)
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-7 w-7 rounded-full ring-2 ring-white bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px]">
                    {event.organizerName.slice(0, 2)}
                  </div>
                )}
                {displayCount > 4 && (
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-800 text-white flex items-center justify-center font-bold text-[9px]">
                    +{displayCount - 4}
                  </div>
                )}
              </div>

              {/* Dynamic text requirement: "12 neighbors are joining" */}
              <span className="text-xs font-semibold text-slate-800">
                {displayCount === 1 ? '1 neighbor is joining' : `${displayCount} neighbors are joining`}
              </span>
            </div>

            {/* Trust Points Badge */}
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Award className="w-3 h-3 text-emerald-600" />
              <span>+5 Trust</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-0">
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Detailed View Link */}
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(event)}
            className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {isOrganizer && !isCancelled && (
              <>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(event)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onCancel && (
                  <button
                    type="button"
                    onClick={() => onCancel(event)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Cancel Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {!isCancelled && onToggleJoin && (
              <button
                type="button"
                onClick={() => onToggleJoin(event.id)}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs ${
                  event.isJoinedByMe
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800'
                }`}
              >
                {event.isJoinedByMe ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-rose-600" />
                    <span>Leave Event</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Join Event</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
