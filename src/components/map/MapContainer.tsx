import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ShieldAlert, 
  Calendar, 
  Layers, 
  RotateCcw,
  MapPin,
  Package,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { SafetyReport, CommunityEvent, LendingItem } from '../../types';

export interface MapContainerProps {
  safetyReports?: SafetyReport[];
  events?: CommunityEvent[];
  items?: LendingItem[];
  selectedLocation?: { latitude: number; longitude: number; title: string } | null;
  onSelectEntity?: (entity: {
    type: 'SAFETY' | 'EVENT' | 'ITEM' | 'AMENITY';
    title: string;
    subtitle: string;
    description: string;
    latitude: number;
    longitude: number;
    statusBadge?: string;
    actionUrl?: string;
    actionLabel?: string;
  }) => void;
  height?: string;
  className?: string;
  isPickerMode?: boolean;
  pickerLocation?: { latitude: number; longitude: number } | null;
  onLocationPick?: (lat: number, lng: number) => void;
  showLandmarksBar?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  safetyReports = [],
  events = [],
  items = [],
  selectedLocation,
  onSelectEntity,
  height = '100%',
  className = '',
  isPickerMode = false,
  pickerLocation,
  onLocationPick,
  showLandmarksBar = false,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const zonesLayer = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SAFETY' | 'ITEMS' | 'EVENTS' | 'AMENITIES'>('ALL');
  const [mapStyle, setMapStyle] = useState<'OSM' | 'VOYAGER'>('OSM');

  // Pondicherry (Puducherry) Coastal Heritage Township Center Coordinates
  const SOCIETY_CENTER: [number, number] = [11.9340, 79.8320];

  // Campus Boundary Coordinates (Pondicherry Heritage Community Perimeter)
  const SOCIETY_BOUNDARY: [number, number][] = [
    [11.9315, 79.8290],
    [11.9365, 79.8292],
    [11.9370, 79.8355],
    [11.9318, 79.8352],
  ];

  // Static society landmarks with coordinates and colorful pastel styles in Pondicherry
  const AMENITIES = [
    { 
      id: 'clubhouse',
      title: 'Pondicherry French Villa Clubhouse & Library', 
      lat: 11.9340, 
      lng: 79.8320, 
      type: 'Recreation',
      color: '#8b5cf6',
      bgTint: 'rgba(139, 92, 246, 0.25)',
      emoji: '🏛️',
      desc: 'Heritage Franco-Tamil community hall, reading library, and sea-breeze terrace.'
    },
    { 
      id: 'pool',
      title: 'Promenade Seaside Pool & Deck', 
      lat: 11.9335, 
      lng: 79.8340, 
      type: 'Wellness',
      color: '#0284c7',
      bgTint: 'rgba(56, 189, 248, 0.25)',
      emoji: '🏊',
      desc: 'Freshwater swimming pool facing the Bay of Bengal coastline with lounge deck.'
    },
    { 
      id: 'central_park',
      title: 'Auroville Botanical & Herbal Garden Lawn', 
      lat: 11.9348, 
      lng: 79.8315, 
      type: 'Park',
      color: '#059669',
      bgTint: 'rgba(52, 211, 153, 0.25)',
      emoji: '🌳',
      desc: 'Bougainvillea pathways, yoga pavilion, and organic resident kitchen garden.'
    },
    { 
      id: 'tennis',
      title: 'Goubert Avenue Multi-Sport & Badminton Court', 
      lat: 11.9355, 
      lng: 79.8308, 
      type: 'Sports',
      color: '#ea580c',
      bgTint: 'rgba(251, 146, 60, 0.25)',
      emoji: '🏸',
      desc: 'Floodlit acrylic court for morning badminton, tennis, and volleyball.'
    },
    { 
      id: 'ev_station',
      title: 'Solar & Electric Vehicle Charging Hub', 
      lat: 11.9322, 
      lng: 79.8310, 
      type: 'Facility',
      color: '#0d9488',
      bgTint: 'rgba(45, 212, 191, 0.25)',
      emoji: '⚡',
      desc: 'Solar rooftop battery storage with 4 EV fast-charging bays.'
    },
    { 
      id: 'gate1',
      title: 'Main Promenade Gate (Rue Suffren Checkpoint)', 
      lat: 11.9320, 
      lng: 79.8295, 
      type: 'Security',
      color: '#e11d48',
      bgTint: 'rgba(244, 63, 94, 0.25)',
      emoji: '🛡️',
      desc: '24/7 security watch, RFID entry barrier, and visitor verification desk.'
    },
    { 
      id: 'block_a',
      title: 'Block A: Dumas Heritage Villa (Flats 101-504)', 
      lat: 11.9342, 
      lng: 79.8332, 
      type: 'Residence',
      color: '#6366f1',
      bgTint: 'rgba(99, 102, 241, 0.25)',
      emoji: '🏢',
      desc: 'Sea-facing residential block with terrace solar panels and intercom.'
    },
    { 
      id: 'block_b',
      title: 'Block B: Romain Rolland Wing (Flats 101-508)', 
      lat: 11.9350, 
      lng: 79.8325, 
      type: 'Residence',
      color: '#06b6d4',
      bgTint: 'rgba(6, 182, 212, 0.25)',
      emoji: '🏢',
      desc: 'Central courtyard apartments with rainwater harvesting and recycling chute.'
    },
    { 
      id: 'block_c',
      title: 'Block C: La Bourdonnais Residences', 
      lat: 11.9332, 
      lng: 79.8305, 
      type: 'Residence',
      color: '#f59e0b',
      bgTint: 'rgba(245, 158, 11, 0.25)',
      emoji: '🏢',
      desc: 'Garden-side residence tower with rooftop stargazing lounge.'
    }
  ];

