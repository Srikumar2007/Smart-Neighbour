import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Users, 
  MapPin, 
  Clock, 
  Sparkles,
  Check,
  Edit3,
  Trash2,
  Award,
  Filter,
  X,
  Share2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { EventCard, getCategoryConfig } from '../../components/events/EventCard';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { MapContainer } from '../../components/map/MapContainer';
import { eventsService, CreateEventPayload, UpdateEventPayload } from '../../services/eventsService';
import { aiService } from '../../services/aiService';
import { CommunityEvent, EventCategory, EventStatus } from '../../types';

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingAiDesc, setIsGeneratingAiDesc] = useState(false);

  const handleGenerateAiDescription = async () => {
    if (!formData.title.trim()) {
      showToast('AI Assistant', 'Please enter an event title first', 'info');
      return;
    }

    setIsGeneratingAiDesc(true);
    try {
      const res = await aiService.generateEventDescription(formData.title, formData.category, formData.description);
      setFormData((prev) => ({ ...prev, description: res.generatedDescription }));
      showToast('Description Generated ✨', 'AI wrote a community-friendly announcement draft. You can review and edit it.', 'success');
    } catch {
      showToast('Error', 'Failed to generate event description', 'error');
    } finally {
      setIsGeneratingAiDesc(false);
    }
  };

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'CANCELLED'>('UPCOMING');

  // Form State
  const [formData, setFormData] = useState<CreateEventPayload>({
    title: '',
    description: '',
    category: 'CLEANUP',
    eventDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    location: 'Community Club House Main Hall',
    latitude: 11.9340,
    longitude: 79.8320,
    imageUrl: '',
  });

  const [editFormData, setEditFormData] = useState<UpdateEventPayload>({});

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsService.getEvents();
      setEvents(data);
    } catch {
      showToast('Error', 'Failed to load community events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !user) {
      showToast('Validation Error', 'Please fill in all required event details', 'warning');
      return;
    }

    try {
      await eventsService.createEvent(formData, user);
      showToast('Event Published!', 'Your community activity has been published. 20 Trust Points awarded!', 'success');
      setIsCreateModalOpen(false);
      resetForm();
      loadEvents();
    } catch {
      showToast('Error', 'Failed to publish event', 'error');
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      await eventsService.updateEvent(selectedEvent.id, editFormData);
      showToast('Event Updated', 'Participants have been notified of your changes.', 'success');
      setIsEditModalOpen(false);
      setSelectedEvent(null);
      loadEvents();
    } catch {
      showToast('Error', 'Failed to update event', 'error');
    }
  };

  const handleCancelEvent = async (event: CommunityEvent) => {
    if (!window.confirm(`Are you sure you want to cancel '${event.title}'? All registered participants will be notified.`)) {
      return;
    }

    try {
      await eventsService.deleteEvent(event.id);
      showToast('Event Cancelled', 'Event has been cancelled and participants were notified.', 'info');
      loadEvents();
      if (selectedEvent?.id === event.id) {
        setIsDetailModalOpen(false);
      }
    } catch {
      showToast('Error', 'Failed to cancel event', 'error');
    }
  };

  const handleToggleJoin = async (eventId: string) => {
    try {
      const updated = await eventsService.toggleJoinEvent(eventId);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(updated);
      }
      showToast(
        updated.isJoinedByMe ? 'Joined Event! 🎉' : 'Left Event',
        updated.isJoinedByMe ? 'You joined the activity! Organizer was notified and +5 Trust Points recorded.' : 'You have been removed from the participant list.',
        updated.isJoinedByMe ? 'success' : 'info'
      );
    } catch {
      showToast('Error', 'Could not update RSVP status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'CLEANUP',
      eventDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      location: 'Community Club House Main Hall',
      latitude: 11.9340,
      longitude: 79.8320,
      imageUrl: '',
    });
  };

  const categories = [
    { label: 'All Activities', value: 'ALL', emoji: '🌟' },
    { label: 'Cleanup Drives', value: 'CLEANUP', emoji: '🧹' },
    { label: 'Tree Planting', value: 'TREE_PLANTING', emoji: '🌿' },
    { label: 'Sports & Fitness', value: 'SPORTS', emoji: '⚽' },
    { label: 'Community Meetings', value: 'MEETING', emoji: '🏛️' },
    { label: 'Festival Activities', value: 'FESTIVAL', emoji: '🎉' },
    { label: 'Blood Donation', value: 'BLOOD_DONATION', emoji: '🩸' },
    { label: 'Kids Activities', value: 'KIDS', emoji: '🎨' },
    { label: 'Maintenance', value: 'MAINTENANCE', emoji: '🛠️' },
    { label: 'Other Activities', value: 'OTHER', emoji: '🎈' },
  ];

  const filteredEvents = events.filter((e) => {
    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'UPCOMING' && e.status !== 'CANCELLED') ||
      (statusFilter === 'CANCELLED' && e.status === 'CANCELLED');

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.organizerName.toLowerCase().includes(q);

    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-teal-100 mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Apartment Society & Community Events</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Organize & Join Community Activities
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl leading-relaxed">
              Connect with your neighbors for beach cleanups, sports matches, festive celebrations, tree planting, and blood donation drives.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-teal-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-teal-950" />
            <span>Host Community Event</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Chips Scrollable */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, organizer..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Sub-bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing {filteredEvents.length} community activities</span>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-medium text-slate-400">Filter status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('UPCOMING')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'UPCOMING' ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Upcoming / Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Events
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white h-72 rounded-2xl border border-slate-200 animate-pulse p-4 flex flex-col justify-between">
              <div className="bg-slate-200 h-36 rounded-xl" />
              <div className="space-y-2 pt-3">
                <div className="bg-slate-200 h-4 w-3/4 rounded-md" />
                <div className="bg-slate-200 h-3 w-1/2 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No events found"
          description="There are no community activities matching your search filters. Host a new activity for your neighbors!"
          actionLabel="Host Community Event"
          onAction={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUserId={user?.id}
              onToggleJoin={handleToggleJoin}
              onViewDetails={(evt) => {
                setSelectedEvent(evt);
                setIsDetailModalOpen(true);
              }}
              onEdit={(evt) => {
                setSelectedEvent(evt);
                setEditFormData({
                  title: evt.title,
                  description: evt.description,
                  category: evt.category,
                  eventDate: evt.eventDate,
                  startTime: evt.startTime,
                  endTime: evt.endTime,
                  location: evt.location,
                  latitude: evt.latitude,
                  longitude: evt.longitude,
                  imageUrl: evt.imageUrl,
                });
                setIsEditModalOpen(true);
              }}
              onCancel={handleCancelEvent}
              onViewOnMap={() => navigate('/community-map')}
            />
          ))}
        </div>
      )}

      {/* MODAL 1: EVENT DETAIL MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedEvent?.title || 'Community Event Details'}
        subtitle={`Organized by ${selectedEvent?.organizerName} (${selectedEvent?.organizerApartment || 'Resident'})`}
        maxWidth="lg"
      >
        {selectedEvent && (
          <div className="space-y-5">
            {/* Image Banner */}
            <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-slate-900">
              {selectedEvent.imageUrl ? (
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-teal-200 bg-gradient-to-tr from-teal-900 to-emerald-700">
                  <span className="text-5xl mb-2">{getCategoryConfig(selectedEvent.category).emoji}</span>
                  <span className="text-xs font-bold uppercase">{getCategoryConfig(selectedEvent.category).label}</span>
                </div>
              )}

              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getCategoryConfig(selectedEvent.category).color}`}>
                  <span>{getCategoryConfig(selectedEvent.category).emoji}</span>
                  <span>{getCategoryConfig(selectedEvent.category).label}</span>
                </span>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Date</span>
                <span className="font-bold text-slate-800 flex items-center mt-0.5">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  {selectedEvent.eventDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Time</span>
                <span className="font-bold text-slate-800 flex items-center mt-0.5">
                  <Clock className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Location</span>
                <span className="font-bold text-slate-800 flex items-center mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500 shrink-0" />
                  {selectedEvent.location}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">About this Event</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200">
                {selectedEvent.description}
              </p>
            </div>

            {/* Participants Section with Requirement: "12 neighbors are joining" */}
            <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                    Registered Participants
                  </h4>
                  {/* Dynamic requirement string */}
                  <p className="text-sm font-extrabold text-teal-900 mt-0.5">
                    {selectedEvent.participantsCount === 1 ? '1 neighbor is joining' : `${selectedEvent.participantsCount} neighbors are joining`}
                  </p>
                </div>

                <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+5 Trust Points</span>
                </span>
              </div>

              {/* Participant Avatars & Name Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {(selectedEvent.participants || []).map((p, idx) => (
                  <div key={p.userId || idx} className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-teal-200 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[9px] flex items-center justify-center uppercase">
                      {p.profileImage ? (
                        <img src={p.profileImage} alt={p.userName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        p.userName.slice(0, 2)
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{p.userName}</span>
                    {p.apartmentNumber && (
                      <span className="text-[10px] font-medium text-slate-400">({p.apartmentNumber})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  navigate('/community-map');
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>View on Community Map</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                {selectedEvent.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => handleToggleJoin(selectedEvent.id)}
                    className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs cursor-pointer ${
                      selectedEvent.isJoinedByMe
                        ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {selectedEvent.isJoinedByMe ? 'Leave Event' : 'Join Event'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: CREATE EVENT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Host Community Activity"
        subtitle="Organize cleanup drives, sports, festive events, tree planting, or meetings for your apartment society."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Promenade Beach Cleanliness & Coastal Drive"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
              >
                <option value="CLEANUP">🧹 Cleanup Drive</option>
                <option value="TREE_PLANTING">🌿 Tree Planting</option>
                <option value="SPORTS">⚽ Sports & Fitness</option>
                <option value="MEETING">🏛️ Community Meeting</option>
                <option value="FESTIVAL">🎉 Festival Activity</option>
                <option value="BLOOD_DONATION">🩸 Blood Donation</option>
                <option value="KIDS">🎨 Kids Activity</option>
                <option value="MAINTENANCE">🛠️ Maintenance Awareness</option>
                <option value="OTHER">🎈 Other Activity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Location / Venue *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Central Lawn / Clubhouse Multipurpose Hall"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Interactive Map Picker Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Map Coordinates (Latitude & Longitude)
              </label>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{showMapPicker ? 'Hide Map Picker' : 'Pick on Map'}</span>
              </button>
            </div>

            {showMapPicker && (
              <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-200 my-2">
                <MapContainer
                  isPickerMode={true}
                  pickerLocation={{ latitude: formData.latitude || 11.9340, longitude: formData.longitude || 79.8320 }}
                  onLocationPick={(lat, lng) => {
                    setFormData({ ...formData, latitude: lat, longitude: lng });
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 11.9340 })}
                placeholder="Latitude (11.9340)"
                className="px-3 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 79.8320 })}
                placeholder="Longitude (79.8320)"
                className="px-3 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Description & Instructions *
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAiDesc}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-lg border border-indigo-200 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isGeneratingAiDesc ? 'Generating...' : 'Help me write this announcement ✨'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about what attendees should bring, instructions, schedule..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Optional Image Banner URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs cursor-pointer"
            >
              Publish Event
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: EDIT EVENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Community Event"
        subtitle="Update event details. Registered participants will receive an automatic notification."
        maxWidth="lg"
      >
        <form onSubmit={handleEditEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={editFormData.title || ''}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={editFormData.category || 'CLEANUP'}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as EventCategory })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200"
              >
                <option value="CLEANUP">🧹 Cleanup Drive</option>
                <option value="TREE_PLANTING">🌿 Tree Planting</option>
                <option value="SPORTS">⚽ Sports & Fitness</option>
                <option value="MEETING">🏛️ Community Meeting</option>
                <option value="FESTIVAL">🎉 Festival Activity</option>
                <option value="BLOOD_DONATION">🩸 Blood Donation</option>
                <option value="KIDS">🎨 Kids Activity</option>
                <option value="MAINTENANCE">🛠️ Maintenance Awareness</option>
                <option value="OTHER">🎈 Other Activity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Date</label>
              <input
                type="date"
                value={editFormData.eventDate || ''}
                onChange={(e) => setEditFormData({ ...editFormData, eventDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={editFormData.startTime || ''}
                onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={editFormData.endTime || ''}
                onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={editFormData.location || ''}
              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
