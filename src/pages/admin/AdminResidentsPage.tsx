import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Building, 
  Mail, 
  Award,
  MoreVertical
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User, VerificationStatus } from '../../types';
import { useNotification } from '../../hooks/useNotification';
import { Modal } from '../../components/common/Modal';

export const AdminResidentsPage: React.FC = () => {
  const [residents, setResidents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isTrustAdjustModalOpen, setIsTrustAdjustModalOpen] = useState(false);
  const [trustDelta, setTrustDelta] = useState(10);
  const [trustReason, setTrustReason] = useState('');

  const { showToast } = useNotification();

  const loadResidents = async () => {
    const data = await adminService.getAllResidents();
    setResidents(data);
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const handleUpdateStatus = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await adminService.updateResidentVerification(userId, status);
      showToast('Status Updated', `Resident status set to ${status}`, 'success');
      loadResidents();
    } catch {
      showToast('Error', 'Failed to update resident status', 'error');
    }
  };

  const handleAdjustTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !trustReason) return;

    try {
      await adminService.adjustResidentTrustScore(selectedUser.id, trustDelta, trustReason);
      showToast('Trust Points Adjusted', `Applied ${trustDelta > 0 ? '+' : ''}${trustDelta} points to ${selectedUser.name}`, 'success');
      setIsTrustAdjustModalOpen(false);
      setTrustReason('');
      loadResidents();
    } catch {
      showToast('Error', 'Failed to adjust trust points', 'error');
    }
  };

  const filteredResidents = residents.filter((res) => {
    const matchesBlock = blockFilter === 'ALL' || res.block === blockFilter;
    const matchesStatus = statusFilter === 'ALL' || res.verificationStatus === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      res.name.toLowerCase().includes(q) ||
      res.email.toLowerCase().includes(q) ||
      res.apartmentNumber.toLowerCase().includes(q);

    return matchesBlock && matchesStatus && matchesSearch;
  });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [userTrustHistory, setUserTrustHistory] = useState<TrustTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleInspectTrustHistory = async (user: User) => {
    setSelectedUser(user);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const historyData = await trustService.getTrustHistory(user.id);
      setUserTrustHistory(historyData);
    } catch {
      showToast('Error', 'Failed to fetch trust history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleToggleActive = async (userId: string, currentActive?: boolean) => {
    try {
      const nextState = !(currentActive ?? true);
      await adminService.toggleUserActive(userId, nextState);
      showToast(
        nextState ? 'Account Activated' : 'Account Deactivated',
        `Resident account is now ${nextState ? 'active' : 'deactivated'}`,
        nextState ? 'success' : 'info'
      );
      loadResidents();
    } catch {
      showToast('Error', 'Failed to change account status', 'error');
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Resident Directory & Flat Allocations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oakridge Heights resident roster, address approvals, account activation, and society trust moderation.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Blocks</option>
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="Block C">Block C</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resident name, flat, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Flat Allocation</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Account State</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((res) => {
                const isActive = res.active ?? true;
                return (
                  <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={res.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                          alt={res.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{res.name}</span>
                          <span className="text-[10px] text-slate-400">{res.role}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      <span className="font-semibold text-slate-900">{res.block}</span> &bull; Apt {res.apartmentNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div>{res.email}</div>
                      <div className="text-[10px] text-slate-400">{res.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        res.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : res.verificationStatus === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span>{res.verificationStatus}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        <span>{isActive ? 'Active' : 'Deactivated'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-teal-600" />
                        <span>{res.trustScore} pts</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(res)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(res.id, isActive)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInspectTrustHistory(res)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                        >
                          Ledger
                        </button>

                        {res.verificationStatus !== 'VERIFIED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(res.id, 'VERIFIED')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(res);
                            setIsTrustAdjustModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Adjust Trust Score */}
      <Modal
        isOpen={isTrustAdjustModalOpen}
        onClose={() => setIsTrustAdjustModalOpen(false)}
        title={selectedUser ? `Adjust Trust Points for ${selectedUser.name}` : 'Trust Points'}
        subtitle="Apply community bonus or penalty for rule adherence."
        maxWidth="md"
      >
        {selectedUser && (
          <form onSubmit={handleAdjustTrust} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between text-slate-700 font-medium">
              <span>Current Score:</span>
              <span className="font-bold text-slate-900">{selectedUser.trustScore} points</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Points Adjustment (+/-)
              </label>
              <input
                type="number"
                required
                value={trustDelta}
                onChange={(e) => setTrustDelta(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Use negative value (e.g. -15) for penalties.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Society Reason / Committee Note
              </label>
              <textarea
                rows={3}
                required
                value={trustReason}
                onChange={(e) => setTrustReason(e.target.value)}
                placeholder="e.g. Society cleanup drive coordinator bonus..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTrustAdjustModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
              >
                Apply Trust Modification
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 2: Admin Inspect Trust Transactions Ledger */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={selectedUser ? `Trust Transactions Ledger: ${selectedUser.name}` : 'Trust Ledger'}
        subtitle={`Audit all system-generated TrustTransaction records for ${selectedUser?.name || 'resident'}.`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
            <span className="font-semibold text-slate-700">Resident: <strong>{selectedUser?.name}</strong> ({selectedUser?.block} Apt {selectedUser?.apartmentNumber})</span>
            <span className="font-extrabold text-teal-800">⭐ {selectedUser?.trustScore} Trust Points</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            {loadingHistory ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading resident ledger...</div>
            ) : userTrustHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No transaction records found for this resident.</div>
            ) : (
              userTrustHistory.map((tx) => (
                <div key={tx.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">{tx.reason}</div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                      <span>{new Date(tx.timestamp).toLocaleString()}</span>
                      {tx.referenceType && (
                        <>
                          <span>•</span>
                          <span className="text-teal-700 font-bold">{tx.referenceType} #{tx.referenceId || ''}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.8 rounded-full text-xs font-bold ${
                    tx.points >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Close Ledger
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: View Resident Details Profile */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedUser ? `Resident Profile: ${selectedUser.name}` : 'Resident Profile'}
        subtitle="Detailed resident record and society membership status."
        maxWidth="md"
      >
        {selectedUser && (
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <img
                src={selectedUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={selectedUser.name}
                className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-indigo-500/20"
              />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                    {selectedUser.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    (selectedUser.active ?? true)
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(selectedUser.active ?? true) ? 'Active Account' : 'Deactivated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Flat Allocation</span>
                <span className="font-bold text-slate-900 block text-xs">{selectedUser.block} &bull; Apt {selectedUser.apartmentNumber}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Trust Rank</span>
                <span className="font-bold text-teal-700 block text-xs">⭐ {selectedUser.trustScore} Trust Points</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Email Address</span>
                <span className="font-medium text-slate-800 block text-xs truncate">{selectedUser.email}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Phone Number</span>
                <span className="font-medium text-slate-800 block text-xs">{selectedUser.phone || '+91 98765 43210'}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Verification Status</span>
                <span className={`font-bold block text-xs ${
                  selectedUser.verificationStatus === 'VERIFIED' ? 'text-emerald-700' : 'text-amber-700'
                }`}>{selectedUser.verificationStatus}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Joined Society</span>
                <span className="font-medium text-slate-700 block text-xs">{selectedUser.joinedDate || 'Jan 2024'}</span>
              </div>
            </div>

            {selectedUser.bio && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase mb-0.5">Bio / Notes</span>
                <p className="text-slate-600 leading-relaxed text-xs">{selectedUser.bio}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium">🔒 Security: Passwords are protected & encrypted</span>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


