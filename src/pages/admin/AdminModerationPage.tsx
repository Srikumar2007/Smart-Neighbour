import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Megaphone, 
  Plus, 
  Bell, 
  Wrench, 
  Building2, 
  Calendar, 
  Trash2,
  AlertTriangle,
  Info 
} from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { Modal } from '../../components/common/Modal';
import { communityService } from '../../services/communityService';
import { SocietyAnnouncement } from '../../types';

export const AdminModerationPage: React.FC = () => {
  const { showToast } = useNotification();

  const [announcements, setAnnouncements] = useState<SocietyAnnouncement[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'SOCIETY' | 'MAINTENANCE' | 'COMMUNITY'>('SOCIETY');
  const [message, setMessage] = useState('');
  const [affectedBlocks, setAffectedBlocks] = useState('All Blocks');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [guidelines, setGuidelines] = useState([
    { id: '1', title: 'Noise Curfew (10:00 PM - 07:00 AM)', active: true, desc: 'High-volume sound systems and drilling restricted in residential blocks.' },
    { id: '2', title: 'Visitor Parking Allocation in Basement 1', active: true, desc: 'Visitor vehicles must register at Gate 1 and display visitor slip.' },
    { id: '3', title: 'Power Tool Safety Protocol', active: true, desc: 'Shared circular saws and grinders must include original blade guard.' },
    { id: '4', title: 'Pet Leash in Central Park Lawn', active: true, desc: 'Pets must be leashed in children play zones.' },
  ]);

  const loadAnnouncements = async () => {
    try {
      const list = await communityService.getAnnouncements();
      setAnnouncements(list);
    } catch {
      showToast('Error', 'Failed to load announcements', 'error');
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const toggleGuideline = (id: string) => {
    setGuidelines((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g))
    );
    showToast('Guideline Updated', 'Community policy active state updated', 'info');
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Validation Error', 'Please enter title and notice content', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await communityService.createAnnouncement({
        title,
        message,
        category: category as any,
        effectiveDate,
        affectedBlocks,
        isUrgent,
      });

      showToast(
        'Announcement Broadcasted 📢',
        `Published ${category.toLowerCase()} notice to residents`,
        'success'
      );
      setIsCreateModalOpen(false);
      setTitle('');
      setMessage('');
      setIsUrgent(false);
      loadAnnouncements();
    } catch {
      showToast('Error', 'Failed to broadcast announcement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Announcements & Governance Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Broadcast official society announcements, maintenance notices, and community updates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Broadcasted Announcements List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <span>Active Society Notices & Broadcasts</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {announcements.length} Published
              </span>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No active announcements broadcasted yet. Click "New Announcement" above to publish one.
                </div>
              ) : (
                announcements.map((a) => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      a.isUrgent 
                        ? 'bg-rose-50/60 border-rose-200' 
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            a.category === 'MAINTENANCE'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : a.category === 'SECURITY' || a.category === 'SOCIETY'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {a.category} NOTICE
                          </span>
                          {a.isUrgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                              URGENT
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Effective: {a.effectiveDate}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.message}</p>
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-3">
                          <span>Issued by: {a.issuedBy}</span>
                          <span>&bull;</span>
                          <span>Affected: {a.affectedBlocks}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Guidelines / Bylaws section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Active Society Bylaws & Standards
            </h3>

            <div className="space-y-3">
              {guidelines.map((g) => (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{g.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        g.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {g.active ? 'Active Rule' : 'Suspended'}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1 leading-relaxed">
                      {g.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleGuideline(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
                      g.active
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {g.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Admin Info Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Announcement Categories</span>
            </h4>
            <div className="space-y-2 text-slate-600">
              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-0.5">🏛️ Society Announcements</span>
                Official AGM notices, committee updates, rules, and general governance communications.
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="font-bold text-amber-900 block mb-0.5">🛠️ Maintenance Notices</span>
                Water shutdowns, elevator servicing schedules, DG power backup testing, and civil repairs.
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-0.5">🌳 Community Notices</span>
                Festivals, sports tournaments, park drives, blood donation, and resident meetups.
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-2xl p-5 text-xs text-indigo-900 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold">
              <Info className="w-4 h-4 text-indigo-700" />
              <span>Spring Security Authorization</span>
            </div>
            <p className="leading-relaxed text-indigo-800/80">
              All announcement endpoints (<code>POST /api/announcements</code>) require <code>ROLE_ADMIN</code> authentication. Non-admin resident users attempting direct request access receive HTTP 403 Forbidden.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Create Announcement */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Broadcast Society Announcement"
        subtitle="Create an official notice for all housing society residents."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Announcement Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('SOCIETY')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  category === 'SOCIETY'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Society
              </button>
              <button
                type="button"
                onClick={() => setCategory('MAINTENANCE')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  category === 'MAINTENANCE'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Maintenance
              </button>
              <button
                type="button"
                onClick={() => setCategory('COMMUNITY')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  category === 'COMMUNITY'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Community
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual General Body Meeting or Overhead Tank Cleaning"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Notice Content & Instructions *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the full announcement details for residents..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Affected Blocks
              </label>
              <input
                type="text"
                value={affectedBlocks}
                onChange={(e) => setAffectedBlocks(e.target.value)}
                placeholder="e.g. All Blocks or Block A & B"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isUrgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="isUrgent" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Mark as High Priority / Urgent Notice 🚨
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Publishing...' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
