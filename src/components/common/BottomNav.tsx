import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  ShieldAlert, 
  User 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home, activeColor: 'text-indigo-700 bg-indigo-100/90', dotColor: 'bg-indigo-600' },
    { to: '/community', label: 'Community', icon: Users, activeColor: 'text-fuchsia-700 bg-fuchsia-100/90', dotColor: 'bg-fuchsia-600' },
    { to: '/share-borrow', label: 'Share', icon: Package, activeColor: 'text-amber-700 bg-amber-100/90', dotColor: 'bg-amber-600' },
    { to: '/safety-watch', label: 'Safety', icon: ShieldAlert, activeColor: 'text-rose-700 bg-rose-100/90', dotColor: 'bg-rose-600' },
    { to: '/profile', label: 'Profile', icon: User, activeColor: 'text-violet-700 bg-violet-100/90', dotColor: 'bg-violet-600' },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-indigo-100/80 shadow-[0_-4px_20px_rgba(99,102,241,0.1)] sm:hidden"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all relative select-none ${
                  isActive
                    ? 'font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? `${item.activeColor} scale-110 shadow-2xs` : 'hover:bg-slate-50'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className={`text-[10px] leading-none mt-0.5 tracking-tight ${
                    isActive ? 'font-bold text-slate-900' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} absolute bottom-1`} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
