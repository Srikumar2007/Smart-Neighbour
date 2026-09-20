import React from 'react';
import { Award, ShieldCheck, TrendingUp, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrustScoreCardProps {
  score: number;
  badges: string[];
  userName: string;
}

export const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  score,
  badges,
  userName,
}) => {
  const navigate = useNavigate();

  const getTier = (pts: number) => {
    if (pts >= 85) return { label: 'Pillar of Community', color: 'text-purple-700 bg-purple-50 border-purple-200' };
    if (pts >= 70) return { label: 'Trusted Neighbour', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    if (pts >= 50) return { label: 'Verified Resident', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'New Resident', color: 'text-slate-700 bg-slate-50 border-slate-200' };
  };

  const tier = getTier(score);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-teal-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">Community Trust Reputation</h3>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${tier.color}`}>
              {tier.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Built through resource lending, verified safety reports, and community participation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/trust-points')}
          className="inline-flex items-center text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer self-start sm:self-auto"
        >
          <span>Score Breakdown</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Score Display */}
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-600 transition-all duration-1000 ease-out"
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-base font-extrabold text-slate-900 leading-none">{score}</span>
              <span className="text-[9px] text-slate-400 font-medium">/ 100</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-900">{userName}</span>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center mt-0.5">
              <TrendingUp className="w-3 h-3 mr-1" />
              High Standing (Top 10%)
            </p>
          </div>
        </div>

        {/* Benefits Granted */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 md:col-span-2 space-y-2">
          <span className="text-xs font-semibold text-slate-700 block">
            Unlocked Resident Privileges
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero-deposit borrowing on tools</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Priority safety report escalation</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Clubhouse booking host rights</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Society committee voting badge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Carousel / Pills */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Earned Badges:
        </span>
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-50/70 text-teal-800 border border-teal-200/50"
          >
            <Award className="w-3 h-3 text-teal-600" />
            <span>{badge}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
