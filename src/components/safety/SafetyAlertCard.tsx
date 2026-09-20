import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  ThumbsUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SafetyReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface SafetyAlertCardProps {
  report: SafetyReport;
  onUpvote?: (id: string) => void;
  onViewOnMap?: (report: SafetyReport) => void;
  onStatusChange?: (id: string, status: any) => void;
  isAdmin?: boolean;
}

export const SafetyAlertCard: React.FC<SafetyAlertCardProps> = ({
  report,
  onUpvote,
  onViewOnMap,
  onStatusChange,
  isAdmin = false,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={report.severity} size="sm" />
            <StatusBadge status={report.status} size="sm" />
            {report.isVerifiedByAdmin && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Verified</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(report.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Title & Description */}
        <h4 className="text-base font-bold text-slate-900 leading-snug mb-1.5">
          {report.title}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {report.description}
        </p>

        {/* Location & Reporter */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-500 shrink-0" />
            <span className="truncate">{report.location}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Reported by: {report.reporterName} ({report.reporterApartment})</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Community Upvote Button */}
        <button
          type="button"
          onClick={() => onUpvote && onUpvote(report.id)}
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
            report.hasUpvoted
              ? 'bg-teal-50 text-teal-700 border-teal-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${report.hasUpvoted ? 'fill-teal-600' : ''}`} />
          <span>{report.upvotes} Confirmations</span>
        </button>

        <div className="flex items-center space-x-2">
          {onViewOnMap && (
            <button
              type="button"
              onClick={() => onViewOnMap(report)}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 px-2.5 py-1.5 rounded-lg hover:bg-teal-50 cursor-pointer"
            >
              Pin on Map
            </button>
          )}

          {isAdmin && onStatusChange && (
            <select
              value={report.status}
              onChange={(e) => onStatusChange(report.id, e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium cursor-pointer"
            >
              <option value="REPORTED">Reported</option>
              <option value="VERIFIED">Verify Report</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismiss</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};