  // Helper to create modern colorful drop pins with light tints and emoji or badges
  const createPinIcon = (
    color: string, 
    symbol: string, 
    options?: { isCritical?: boolean; isSelected?: boolean }
  ) => {
    const pulseHtml = options?.isCritical 
      ? `<span style="
          position: absolute;
          width: 44px;
          height: 44px;
          top: -6px;
          left: -6px;
          border-radius: 50%;
          background: ${color}40;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></span>` 
      : '';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px;">
          ${pulseHtml}
          <div style="
            background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.22), 0 0 0 2.5px #ffffff;
            transition: transform 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              color: #ffffff;
              font-weight: 700;
              font-size: 13px;
              line-height: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            ">${symbol}</span>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletInstance.current) return;

    const map = L.map(mapRef.current, {
      center: SOCIETY_CENTER,
      zoom: 17,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    // Custom Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default: OpenStreetMap Tile Layer
    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileLayer = L.tileLayer(osmUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    zonesLayer.current = L.layerGroup().addTo(map);
    markersLayer.current = L.layerGroup().addTo(map);
    leafletInstance.current = map;

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      leafletInstance.current = null;
    };
  }, []);

  // Handle Map Style Switcher (Pastel Voyager vs OpenStreetMap)
  const toggleMapStyle = () => {
    if (!leafletInstance.current || !tileLayerRef.current) return;

    leafletInstance.current.removeLayer(tileLayerRef.current);

    const nextStyle = mapStyle === 'VOYAGER' ? 'OSM' : 'VOYAGER';
    setMapStyle(nextStyle);

    const newUrl = nextStyle === 'VOYAGER'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTile = L.tileLayer(newUrl, {
      maxZoom: 19,
      attribution: nextStyle === 'VOYAGER'
        ? '&copy; <a href="https://carto.com/">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(leafletInstance.current);

    tileLayerRef.current = newTile;
  };

  // Render Campus Zones and Perimeter
  useEffect(() => {
    if (!leafletInstance.current || !zonesLayer.current) return;
    zonesLayer.current.clearLayers();

    // 1. Oakridge Heights Society Boundary (Light Pastel Mint Polygon with dashed border)
    const boundaryPolygon = L.polygon(SOCIETY_BOUNDARY, {
      color: '#10b981',
      weight: 2.5,
      dashArray: '6, 6',
      fillColor: '#34d399',
      fillOpacity: 0.08,
    });
    boundaryPolygon.bindTooltip('Oakridge Heights Society Campus', { sticky: true, className: 'campus-tooltip' });
    zonesLayer.current.addLayer(boundaryPolygon);

    // 2. Colored Amenity Zones (Pool, Park, Courts, EV)
    const amenityCircles = [
      { lat: 12.9344, lng: 77.6102, radius: 28, color: '#0284c7', fill: '#38bdf8', label: 'Pool Zone' },
      { lat: 12.9352, lng: 77.6109, radius: 36, color: '#059669', fill: '#4ade80', label: 'Central Green Lawn' },
      { lat: 12.9356, lng: 77.6104, radius: 24, color: '#ea580c', fill: '#fb923c', label: 'Court Zone' },
      { lat: 12.9339, lng: 77.6111, radius: 18, color: '#0d9488', fill: '#2dd4bf', label: 'EV Station Hub' },
    ];

    amenityCircles.forEach(circle => {
      const c = L.circle([circle.lat, circle.lng], {
        radius: circle.radius,
        color: circle.color,
        weight: 1.5,
        fillColor: circle.fill,
        fillOpacity: 0.16,
      });
      zonesLayer.current!.addLayer(c);
    });
  }, []);

  // Update Markers when Filter or Data changes
  useEffect(() => {
    if (!leafletInstance.current || !markersLayer.current) return;
    markersLayer.current.clearLayers();

    // 1. Safety Hazards & Maintenance Markers
    if (activeFilter === 'ALL' || activeFilter === 'SAFETY') {
      safetyReports.forEach((rep) => {
        const isCritical = rep.severity === 'HIGH';
        let color = '#0284c7';
        let symbol = '⚠️';

        switch (rep.category) {
          case 'SECURITY':
            color = '#6366f1';
            symbol = '🛡️';
            break;
          case 'INFRASTRUCTURE':
            color = '#ea580c';
            symbol = '🏗️';
            break;
          case 'LIGHTING':
            color = '#eab308';
            symbol = '💡';
            break;
          case 'MAINTENANCE':
            color = '#06b6d4';
            symbol = '🔧';
            break;
          case 'WATER':
            color = '#0284c7';
            symbol = '💧';
            break;
          default:
            color = '#e11d48';
            symbol = '⚠️';
            break;
        }

        if (isCritical) {
          color = '#e11d48';
        }

        const icon = createPinIcon(color, symbol, { isCritical });

        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                ${rep.category.replace('_', ' ')}
              </span>
              <span style="font-size: 10px; font-weight: 600; color: ${rep.status === 'RESOLVED' ? '#10b981' : '#f59e0b'};">
                ${rep.status.replace('_', ' ')}
              </span>
            </div>
            <h4 style="margin: 4px 0 2px; font-size: 13px; font-weight: 700; color: #0f172a;">${rep.title}</h4>
            <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">📍 ${rep.location}</p>
            <p style="margin: 0 0 8px; font-size: 11px; color: #334155; line-height: 1.4;">${rep.description}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 6px;">
              <span style="font-size: 11px; color: #64748b;">👍 ${rep.upvotes || 0} Corroborated</span>
              <a href="/safety-watch" style="color: #0d9488; font-size: 11px; font-weight: 600; text-decoration: none;">View Details &rarr;</a>
            </div>
          </div>
        `;

        const marker = L.marker([rep.latitude, rep.longitude], { icon })
          .bindPopup(popupHtml);

        marker.on('click', () => {
          if (onSelectEntity) {
            onSelectEntity({
              type: 'SAFETY',
              title: rep.title,
              subtitle: `${rep.location} · Oakridge Heights`,
              description: rep.description,
              latitude: rep.latitude,
              longitude: rep.longitude,
              statusBadge: rep.status.replace('_', ' '),
              actionUrl: '/safety-watch',
              actionLabel: 'View Safety Details',
            });
          }
        });

        marker.addTo(markersLayer.current!);
      });
    }

    // 1b. Location Picker Marker
    if (isPickerMode && pickerLocation) {
      const pickerIcon = createPinIcon('#e11d48', '📍', { isCritical: true });
      const pickerMarker = L.marker([pickerLocation.latitude, pickerLocation.longitude], {
        icon: pickerIcon,
        draggable: true,
      });
      pickerMarker.on('dragend', (evt) => {
        const latlng = evt.target.getLatLng();
        if (onLocationPick) {
          onLocationPick(latlng.lat, latlng.lng);
        }
      });
      pickerMarker.bindTooltip('Selected Report Location (Drag pin or click map to change)', { permanent: true, direction: 'top' });
      pickerMarker.addTo(markersLayer.current!);
    }

    // 2. Available Items to Borrow Markers (Tools, appliances, sports)
    if (activeFilter === 'ALL' || activeFilter === 'ITEMS') {
      const defaultCampusItemLocations = [
        { lat: 12.9351, lng: 77.6113, block: 'Block B (402)', defaultTitle: 'Bosch Hammer Drill 650W', category: 'TOOLS' },
        { lat: 12.9344, lng: 77.6117, block: 'Block A (201)', defaultTitle: '4-Person Camping Tent & Mat', category: 'SPORTS_FITNESS' },
        { lat: 12.9358, lng: 77.6121, block: 'Block C (503)', defaultTitle: 'Karcher High Pressure Washer', category: 'HOME_APPLIANCES' },
        { lat: 12.9348, lng: 77.6108, block: 'Clubhouse Caretaker', defaultTitle: 'Heavy Duty 8ft Aluminium Stepladder', category: 'TOOLS' },
      ];

      // Use items if available, mapped to society locations
      const itemsToRender = items.length > 0 ? items : [
        { id: '1', title: 'Bosch Hammer Drill 650W', category: 'TOOLS', ownerName: 'Srikumar', maxBorrowDays: 3, description: 'Comes with concrete drill bit set and carrying case.' },
        { id: '2', title: '4-Person Camping Tent', category: 'SPORTS_FITNESS', ownerName: 'Priya Sharma', maxBorrowDays: 4, description: 'Waterproof Quechua tent with pegs and mallet.' },
        { id: '3', title: 'Karcher High Pressure Washer', category: 'HOME_APPLIANCES', ownerName: 'Sanjay Kumar', maxBorrowDays: 2, description: 'Great for car wash or patio tile cleaning.' },
      ];

      itemsToRender.forEach((item, index) => {
        const loc = defaultCampusItemLocations[index % defaultCampusItemLocations.length];
        const icon = createPinIcon('#10b981', '📦');

        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 190px; padding: 4px;">
            <span style="background: #10b98120; color: #047857; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
              Available to Borrow
            </span>
            <h4 style="margin: 6px 0 2px; font-size: 13px; font-weight: 700; color: #0f172a;">${item.title}</h4>
            <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">📍 ${loc.block}</p>
            <p style="margin: 0 0 6px; font-size: 11px; color: #334155;">Owner: <strong>${item.ownerName || 'Verified Neighbour'}</strong> &bull; Max ${item.maxBorrowDays || 3} days</p>
            <div style="padding-top: 6px; border-top: 1px solid #f1f5f9;">
              <a href="/share-borrow" style="display: block; text-align: center; background: #0d9488; color: white; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; text-decoration: none;">
                Request to Borrow
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([loc.lat, loc.lng], { icon })
          .bindPopup(popupHtml);

        marker.on('click', () => {
          if (onSelectEntity) {
            onSelectEntity({
              type: 'ITEM',
              title: item.title,
              subtitle: `Available from ${loc.block}`,
              description: item.description || 'Shared resource available to Oakridge residents.',
              latitude: loc.lat,
              longitude: loc.lng,
              statusBadge: 'Ready to Borrow',
              actionUrl: '/share-borrow',
              actionLabel: 'Borrow This Item',
            });
          }
        });

        marker.addTo(markersLayer.current!);
      });
    }

    // 3. Community Events Markers
    if (activeFilter === 'ALL' || activeFilter === 'EVENTS') {
      events.forEach((evt) => {
        let categoryEmoji = '🎉';
        let categoryColor = '#8b5cf6';

        switch (evt.category) {
          case 'CLEANUP':
            categoryEmoji = '🧹';
            categoryColor = '#059669';
            break;
          case 'TREE_PLANTING':
            categoryEmoji = '🌿';
            categoryColor = '#10b981';
            break;
          case 'SPORTS':
            categoryEmoji = '⚽';
            categoryColor = '#ea580c';
            break;
          case 'MEETING':
            categoryEmoji = '🏛️';
            categoryColor = '#4f46e5';
            break;
          case 'FESTIVAL':
            categoryEmoji = '🎉';
            categoryColor = '#ec4899';
            break;
          case 'BLOOD_DONATION':
            categoryEmoji = '🩸';
            categoryColor = '#e11d48';
            break;
          case 'KIDS':
            categoryEmoji = '🎨';
            categoryColor = '#06b6d4';
            break;
          case 'MAINTENANCE':
            categoryEmoji = '🛠️';
            categoryColor = '#d97706';
            break;
          default:
            categoryEmoji = '🎈';
            categoryColor = '#8b5cf6';
            break;
        }

        const icon = createPinIcon(categoryColor, categoryEmoji);

        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 210px; padding: 4px;">
            <span style="background: ${categoryColor}20; color: ${categoryColor}; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
              ${evt.category.replace('_', ' ')}
            </span>
            <h4 style="margin: 6px 0 2px; font-size: 13px; font-weight: 700; color: #0f172a;">${evt.title}</h4>
            <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">📍 ${evt.location}</p>
            <p style="margin: 0 0 6px; font-size: 11px; color: #334155;">📅 ${evt.eventDate} &bull; ⏰ ${evt.startTime} - ${evt.endTime}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 6px;">
              <span style="font-size: 11px; color: ${categoryColor}; font-weight: 600;">👥 ${evt.participantsCount} Neighbors Joining</span>
              <a href="/events" style="color: ${categoryColor}; font-size: 11px; font-weight: 600; text-decoration: none;">View Details &rarr;</a>
            </div>
          </div>
        `;

        const marker = L.marker([evt.latitude, evt.longitude], { icon })
          .bindPopup(popupHtml);

        marker.on('click', () => {
          if (onSelectEntity) {
            onSelectEntity({
              type: 'EVENT',
              title: evt.title,
              subtitle: `${evt.eventDate} at ${evt.startTime} · ${evt.location}`,
              description: evt.description,
              latitude: evt.latitude,
              longitude: evt.longitude,
              statusBadge: `${evt.participantsCount} Neighbors Joining`,
              actionUrl: '/events',
              actionLabel: 'View Community Event',
            });
          }
        });

        marker.addTo(markersLayer.current!);
      });
    }

    // 4. Society Amenities & Landmarks
    if (activeFilter === 'ALL' || activeFilter === 'AMENITIES') {
      AMENITIES.forEach((am) => {
        const icon = createPinIcon(am.color, am.emoji);

        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 170px; padding: 4px;">
            <div style="display: flex; align-items: center; space-x: 1; margin-bottom: 2px;">
              <span style="font-size: 10px; font-weight: 700; color: ${am.color}; text-transform: uppercase;">
                ${am.type} Landmark
              </span>
            </div>
            <h4 style="margin: 3px 0 2px; font-size: 13px; font-weight: 700; color: #0f172a;">${am.title}</h4>
            <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.35;">${am.desc}</p>
          </div>
        `;

        const marker = L.marker([am.lat, am.lng], { icon })
          .bindPopup(popupHtml);

        marker.on('click', () => {
          if (onSelectEntity) {
            onSelectEntity({
              type: 'AMENITY',
              title: am.title,
              subtitle: `Zone: ${am.type} · Oakridge Heights`,
              description: am.desc,
              latitude: am.lat,
              longitude: am.lng,
              statusBadge: am.type,
              actionUrl: '/community',
              actionLabel: 'Explore Landmark',
            });
          }
        });

        marker.addTo(markersLayer.current!);
      });
    }
  }, [activeFilter, safetyReports, events, items]);

  // Recenter if selectedLocation changes
  useEffect(() => {
    if (selectedLocation && leafletInstance.current) {
      leafletInstance.current.flyTo(
        [selectedLocation.latitude, selectedLocation.longitude],
        18,
        { animate: true, duration: 1 }
      );
    }
  }, [selectedLocation]);

  const jumpToLandmark = (lat: number, lng: number) => {
    if (leafletInstance.current) {
      leafletInstance.current.flyTo([lat, lng], 18, { animate: true, duration: 1 });
    }
  };

  const resetView = () => {
    if (leafletInstance.current) {
      leafletInstance.current.flyTo(SOCIETY_CENTER, 17, { animate: true });
    }
  };

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      {/* Top Floating Controls: Landmark Jump Bar (optional) & Map Controls */}
      <div className="absolute top-3 inset-x-3 z-[400] flex items-center justify-between pointer-events-none">
        {/* Quick jump pills (Only if showLandmarksBar is enabled) */}
        {showLandmarksBar ? (
          <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-indigo-200 shadow-md pointer-events-auto overflow-x-auto no-scrollbar text-xs">
            <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider px-1">Jump to:</span>
            {AMENITIES.slice(0, 5).map((am) => (
              <button
                key={am.id}
                type="button"
                onClick={() => jumpToLandmark(am.lat, am.lng)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-violet-50 text-slate-700 hover:text-violet-900 border border-slate-200/60 font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer active:scale-95"
              >
                <span>{am.emoji}</span>
                <span>{am.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        ) : <div />}

        {/* Right Tools: Style Toggle & Recenter */}
        <div className="flex items-center space-x-1.5 pointer-events-auto shrink-0 ml-auto">
          <button
            type="button"
            onClick={toggleMapStyle}
            className="flex items-center space-x-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle Map Visual Style"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{mapStyle === 'VOYAGER' ? 'Pastel' : 'OSM'}</span>
          </button>

          <button
            type="button"
            onClick={resetView}
            className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset to Campus Center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Element */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="z-10" />

      {/* Colorful Light Legend Footer */}
      <div className="p-2 sm:p-2.5 bg-white/95 backdrop-blur-md border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs z-20 relative">
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-2xs border border-white" />
            <span className="font-semibold text-indigo-900">🛡️ Security</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-2xs border border-white" />
            <span className="font-semibold text-amber-900">🏗️ Infra</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-2xs border border-white" />
            <span className="font-semibold text-yellow-900">💡 Lighting</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 shadow-2xs border border-white" />
            <span className="font-semibold text-sky-900">💧 Water</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5">
            <span className="w-3 h-1.5 rounded-full bg-emerald-400 border border-emerald-600 border-dashed" />
            <span className="font-medium text-slate-600">Oakridge Boundary</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 font-semibold flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Interactive Society Sentinel Map</span>
        </div>
      </div>
    </div>
  );
};
