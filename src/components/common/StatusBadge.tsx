import React from 'react';
import { 
  ItemStatus, 
  RequestStatus, 
  SafetyStatus, 
  SafetySeverity, 
  EventStatus, 
  VerificationStatus 
} from '../../types';

interface StatusBadgeProps {
  status: ItemStatus | RequestStatus | SafetyStatus | SafetySeverity | EventStatus | VerificationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getStyles = () => {
    switch (status) {
      // Lending Status
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'BORROWED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MAINTENANCE':
        return 'bg-slate-100 text-slate-700 border-slate-200';

      // Request Status
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RETURNED':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      // Safety Status
      case 'REPORTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'VERIFIED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DISMISSED':
        return 'bg-slate-100 text-slate-600 border-slate-200';

      // Safety Severity
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';

      // Event Status
      case 'UPCOMING':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'ONGOING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatText = (text: string) => {
    return text
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${getStyles()} ${sizeClasses} ${className}`}
    >
      {formatText(status)}
    </span>
  );
};
