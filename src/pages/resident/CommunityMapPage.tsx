import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  ShieldAlert, 
  Calendar, 
  Package, 
  Building, 
  X, 
  ExternalLink, 
  Compass, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MapContainer } from '../../components/map/MapContainer';
import { safetyService } from '../../services/safetyService';
import { eventsService } from '../../services/eventsService';
import { lendingService } from '../../services/lendingService';
import { SafetyReport, CommunityEvent, LendingItem } from '../../types';

interface SelectedMapEntity {
  type: 'SAFETY' | 'EVENT' | 'ITEM' | 'AMENITY';
  title: string;
  subtitle: string;
  description: string;
  latitude: number;
  longitude: number;
  statusBadge?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export const CommunityMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [items, setItems] = useState<LendingItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SAFETY' | 'ITEMS' | 'EVENTS'>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<SelectedMapEntity | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reports, loadedEvents, loadedItems] = await Promise.all([
          safetyService.getReports(),
          eventsService.getEvents(),
          lendingService.getItems(),
        ]);
        setSafetyReports(reports);
        setEvents(loadedEvents);
        setItems(loadedItems);

        // Default selection for bottom sheet preview
        if (reports.length > 0) {
          const first = reports[0];
          setSelectedEntity({
            type: 'SAFETY',
            title: first.title,
            subtitle: `${first.location} · Oakridge Heights`,
            description: first.description,
            latitude: first.latitude,
            longitude: first.longitude,
            statusBadge: first.status.replace('_', ' '),
            actionUrl: '/safety-watch',
            actionLabel: 'View in Safety Watch',
          });
        }
      } catch (err) {
        console.error('Failed to load map data', err);
      }
    };
    loadData();
  }, []);

  const handleFilterSelect = (filter: 'ALL' | 'SAFETY' | 'ITEMS' | 'EVENTS') => {
    setActiveFilter(filter);
    if (filter === 'SAFETY' && safetyReports.length > 0) {
      const s = safetyReports[0];
      setSelectedEntity({
        type: 'SAFETY',
        title: s.title,
        subtitle: s.location,
        description: s.description,
        latitude: s.latitude,
        longitude: s.longitude,
        statusBadge: s.status,
        actionUrl: '/safety-watch',
        actionLabel: 'View Safety Details',
      });
    } else if (filter === 'EVENTS' && events.length > 0) {
      const e = events[0];
      setSelectedEntity({
        type: 'EVENT',
        title: e.title,
        subtitle: `${e.eventDate} · ${e.startTime} - ${e.endTime} · ${e.location}`,
        description: e.description,
        latitude: e.latitude,
        longitude: e.longitude,
        statusBadge: `${e.participantsCount} Neighbors Joining`,
        actionUrl: '/events',
        actionLabel: 'Join Event',
      });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem-4rem)] sm:h-[calc(100vh-4rem)] flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Header Filter Bar */}
      <header className="shrink-0 bg-white border-b border-slate-200 p-2.5 sm:p-3 flex items-center justify-between gap-2 z-30 shadow-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Oakridge Campus Map
          </h1>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => handleFilterSelect('ALL')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Campus
          </button>
          <button
            type="button"
            onClick={() => handleFilterSelect('SAFETY')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              activeFilter === 'SAFETY'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>⚠️ Safety ({safetyReports.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterSelect('ITEMS')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              activeFilter === 'ITEMS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>📦 Borrow ({items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterSelect('EVENTS')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              activeFilter === 'EVENTS'
                ? 'bg-fuchsia-600 text-white shadow-xs'
                : 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 hover:bg-fuchsia-100'
            }`}
          >
            <span>🎉 Events ({events.length})</span>
          </button>
        </div>
      </header>

      {/* Full-Screen Leaflet Map */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <MapContainer
          safetyReports={activeFilter === 'ITEMS' || activeFilter === 'EVENTS' ? [] : safetyReports}
          events={activeFilter === 'ITEMS' || activeFilter === 'SAFETY' ? [] : events}
          items={activeFilter === 'SAFETY' || activeFilter === 'EVENTS' ? [] : items}
          selectedLocation={
            selectedEntity
              ? {
                  latitude: selectedEntity.latitude,
                  longitude: selectedEntity.longitude,
                  title: selectedEntity.title,
                }
              : null
          }
          onSelectEntity={setSelectedEntity}
          showLandmarksBar={true}
          height="100%"
        />
      </div>

      {/* Mobile-App Bottom Sheet */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-2.5 animate-slideUp">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.8 rounded-full ${
                selectedEntity.type === 'SAFETY'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : selectedEntity.type === 'EVENT'
                  ? 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200'
                  : selectedEntity.type === 'ITEM'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-sky-100 text-sky-800 border border-sky-200'
              }`}>
                {selectedEntity.statusBadge || selectedEntity.type}
              </span>
              <span className="text-[11px] text-indigo-700 font-semibold">Oakridge Campus Landmark</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedEntity(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {selectedEntity.title}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {selectedEntity.subtitle}
            </p>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {selectedEntity.description}
          </p>

          <div className="flex items-center space-x-2 pt-1">
            {selectedEntity.actionUrl && (
              <button
                type="button"
                onClick={() => navigate(selectedEntity.actionUrl!)}
                className="flex-1 py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <span>{selectedEntity.actionLabel || 'View Details'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedEntity(null)}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
