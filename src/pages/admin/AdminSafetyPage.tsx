import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle,
  AlertTriangle, 
  MapPin, 
  Clock, 
  ShieldCheck,
  Edit3,
  ThumbsUp,
  Ban
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { safetyService } from '../../services/safetyService';
import { societyStore } from '../../services/store';
import { SafetyReport, SafetyStatus } from '../../types';
import { useNotification } from '../../hooks/useNotification';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminSafetyPage: React.FC = () => {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<SafetyStatus>('VERIFIED');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useNotification();

  const loadReports = async () => {
    try {
      const data = societyStore.getSafetyReports();
      setReports(data);
    } catch {
      showToast('Error', 'Failed to load safety reports', 'error');
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleVerifyDirectly = async (reportId: string) => {
    try {
      await adminService.verifySafetyReport(reportId);
      showToast('Report Verified 🛡️', 'Report is now verified and published on the public map.', 'success');
      loadReports();
    } catch {
      showToast('Error', 'Failed to verify safety report', 'error');
    }
  };

  const handleRejectDirectly = async (reportId: string) => {
    try {
      await adminService.rejectSafetyReport(reportId);
      showToast('Report Rejected ❌', 'Report status updated to REJECTED.', 'info');
      loadReports();
    } catch {
      showToast('Error', 'Failed to reject report', 'error');
    }
  };

  const handleResolveDirectly = async (reportId: string) => {
    try {
      await adminService.resolveSafetyReport(reportId);
      showToast('Hazard Resolved ✅', 'Report marked as resolved.', 'success');
      loadReports();
    } catch {
      showToast('Error', 'Failed to resolve safety report', 'error');
    }
  };

  const handleOpenUpdate = (rep: SafetyReport) => {
    setSelectedReport(rep);
    setNewStatus(rep.status);
    setAdminNotes(rep.adminNotes || '');
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsSubmitting(true);
    try {
      await adminService.updateSafetyReportStatus(selectedReport.id, newStatus, adminNotes);
      showToast('Report Status Updated', `Safety report marked as ${newStatus}`, 'success');
      setIsUpdateModalOpen(false);
      loadReports();
    } catch {
      showToast('Error', 'Failed to update safety report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = (
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q)) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(q))
    );

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pendingCount = reports.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Safety Watch Moderation & Verification</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                {pendingCount} Pending Triage
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review resident issue submissions, verify legitimate hazards, reject personal accusations, or mark issues as resolved.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center space-x-1 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>⏳ Pending ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('VERIFIED')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center space-x-1 ${
              statusFilter === 'VERIFIED'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>🛡️ Verified</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
              statusFilter === 'RESOLVED'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            ✅ Resolved
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            ❌ Rejected
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, location, reporter..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Title & Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4 text-right">Quick Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                    No safety reports found matching filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.title}</div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Category: {r.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center space-x-1 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{r.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        r.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : r.severity === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {r.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-semibold text-slate-900">{r.reporterName || 'Verified Resident'}</div>
                      <div className="text-[10px] text-slate-400">{r.reporterApartment || r.block || 'Campus Resident'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {r.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerifyDirectly(r.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer inline-flex items-center space-x-1"
                              title="Verify Report and publish to Community Map"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectDirectly(r.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer inline-flex items-center space-x-1"
                              title="Reject Report"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {r.status === 'VERIFIED' && (
                          <button
                            type="button"
                            onClick={() => handleResolveDirectly(r.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer inline-flex items-center space-x-1"
                            title="Mark as Resolved"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenUpdate(r)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer inline-flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Manage & Update Safety Report */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={selectedReport ? `Manage: ${selectedReport.title}` : 'Safety Report Moderation'}
        subtitle="Review full issue details, update status, and log admin resolution notes."
        maxWidth="lg"
      >
        {selectedReport && (
          <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-700 border border-slate-200">
              <p><strong>Description:</strong> {selectedReport.description}</p>
              <p><strong>Location:</strong> {selectedReport.location}</p>
              <p><strong>Coordinates:</strong> Lat {selectedReport.latitude}, Lng {selectedReport.longitude}</p>
              <p><strong>Reporter Identity (Admin View):</strong> {selectedReport.reporterName} ({selectedReport.reporterApartment || selectedReport.block || 'Resident'})</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Report Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as SafetyStatus)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PENDING">PENDING (Awaiting Moderation)</option>
                  <option value="VERIFIED">VERIFIED (Published to Community Map)</option>
                  <option value="RESOLVED">RESOLVED (Hazard Repaired)</option>
                  <option value="REJECTED">REJECTED (Invalid / Personal Accusation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Direct Actions
                </label>
                <div className="flex space-x-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setNewStatus('VERIFIED')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center justify-center space-x-1 ${
                      newStatus === 'VERIFIED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('REJECTED')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center justify-center space-x-1 ${
                      newStatus === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Moderation & Resolution Notes
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Electrician team dispatched at 2:00 PM; replaced bulb and repaired wiring..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Status Update'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
