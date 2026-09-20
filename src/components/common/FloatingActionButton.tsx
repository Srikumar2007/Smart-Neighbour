import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  X, 
  Package, 
  ShieldAlert, 
  Calendar, 
  MessageSquarePlus,
  Sparkles
} from 'lucide-react';

interface FloatingActionButtonProps {
  onOpenShareModal?: () => void;
  onOpenSafetyModal?: () => void;
  onOpenEventModal?: () => void;
  onOpenPostModal?: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onOpenShareModal,
  onOpenSafetyModal,
  onOpenEventModal,
  onOpenPostModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (actionType: 'share' | 'safety' | 'event' | 'post') => {
    setIsOpen(false);
    if (actionType === 'share') {
      if (onOpenShareModal) onOpenShareModal();
      else navigate('/share-borrow?action=create');
    } else if (actionType === 'safety') {
      if (onOpenSafetyModal) onOpenSafetyModal();
      else navigate('/safety-watch?action=report');
    } else if (actionType === 'event') {
      if (onOpenEventModal) onOpenEventModal();
      else navigate('/community?tab=events&action=create');
    } else if (actionType === 'post') {
      if (onOpenPostModal) onOpenPostModal();
      else navigate('/community?action=post');
    }
  };

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-fadeIn"
        />
      )}

      {/* Floating Action Menu Items */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 flex flex-col items-end space-y-2.5 animate-slideUp">
          <button
            type="button"
            onClick={() => handleAction('post')}
            className="flex items-center space-x-3 bg-white/95 backdrop-blur-md text-slate-800 px-4 py-2.5 rounded-2xl shadow-lg border border-indigo-200/90 hover:bg-indigo-50/70 transition-transform active:scale-95 cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-800">Post to Community Feed</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('share')}
            className="flex items-center space-x-3 bg-white/95 backdrop-blur-md text-slate-800 px-4 py-2.5 rounded-2xl shadow-lg border border-amber-200/90 hover:bg-amber-50/70 transition-transform active:scale-95 cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-800">Share / Lend an Item</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('safety')}
            className="flex items-center space-x-3 bg-white/95 backdrop-blur-md text-slate-800 px-4 py-2.5 rounded-2xl shadow-lg border border-rose-200/90 hover:bg-rose-50/70 transition-transform active:scale-95 cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-800">Report Safety Issue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('event')}
            className="flex items-center space-x-3 bg-white/95 backdrop-blur-md text-slate-800 px-4 py-2.5 rounded-2xl shadow-lg border border-fuchsia-200/90 hover:bg-fuchsia-50/70 transition-transform active:scale-95 cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-800">Create Activity / Event</span>
            <div className="w-8 h-8 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Community Actions"
        className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-13 h-13 rounded-full flex items-center justify-center shadow-xl text-white transition-all transform active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-slate-900 rotate-45'
            : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 hover:from-violet-700 hover:to-indigo-700 shadow-indigo-500/35'
        }`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
};
