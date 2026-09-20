import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ChevronLeft,
  Award,
  Users,
  Package,
  HeartHandshake,
  TrendingUp,
  Info,
  Lock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { trustService, TrustSummary, calculateTrustLevel } from '../../services/trustService';
import { TrustTransaction } from '../../types';

export const TrustPointsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<TrustSummary | null>(null);
  const [history, setHistory] = useState<TrustTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [summaryData, historyData] = await Promise.all([
          trustService.getMyTrustSummary(),
          trustService.getTrustHistory(user?.id),
        ]);
        setSummary(summaryData);
        setHistory(historyData);
      } catch (err) {
        console.error('Error loading trust data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const score = summary?.trustPoints ?? (user?.trustScore || 88);
  const computedLevel = calculateTrustLevel(score);

  const levelTitle = summary?.trustLevel || computedLevel.levelTitle;
  const nextLevelTitle = summary?.nextTrustLevel || computedLevel.nextLevelTitle;
  const pointsNeeded = summary?.pointsToNextLevel ?? computedLevel.pointsToNextLevel;
  const progressPercent = summary?.progressPercentage ?? computedLevel.progressPercentage;

  const formatRelativeTime = (timestampStr: string) => {
    try {
      const d = new Date(timestampStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 20) return 'Today';
      if (diffDays === 1 || diffHours < 44) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return timestampStr;
    }
  };

  const trustTiers = [
    { range: '0–24', name: 'New Neighbor', icon: '🌱', active: score >= 0 && score <= 24 },
    { range: '25–49', name: 'Active Neighbor', icon: '⚡', active: score >= 25 && score <= 49 },
    { range: '50–99', name: 'Trusted Neighbor', icon: '⭐', active: score >= 50 && score <= 99 },
    { range: '100–199', name: 'Community Champion', icon: '🏆', active: score >= 100 && score <= 199 },
    { range: '200+', name: 'Community Leader', icon: '👑', active: score >= 200 },
  ];

  const officialTrustActions = [
    { action: 'Lend an item', points: '+10', icon: '📦', category: 'Lending' },
    { action: 'Return borrowed item on time', points: '+5', icon: '⏱️', category: 'Borrowing' },
    { action: 'Join community event', points: '+10', icon: '🎉', category: 'Events' },
    { action: 'Participate in cleanup', points: '+15', icon: '🧹', category: 'Eco Cleanup' },
    { action: 'Submit a verified useful report', points: '+10', icon: '🛡️', category: 'Safety' },
    { action: 'Help another resident', points: '+20', icon: '🤝', category: 'Neighbor Support' },
  ];

  return (
    <div className="max-w-xl mx-auto px-3.5 sm:px-4 pt-3 pb-12 space-y-4 font-sans">
      {/* Top Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Trust & Reputation</h1>
            <p className="text-xs text-slate-500">Smart Neighbour Verified Score</p>
          </div>
        </div>

        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>Backend Verified</span>
        </div>
      </div>

      {/* Main Reputation Hero Card */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-4">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 text-xl font-bold shadow-xs">
              ⭐
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">{user?.name || 'Verified Resident'}</h2>
              <span className="text-xs font-semibold text-teal-100/90">{user?.block || 'Block B'} · Apt {user?.apartmentNumber || '402'}</span>
            </div>
          </div>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-teal-950 shadow-xs border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-950" />
            <span>{levelTitle}</span>
          </span>
        </div>

        {/* Big Score & Visual Progress Bar Requirement */}
        <div className="relative z-10 space-y-2.5 pt-1">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-amber-300 drop-shadow-xs">
                ⭐ {score}
              </span>
              <span className="text-xs font-bold text-teal-100 uppercase tracking-wider">
                Trust Points
              </span>
            </div>

            <span className="text-xs font-semibold text-teal-200">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Styled Visual Progress Bar */}
          <div className="w-full bg-teal-950/40 h-3 rounded-full overflow-hidden p-0.5 border border-white/15 shadow-inner">
            <div 
              className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-teal-100 font-medium pt-0.5">
            <span className="font-bold text-white">{levelTitle}</span>
            {nextLevelTitle ? (
              <span className="text-amber-200 font-semibold">
                {pointsNeeded} points until {nextLevelTitle}
              </span>
            ) : (
              <span className="text-amber-300 font-bold">Highest Level Achieved! 👑</span>
            )}
          </div>
        </div>
      </div>

      {/* Trust Levels reference */}
      <section aria-label="Trust Levels Ladder" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Trust Levels & Badges
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Automatic Rank Progression</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {trustTiers.map((tier) => (
            <div 
              key={tier.name}
              className={`p-2.5 rounded-2xl border text-xs transition-all ${
                tier.active
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30 text-slate-900 shadow-2xs font-bold'
                  : 'bg-white border-slate-200/80 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{tier.icon}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  tier.active ? 'bg-amber-400 text-teal-950' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tier.range} pts
                </span>
              </div>
              <div className="text-xs font-bold truncate">{tier.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Trust Actions Point Table */}
      <section aria-label="Official Trust Actions" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Official Community Trust Actions
          </h3>
          <span className="text-[11px] font-semibold text-teal-700">Backend System Rules</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {officialTrustActions.map((act, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center space-x-2.5">
                <span className="text-base">{act.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{act.action}</div>
                  <span className="text-[10px] text-slate-400 font-medium">{act.category}</span>
                </div>
              </div>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {act.points} pts
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Trust History Feed */}
      <section aria-label="Trust History Log" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Trust History
          </h3>
          <span className="text-[11px] text-slate-400">Activity Ledger</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
              Loading trust ledger...
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No trust transaction history recorded yet. Participate in lending or events to earn trust points!
            </div>
          ) : (
            history.map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    tx.points >= 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {tx.points >= 0 ? `+${tx.points}` : tx.points}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {tx.reason}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center space-x-1.5">
                      <span>{formatRelativeTime(tx.timestamp)}</span>
                      {tx.referenceType && (
                        <>
                          <span>•</span>
                          <span className="text-teal-700 font-semibold uppercase">{tx.referenceType}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shrink-0 ml-2">
                  +{tx.points} pts
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Security Disclaimer Note */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start space-x-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Smart Neighbour trust scores are protected against manual editing. Trust transactions are generated automatically by backend verification when genuine community lending, event participation, or hazard reports occur.
        </p>
      </div>
    </div>
  );
};

