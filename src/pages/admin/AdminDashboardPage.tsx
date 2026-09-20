import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShieldAlert, 
  Calendar, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { adminService } from '../../services/adminService';
import { societyStore } from '../../services/store';
import { SocietyStats, User, SafetyReport } from '../../types';
import { useNotification } from '../../hooks/useNotification';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SocietyStats | null>(null);
  const [pendingResidents, setPendingResidents] = useState<User[]>([]);
  const [recentReports, setRecentReports] = useState<SafetyReport[]>([]);
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const loadAdminData = async () => {
    const s = await adminService.getSocietyStats();
    const users = await adminService.getAllResidents();
    const reports = societyStore.getSafetyReports();

    setStats(s);
    setPendingResidents(users.filter((u) => u.verificationStatus === 'PENDING'));
    setRecentReports(reports.slice(0, 3));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyResident = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await adminService.updateResidentVerification(userId, status);
      showToast(
        status === 'VERIFIED' ? 'Resident Verified' : 'Application Rejected',
        `Updated status to ${status}`,
        'success'
      );
      loadAdminData();
    } catch {
      showToast('Error', 'Failed to update verification', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Oakridge Heights Admin Portal
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Management Committee
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee resident flat allocations, verify safety alerts, and supervise society operations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => navigate('/admin/residents')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Manage Residents ({pendingResidents.length} Pending)
          </button>
        </div>
      </div>

      {/* Admin Dashboard 6 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <DashboardCard
          title="Total Residents"
          value={stats?.totalResidents || 142}
          subtitle="Registered population"
          icon={Users}
          color="indigo"
          onClick={() => navigate('/admin/residents')}
        />
        <DashboardCard
          title="Active Residents"
          value={stats?.verifiedResidents || 128}
          subtitle="Verified accounts"
          icon={ShieldCheck}
          color="emerald"
          onClick={() => navigate('/admin/residents')}
        />
        <DashboardCard
          title="Pending Reports"
          value={stats?.openSafetyReports || 3}
          subtitle="Awaiting moderation"
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/admin/safety-reports')}
        />
        <DashboardCard
          title="Verified Reports"
          value={stats?.resolvedSafetyReports || 47}
          subtitle="Confirmed hazards"
          icon={FileCheck}
          color="teal"
          onClick={() => navigate('/admin/safety-reports')}
        />
        <DashboardCard
          title="Upcoming Events"
          value={stats?.upcomingEvents || 4}
          subtitle="Scheduled activities"
          icon={Calendar}
          color="fuchsia"
          onClick={() => navigate('/admin/events')}
        />
        <DashboardCard
          title="Items Shared"
          value={stats?.activeLendings || 24}
          subtitle="Lending inventory"
          icon={Package}
          color="purple"
          onClick={() => navigate('/share-borrow')}
        />
      </div>

      {/* 2-Column Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Verifications Queue */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pending Resident Verifications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify tenant lease or owner address allocation before granting community rights.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/residents')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>
          </div>

          {pendingResidents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All resident applications have been verified!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingResidents.map((res) => (
                <div key={res.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-600 shrink-0">
                      {res.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {res.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {res.block}, Apt {res.apartmentNumber} &bull; {res.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleVerifyResident(res.id, 'REJECTED')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyResident(res.id, 'VERIFIED')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Urgent Safety Reports */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Safety Reports Requiring Action
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Investigate security reports and dispatch facility maintenance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/safety-reports')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage Queue
            </button>
          </div>

          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    report.severity === 'HIGH' || report.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {report.severity} PRIORITY
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Reported by {report.reporterName} ({report.reporterApartment})
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-xs mb-1">
                  {report.title}
                </h5>
                <p className="text-slate-500 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
