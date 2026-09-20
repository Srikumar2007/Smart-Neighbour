import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { ToastContainer } from '../components/common/ToastContainer';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100/50 via-rose-50/40 to-amber-100/40 flex flex-col antialiased text-slate-800 relative selection:bg-violet-200 selection:text-violet-900">
      {/* Subtle decorative ambient pastel light orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-80 h-80 bg-rose-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-amber-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Standard Web App Header */}
      <Navbar />

      {/* Main App Content Viewport */}
      <main className="flex-1 w-full pb-16 relative z-0">
        <Outlet />
      </main>

      {/* Mobile-only Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Floating Action Button (Create / Report / Share) */}
      <FloatingActionButton />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};
