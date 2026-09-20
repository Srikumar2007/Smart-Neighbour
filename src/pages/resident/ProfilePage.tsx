import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  ShieldCheck, 
  Award, 
  Edit3, 
  Save, 
  Calendar,
  CheckCircle2,
  Package,
  Wrench,
  AlertTriangle,
  ChevronRight,
  Settings,
  LogOut,
  Sparkles,
  History
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { Modal } from '../../components/common/Modal';
import { userService } from '../../services/userService';

export const ProfilePage: React.FC = () => {
  const { user, updateCurrentUser, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [bio, setBio] = useState(user?.bio || 'Lover of gardening and community sports.');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userService.updateProfile({
        phone,
      });
      updateCurrentUser({ phone, bio });
      setIsEditModalOpen(false);
      showToast('Profile Updated', 'Your contact details and bio have been updated.', 'success');
    } catch {
      showToast('Update Notice', 'Profile saved locally.', 'info');
      updateCurrentUser({ phone, bio });
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    showToast('Logged Out', 'You have been safely signed out.', 'info');
  };

  return (
    <div className="max-w-xl mx-auto px-3.5 sm:px-4 pt-3 pb-12 space-y-4">
      {/* 1. Profile Header with Large Avatar */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-violet-200/80 p-5 shadow-sm text-center flex flex-col items-center relative">
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-violet-700 rounded-full hover:bg-violet-50 transition-colors cursor-pointer"
          title="Edit Profile"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Large Avatar */}
        <div className="relative">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-violet-400/40 shadow-sm"
          />
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-violet-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
            ✓
          </span>
        </div>

        {/* Name & Apartment */}
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-3">
          {user.name}
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Apartment {user.apartmentNumber} · {user.block} · Oakridge Heights
        </p>

        {/* Trust Points & Reputation Badge */}
        <div 
          onClick={() => navigate('/trust-points')}
          className="mt-3.5 inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 text-white px-4 py-1.5 rounded-full cursor-pointer hover:shadow-xs transition-all active:scale-98 shadow-xs"
        >
          <span className="text-amber-300 text-xs">⭐</span>
          <span className="text-xs font-bold">{user.trustScore || 88} Trust Points</span>
          <span className="text-white/60">·</span>
          <span className="text-[11px] text-violet-100 font-bold">Pillar of Community</span>
          <ChevronRight className="w-3.5 h-3.5 text-violet-200 ml-0.5" />
        </div>

        {user.bio && (
          <p className="text-xs text-slate-600 mt-3 max-w-sm italic">
            "{user.bio}"
          </p>
        )}
      </div>

      {/* 2. Compact Consumer App Stats Grid */}
      <div className="grid grid-cols-4 gap-2 bg-white/95 backdrop-blur-xs rounded-2xl border border-violet-200/80 p-2.5 shadow-2xs text-center">
        <div className="p-2 rounded-xl bg-violet-50/70 border border-violet-100/60">
          <div className="text-base sm:text-lg font-extrabold text-violet-800">12</div>
          <div className="text-[10px] text-violet-700 font-bold leading-tight mt-0.5">Items Lent</div>
        </div>
        <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-100/60">
          <div className="text-base sm:text-lg font-extrabold text-indigo-800">8</div>
          <div className="text-[10px] text-indigo-700 font-bold leading-tight mt-0.5">Borrowed</div>
        </div>
        <div className="p-2 rounded-xl bg-fuchsia-50/70 border border-fuchsia-100/60">
          <div className="text-base sm:text-lg font-extrabold text-fuchsia-800">4</div>
          <div className="text-[10px] text-fuchsia-700 font-bold leading-tight mt-0.5">Events</div>
        </div>
        <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-100/60">
          <div className="text-base sm:text-lg font-extrabold text-teal-800">3</div>
          <div className="text-[10px] text-teal-700 font-bold leading-tight mt-0.5">Reports</div>
        </div>
      </div>

      {/* 3. Verified Contact Information Section */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-violet-200/80 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
          Verified Details
        </h2>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-violet-600" />
              <span>Registered Email</span>
            </div>
            <span className="font-semibold text-slate-900">{user.email}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-violet-600" />
              <span>Contact Phone</span>
            </div>
            <span className="font-semibold text-slate-900">{user.phone}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2.5 text-slate-600">
              <Building className="w-4 h-4 text-violet-600" />
              <span>Apartment Unit</span>
            </div>
            <span className="font-semibold text-slate-900">
              {user.block} - #{user.apartmentNumber}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2.5 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <span>Society Status</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-900 border border-violet-200">
              ✓ Verified Resident
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2.5 text-slate-600">
              <Calendar className="w-4 h-4 text-violet-600" />
              <span>Member Since</span>
            </div>
            <span className="font-semibold text-slate-900">
              {new Date(user.joinedDate).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Resident Quick Navigation Actions */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-violet-200/80 p-2 shadow-2xs divide-y divide-slate-100 text-xs">
        <button
          type="button"
          onClick={() => navigate('/share-borrow?tab=my_items')}
          className="w-full flex items-center justify-between p-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center space-x-2.5">
            <Package className="w-4 h-4 text-violet-600" />
            <span className="font-semibold text-slate-800">My Listed Items</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/trust-points')}
          className="w-full flex items-center justify-between p-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center space-x-2.5">
            <History className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">Trust Points History</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/community')}
          className="w-full flex items-center justify-between p-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-fuchsia-600" />
            <span className="font-semibold text-slate-800">Community Activity</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 5. Sign Out Button */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 p-3 bg-white/90 hover:bg-rose-50 border border-rose-200 text-rose-600 font-semibold rounded-2xl transition-colors shadow-2xs cursor-pointer text-xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out from Smart Neighbour</span>
      </button>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Resident Profile"
        subtitle="Keep your verified contact details up to date"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Community Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell neighbours about your hobbies or what you're happy to help with!"
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-violet-700 hover:bg-violet-800 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
