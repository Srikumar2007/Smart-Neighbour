import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'teal' | 'indigo' | 'amber' | 'emerald' | 'purple';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'teal',
  onClick,
}) => {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50 text-teal-700',
      border: 'border-slate-200/80 hover:border-teal-300',
      icon: 'text-teal-600',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-700',
      border: 'border-slate-200/80 hover:border-indigo-300',
      icon: 'text-indigo-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700',
      border: 'border-slate-200/80 hover:border-amber-300',
      icon: 'text-amber-600',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700',
      border: 'border-slate-200/80 hover:border-emerald-300',
      icon: 'text-emerald-600',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700',
      border: 'border-slate-200/80 hover:border-purple-300',
      icon: 'text-purple-600',
    },
    fuchsia: {
      bg: 'bg-fuchsia-50 text-fuchsia-700',
      border: 'border-slate-200/80 hover:border-fuchsia-300',
      icon: 'text-fuchsia-600',
    },
  }[color] || {
    bg: 'bg-teal-50 text-teal-700',
    border: 'border-slate-200/80 hover:border-teal-300',
    icon: 'text-teal-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${colorMap.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${colorMap.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-normal leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};
