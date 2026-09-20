import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Share2, 
  ShieldAlert, 
  Calendar, 
  Award, 
  User, 
  Shield, 
  Users, 
  FileCheck, 
  LogOut, 
  Building2, 
  Star,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const residentNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Community Map', path: '/community-map', icon: Map },
    { label: 'Share & Borrow', path: '/share-borrow', icon: Share2 },
    { label: 'Safety Watch', path: '/safety-watch', icon: ShieldAlert },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Trust Points', path: '/trust-points', icon: Award },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Residents Management', path: '/admin/residents', icon: Users },
    { label: 'Safety Reports Queue', path: '/admin/safety-reports', icon: ShieldAlert },
    { label: 'Events Moderation', path: '/admin/events', icon: Calendar },
    { label: 'Content Moderation', path: '/admin/moderation', icon: FileCheck },
  ];

  const navItems = role === 'ADMIN' ? adminNavItems : residentNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
              SN
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Smart Neighbour</h2>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                {role === 'ADMIN' ? 'Admin Portal' : 'Resident Portal'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resident / Admin Trust Score Pill */}
        {user && (
          <div className="px-4 pt-4 pb-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Community Trust
                </span>
                <span className="inline-flex items-center text-xs font-bold text-amber-600">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500 mr-1" />
                  {user.trustScore} pts
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(user.trustScore, 100)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{user.apartmentNumber} ({user.block})</span>
                <span className="inline-flex items-center text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" />
                  {user.verificationStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {role === 'ADMIN' ? 'Administrative Controls' : 'Community Services'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-xs font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200/80 space-y-2">
          <div className="px-3 py-2 text-[11px] text-slate-500 flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">Oakridge Heights Soc.</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
