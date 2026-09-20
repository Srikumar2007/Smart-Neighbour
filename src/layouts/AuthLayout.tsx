import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Home, ShieldCheck, HeartHandshake, Award } from 'lucide-react';
import { ToastContainer } from '../components/common/ToastContainer';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Branding Hero Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">Smart Neighbour</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
              A private platform for connected living.
            </h1>
            <p className="text-teal-100/80 text-xs sm:text-sm leading-relaxed mb-6">
              Verified community network exclusively for residents of Oakridge Heights Housing Society.
            </p>

            <div className="space-y-4 text-xs text-teal-50">
              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-lg bg-white/10 shrink-0 mt-0.5">
                  <HeartHandshake className="w-4 h-4 text-teal-200" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Lend & Borrow Tools</span>
                  <span className="text-teal-100/70">Share household equipment safely with trusted neighbours.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-lg bg-white/10 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-teal-200" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Safety Watch Alerts</span>
                  <span className="text-teal-100/70">Report maintenance hazards and suspicious activity promptly.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-lg bg-white/10 shrink-0 mt-0.5">
                  <Award className="w-4 h-4 text-teal-200" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Verified Trust Reputation</span>
                  <span className="text-teal-100/70">Build your neighbourhood trust score by contributing positively.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-teal-200/70">
            Smart Neighbour &bull; Spring Boot REST API Ready
          </div>
        </div>

        {/* Right Form Area */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <Outlet />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
