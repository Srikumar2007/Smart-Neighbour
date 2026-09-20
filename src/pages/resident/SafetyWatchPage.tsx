import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShieldAlert, 
  Plus, 
  AlertTriangle, 
  Wrench, 
  Droplet, 
  Zap,
  MapPin, 
  Clock, 
  ThumbsUp, 
  CheckCircle2, 
  Search,
  Map as MapIcon,
  List as ListIcon,
  X,
  Info,
  Shield,
  Building,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { safetyService } from '../../services/safetyService';
import { aiService, ClassifyReportResult, DuplicateReportMatch } from '../../services/aiService';
import { SafetyReport, SafetyCategory, SafetySeverity, SafetyStatus } from '../../types';
import { MapContainer } from '../../components/map/MapContainer';
import { Modal } from '../../components/common/Modal';
import { ReportCardSkeleton } from '../../components/common/LoadingSkeletons';
import { ErrorState } from '../../components/common/ErrorState';

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `Reported ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Reported ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Reported ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } catch {
    return 'Recently reported';
  }
}

export const SafetyWatchPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [searchParams] = useSearchParams();

  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // Selected report for Bottom Sheet / Modal
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Create Report Modal & Location Picker state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(searchParams.get('action') === 'report');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportCategory, setReportCategory] = useState<SafetyCategory>('SECURITY');
  const [reportSeverity, setReportSeverity] = useState<SafetySeverity>('MEDIUM');
  const [reportBlock, setReportBlock] = useState('Block A');
  const [reportLocation, setReportLocation] = useState('Near Main Entrance');
  const [reportLat, setReportLat] = useState<number>(11.9340);
  const [reportLng, setReportLng] = useState<number>(79.8320);
  const [reportImageUrl, setReportImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // AI Feature States
  const [isClassifyingAi, setIsClassifyingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<ClassifyReportResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateReportMatch | null>(null);

  const handleClassifyWithAi = async () => {
    if (!reportTitle.trim()) {
      showToast('AI Assistant', 'Please enter an issue title first', 'info');
      return;
    }
    setIsClassifyingAi(true);
    try {
      const result = await aiService.classifySafetyReport(reportTitle, reportDescription);
      setAiSuggestion(result);
      showToast('AI Classification Complete ✨', `Suggested category: ${result.category}, Severity: ${result.severity}`, 'success');
    } catch {
      showToast('Error', 'AI service unavailable', 'error');
    } finally {
      setIsClassifyingAi(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (aiSuggestion) {
      setReportCategory(aiSuggestion.category);
      setReportSeverity(aiSuggestion.severity);
      if (aiSuggestion.summary && !reportTitle) {
        setReportTitle(aiSuggestion.summary);
      }
      showToast('Suggestion Applied', 'Applied AI category and severity recommendations', 'info');
      setAiSuggestion(null);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!reportTitle.trim() || reportTitle.length < 4) return;
    try {
      const res = await aiService.detectDuplicateReport(reportTitle, reportDescription, reportLocation, reportLat, reportLng);
      if (res.isDuplicate && res.similarReport) {
        setDuplicateWarning(res.similarReport);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      setDuplicateWarning(null);
    }
  };

  const loadReports = async () => {
    setIsLoadingReports(true);
    setReportsError(null);
    try {
      const data = await safetyService.getReports();
      setReports(data);
    } catch (err: any) {
      setReportsError(err?.message || 'Unable to load safety reports right now.');
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpvote = async (reportId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await safetyService.upvoteReport(reportId);
      setReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
      if (selectedReport?.id === reportId) {
        setSelectedReport(updated);
      }
      showToast('Corroborated 👍', 'Thank you for verifying this issue.', 'info');
    } catch {
      showToast('Error', 'Could not corroborate report.', 'error');
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reportTitle.trim() || !reportDescription.trim() || !reportLocation.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await safetyService.createReport(
        {
          title: reportTitle.trim(),
          description: reportDescription.trim(),
          category: reportCategory,
          severity: reportSeverity,
          block: reportBlock.trim(),
          location: reportLocation.trim(),
          latitude: reportLat,
          longitude: reportLng,
          imageUrl: reportImageUrl.trim() || undefined,
        },
        user
      );

      showToast(
        'Safety Issue Submitted 🚨',
        'Report status is PENDING and will appear on the map once verified by administration.',
        'success'
      );
      setIsReportModalOpen(false);
      setReportTitle('');
      setReportDescription('');
      setReportLocation('Near Main Entrance');
      setReportImageUrl('');
      setFormError(null);
      loadReports();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit report. Please check input language.');
      showToast('Validation Error', err?.message || 'Failed to submit safety report.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryMeta = (category: SafetyCategory) => {
    switch (category) {
      case 'SECURITY':
        return { label: 'Security', icon: Shield, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', symbol: '🛡️' };
      case 'INFRASTRUCTURE':
        return { label: 'Infrastructure', icon: Building, bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', symbol: '🏗️' };
      case 'LIGHTING':
        return { label: 'Lighting', icon: Zap, bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', symbol: '💡' };
      case 'MAINTENANCE':
        return { label: 'Maintenance', icon: Wrench, bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', symbol: '🔧' };
      case 'WATER':
        return { label: 'Water', icon: Droplet, bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', symbol: '💧' };
      case 'OTHER':
      default:
        return { label: 'Other Hazard', icon: AlertTriangle, bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', symbol: '⚠️' };
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || r.category === selectedCategoryFilter;
    const matchesSeverity = selectedSeverityFilter === 'ALL' || r.severity === selectedSeverityFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      (r.location && r.location.toLowerCase().includes(query)) ||
      (r.block && r.block.toLowerCase().includes(query));

    return matchesCategory && matchesSeverity && matchesSearch;
  });

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem-4rem)] sm:h-[calc(100vh-4rem)] flex flex-col bg-slate-900 font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="shrink-0 bg-slate-900 border-b border-slate-800 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 z-30">
        
        {/* Left: Brand Tag & Search Input */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Safety Watch
            </h1>
          </div>

          <div className="relative w-44 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-400 bg-slate-800 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Center: Category Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Issues
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('SECURITY')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              selectedCategoryFilter === 'SECURITY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-950/60 text-indigo-300 border border-indigo-900 hover:bg-indigo-900/60'
            }`}
          >
            <span>🛡️ Security</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('INFRASTRUCTURE')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              selectedCategoryFilter === 'INFRASTRUCTURE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-950/60 text-amber-300 border border-amber-900 hover:bg-amber-900/60'
            }`}
          >
            <span>🏗️ Infra</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('LIGHTING')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              selectedCategoryFilter === 'LIGHTING'
                ? 'bg-yellow-600 text-white shadow-xs'
                : 'bg-yellow-950/60 text-yellow-300 border border-yellow-900 hover:bg-yellow-900/60'
            }`}
          >
            <span>💡 Lighting</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('MAINTENANCE')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              selectedCategoryFilter === 'MAINTENANCE'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-cyan-950/60 text-cyan-300 border border-cyan-900 hover:bg-cyan-900/60'
            }`}
          >
            <span>🔧 Maintenance</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('WATER')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              selectedCategoryFilter === 'WATER'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-950/60 text-sky-300 border border-sky-900 hover:bg-sky-900/60'
            }`}
          >
            <span>💧 Water</span>
          </button>
        </div>

        {/* Right: Severity Dropdown & View Mode Toggle & Report Action */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">⚠️ High</option>
            <option value="MEDIUM">⚡ Medium</option>
            <option value="LOW">🔹 Low</option>
          </select>

          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                viewMode === 'MAP'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report Issue</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {viewMode === 'MAP' ? (
          <MapContainer
            safetyReports={filteredReports}
            selectedLocation={
              selectedReport
                ? {
                    latitude: selectedReport.latitude,
                    longitude: selectedReport.longitude,
                    title: selectedReport.title,
                  }
                : null
            }
            onSelectEntity={(entity) => {
              const matched = reports.find(
                r => r.title === entity.title || (r.latitude === entity.latitude && r.longitude === entity.longitude)
              );
              if (matched) {
                setSelectedReport(matched);
              }
            }}
            height="100%"
          />
        ) : (
          <div className="w-full h-full p-4 overflow-y-auto no-scrollbar max-w-4xl mx-auto space-y-3">
            {isLoadingReports ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <ReportCardSkeleton key={i} />
                ))}
              </div>
            ) : reportsError ? (
              <ErrorState
                title="Unable to load safety reports"
                message={reportsError}
                onRetry={loadReports}
              />
            ) : filteredReports.length === 0 ? (
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-10 text-center text-slate-300 space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No active issues in this view</h3>
                <p className="text-xs text-slate-400">All verified reports clear! Select another filter or submit a new report.</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const meta = getCategoryMeta(report.category);
                return (
                  <article
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      setIsDetailModalOpen(true);
                    }}
                    className="bg-slate-800/95 border border-slate-700/80 hover:border-rose-500/60 rounded-2xl p-4 shadow-lg transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.8 rounded-full text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border} flex items-center space-x-1`}>
                          <span>{meta.symbol}</span>
                          <span>{meta.label}</span>
                        </span>

                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          report.severity === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : report.severity === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}>
                          {report.severity} SEVERITY
                        </span>
                      </div>

                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{report.status}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{report.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{report.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/60">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-semibold text-slate-200">{report.location}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatRelativeTime(report.createdAt)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleUpvote(report.id, e)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          report.hasUpvoted
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Corroborate ({report.upvotes || 0})</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom Sheet Card when Marker is Selected on Map */}
      {selectedReport && viewMode === 'MAP' && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-auto sm:w-96 z-40 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/90 p-4 text-white space-y-3 animate-slideUp">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {(() => {
                const meta = getCategoryMeta(selectedReport.category);
                return (
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border} flex items-center space-x-1`}>
                    <span>{meta.symbol}</span>
                    <span>{meta.label}</span>
                  </span>
                );
              })()}

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Status: {selectedReport.status}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white leading-snug">{selectedReport.title}</h3>
            <p className="text-xs text-slate-300 font-medium mt-1">📍 {selectedReport.location}</p>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {selectedReport.description}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{formatRelativeTime(selectedReport.createdAt)}</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleUpvote(selectedReport.id)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1 cursor-pointer"
              >
                <ThumbsUp className="w-3 h-3 text-violet-400" />
                <span>({selectedReport.upvotes || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(true)}
                className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Creation Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report a Safety or Maintenance Issue"
        subtitle="Location-based neutral issue reporting for estate management"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
          
          {/* Guidelines Pill */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 text-[11px] text-amber-900 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold text-amber-950">Issue-Based Guidelines:</strong> Reports must focus strictly on physical society hazards (e.g. broken lights, water leaks, open gates). Personal accusations or targeting specific individuals are prohibited and rejected by moderation.
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Category Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Select Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReportCategory('SECURITY')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 cursor-pointer ${
                  reportCategory === 'SECURITY'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>🛡️ Security</span>
              </button>

              <button
                type="button"
                onClick={() => setReportCategory('INFRASTRUCTURE')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 cursor-pointer ${
                  reportCategory === 'INFRASTRUCTURE'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building className="w-4 h-4 text-amber-600" />
                <span>🏗️ Infrastructure</span>
              </button>

              <button
                type="button"
                onClick={() => setReportCategory('LIGHTING')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 cursor-pointer ${
                  reportCategory === 'LIGHTING'
                    ? 'border-yellow-600 bg-yellow-50 text-yellow-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 text-yellow-600" />
                <span>💡 Lighting</span>
              </button>

              <button
                type="button"
                onClick={() => setReportCategory('MAINTENANCE')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 cursor-pointer ${
                  reportCategory === 'MAINTENANCE'
                    ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Wrench className="w-4 h-4 text-cyan-600" />
                <span>🔧 Maintenance</span>
              </button>

              <button
                type="button"
                onClick={() => setReportCategory('WATER')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 cursor-pointer ${
                  reportCategory === 'WATER'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Droplet className="w-4 h-4 text-sky-600" />
                <span>💧 Water</span>
              </button>

              <button
                type="button"
                onClick={() => setReportCategory('OTHER')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 cursor-pointer ${
                  reportCategory === 'OTHER'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>⚠️ Other</span>
              </button>
            </div>
          </div>

          {/* Title & Severity & AI Trigger */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Issue Title *</label>
                <button
                  type="button"
                  onClick={handleClassifyWithAi}
                  disabled={isClassifyingAi}
                  className="text-[11px] font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-2.5 py-0.5 rounded-lg border border-violet-200 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>{isClassifyingAi ? 'Analyzing...' : 'AI Auto-Classify ✨'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={(e) => {
                  setReportTitle(e.target.value);
                  handleCheckDuplicate();
                }}
                onBlur={handleCheckDuplicate}
                placeholder="e.g. Broken streetlight near Block C entrance"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity *</label>
              <select
                value={reportSeverity}
                onChange={(e) => setReportSeverity(e.target.value as SafetySeverity)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 font-semibold text-xs"
              >
                <option value="LOW">Low (Minor Notice)</option>
                <option value="MEDIUM">Medium (Normal Hazard)</option>
                <option value="HIGH">High (Urgent Repair)</option>
              </select>
            </div>
          </div>

          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="p-3 bg-violet-50/80 border border-violet-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-violet-900">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span>Gemini AI Classification Suggestion</span>
                </span>
                <span className="text-[10px] text-violet-700 font-bold bg-violet-100 px-2 py-0.5 rounded-full border border-violet-200">
                  Review Before Applying
                </span>
              </div>
              <div className="text-violet-900 space-y-0.5 text-[11px]">
                <p><strong>Suggested Category:</strong> {aiSuggestion.category} &bull; <strong>Suggested Severity:</strong> {aiSuggestion.severity}</p>
                <p className="text-violet-700 italic">"{aiSuggestion.summary}"</p>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleApplyAiSuggestion}
                  className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-2xs"
                >
                  Apply AI Suggestion
                </button>
              </div>
            </div>
          )}

          {/* Duplicate Detection Warning Banner */}
          {duplicateWarning && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 text-xs text-amber-900">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Similar issue may already have been reported near this location.</span>
              </div>
              <div className="p-2 bg-white/80 rounded-lg border border-amber-200 text-[11px] space-y-0.5">
                <p><strong>Existing Report:</strong> #{duplicateWarning.reportId} - {duplicateWarning.title}</p>
                <p><strong>Location:</strong> {duplicateWarning.location} &bull; <strong>Status:</strong> {duplicateWarning.status}</p>
                {duplicateWarning.reporterName && (
                  <p className="text-[10px] text-slate-500">Reported by {duplicateWarning.reporterName} ({duplicateWarning.reporterApartment})</p>
                )}
              </div>
              <p className="text-[10px] text-amber-800 font-medium italic">
                ℹ️ You may still submit your report if this is a separate issue. The system does not automatically reject your report.
              </p>
            </div>
          )}

          {/* Block & Location Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Block / Section</label>
              <input
                type="text"
                value={reportBlock}
                onChange={(e) => setReportBlock(e.target.value)}
                placeholder="e.g. Block A / North Gate"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Location Description *</label>
              <input
                type="text"
                required
                value={reportLocation}
                onChange={(e) => {
                  setReportLocation(e.target.value);
                  handleCheckDuplicate();
                }}
                placeholder="e.g. Ground Floor Elevator Lobby entrance"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              required
              rows={3}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Provide objective physical facts to assist society maintenance team."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          {/* Interactive Map Location Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Select Location on Map *</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Lat: {reportLat.toFixed(4)}, Lng: {reportLng.toFixed(4)}
              </span>
            </div>

            <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-200 relative">
              <MapContainer
                isPickerMode={true}
                pickerLocation={{ latitude: reportLat, longitude: reportLng }}
                onLocationPick={(lat, lng) => {
                  setReportLat(lat);
                  setReportLng(lng);
                }}
                height="100%"
              />
            </div>
          </div>

          {/* Optional Image URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Photo Image URL (Optional)</label>
            <input
              type="url"
              value={reportImageUrl}
              onChange={(e) => setReportImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-md cursor-pointer active:scale-95 transition-all text-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report for Moderation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Full Report Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedReport.title}
          subtitle={`Status: ${selectedReport.status} · Location: ${selectedReport.location}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">Category:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 font-bold text-slate-800">
                  {selectedReport.category}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">Severity:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                  {selectedReport.severity}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-1">Issue Description</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {selectedReport.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="block font-bold text-slate-800 mb-0.5">Reported Time</span>
                <span>{formatRelativeTime(selectedReport.createdAt)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="block font-bold text-slate-800 mb-0.5">Community Corroborations</span>
                <span className="font-bold text-rose-600">👍 {selectedReport.upvotes || 0} residents confirmed</span>
              </div>
            </div>

            {selectedReport.imageUrl && (
              <div>
                <span className="block font-bold text-slate-800 mb-1">Attached Photo</span>
                <img
                  src={selectedReport.imageUrl}
                  alt={selectedReport.title}
                  className="w-full h-48 object-cover rounded-2xl border border-slate-200"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleUpvote(selectedReport.id)}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 cursor-pointer flex items-center space-x-1.5"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Corroborate Issue</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
