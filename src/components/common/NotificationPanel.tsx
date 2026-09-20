import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  ShieldAlert, 
  Share2, 
  Calendar, 
  Award, 
  UserCheck, 
  X,
  Clock 
} from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { NotificationType } from '../../types';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'BORROW_REQUEST':
      case 'BORROW_APPROVED':
        return <Share2 className="w-4 h-4 text-emerald-600" />;
      case 'SAFETY_ALERT':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'EVENT_UPDATE':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'TRUST_AWARD':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'VERIFICATION':
        return <UserCheck className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-2xs" 
        onClick={onClose} 
      />
      <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
            {unreadCount > 0 && (
              <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center space-x-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No notifications yet
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.link)}
                className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start space-x-3 ${
                  !notif.isRead ? 'bg-teal-50/40' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
