import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search,
  Shield, 
  User as UserIcon, 
  CheckCircle2, 
  ChevronDown,
  Building2,
  MapPin,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { NotificationPanel } from './NotificationPanel';
import { Modal } from './Modal';
import { API_BASE_URL } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, role, switchRole, backendConnected, checkConnection, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/share-borrow?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-indigo-100/80 px-3 sm:px-6 h-14 sm:h-15 flex items-center justify-between shadow-[0_2px_12px_rgba(99,102,241,0.08)] transition-all">
        {/* Left Side: Brand & Society Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <NavLink to="/dashboard" className="flex items-center space-x-2.5 group select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
                <span>Oakridge Heights</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Verified Campus" />
              </span>
              <div className="flex items-center text-[10px] text-slate-500 font-medium space-x-1">
                <span>Smart Neighbour</span>
              </div>
            </div>
          </NavLink>

          {/* Desktop Minimal Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 ml-4 pl-4 border-l border-indigo-100">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-indigo-100/80 text-indigo-900 shadow-2xs border border-indigo-200/70' : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50/60'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-fuchsia-100/80 text-fuchsia-900 shadow-2xs border border-fuchsia-200/70' : 'text-slate-600 hover:text-fuchsia-900 hover:bg-fuchsia-50/60'
                }`
              }
            >
              Community
            </NavLink>
            <NavLink
              to="/share-borrow"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-amber-100/80 text-amber-900 shadow-2xs border border-amber-200/70' : 'text-slate-600 hover:text-amber-900 hover:bg-amber-50/60'
                }`
              }
            >
              Share & Borrow
            </NavLink>
            <NavLink
              to="/safety-watch"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-rose-100/80 text-rose-900 shadow-2xs border border-rose-200/70' : 'text-slate-600 hover:text-rose-900 hover:bg-rose-50/60'
                }`
              }
            >
              Safety Sentinel
            </NavLink>
            <NavLink
              to="/community-map"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-cyan-100/80 text-cyan-900 shadow-2xs border border-cyan-200/70' : 'text-slate-600 hover:text-cyan-900 hover:bg-cyan-50/60'
                }`
              }
            >
              Campus Map
            </NavLink>
            {role === 'ADMIN' && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive ? 'bg-violet-100/90 text-violet-900 shadow-2xs border border-violet-200/80' : 'text-violet-700 hover:bg-violet-50/70'
                  }`
                }
              >
                Admin Panel
              </NavLink>
            )}
          </nav>
        </div>

        {/* Center: Search (Desktop & Tablet) */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, events, notices..."
              className="w-full bg-slate-100/90 border border-slate-200/80 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-400/50 transition-all"
            />
          </div>
        </form>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">

          {/* Role Badge Indicator */}
          <div className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border border-slate-200/80 bg-slate-50 text-slate-700">
            {role === 'ADMIN' ? (
              <span className="flex items-center text-indigo-700 text-[11px] sm:text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </span>
            ) : (
              <span className="flex items-center text-violet-700 text-[11px] sm:text-xs">
                <UserIcon className="w-3 h-3 mr-1" />
                Resident
              </span>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-1.5 sm:p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-violet-600 text-white font-extrabold text-[10px] flex items-center justify-center ring-2 ring-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* User Profile Avatar & Sign Out */}
          {user && (
            <div className="flex items-center space-x-1">
              <NavLink
                to="/profile"
                className="flex items-center space-x-2 p-1 rounded-full sm:rounded-xl ring-1 ring-slate-200 hover:ring-violet-500 hover:bg-slate-50 transition-all cursor-pointer group"
                title={`${user.name} (${user.apartmentNumber})`}
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
                <div className="hidden xl:block text-left pr-2">
                  <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-violet-700">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Apt {user.apartmentNumber}
                  </p>
                </div>
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
