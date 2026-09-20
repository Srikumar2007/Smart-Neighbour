import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  MapPin, 
  Star, 
  ChevronRight, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  Share2, 
  Send, 
  Check, 
  X, 
  Info, 
  HelpCircle,
  MessageSquare,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { lendingService, CreateItemPayload } from '../../services/lendingService';
import { LendingItem, BorrowRequest, ItemCategory } from '../../types';
import { ItemCardSkeleton } from '../../components/common/LoadingSkeletons';
import { ErrorState } from '../../components/common/ErrorState';

// Category Definitions matching the user prompt:
// All, Tools, Kitchen, Electronics, Books, Sports, Home
type MarketplaceCategory = 'ALL' | 'TOOLS' | 'KITCHEN' | 'ELECTRONICS' | 'BOOKS' | 'SPORTS' | 'HOME';

interface CategoryChip {
  id: MarketplaceCategory;
  label: string;
}

const CATEGORIES: CategoryChip[] = [
  { id: 'ALL', label: 'All' },
  { id: 'TOOLS', label: 'Tools' },
  { id: 'KITCHEN', label: 'Kitchen' },
  { id: 'ELECTRONICS', label: 'Electronics' },
  { id: 'BOOKS', label: 'Books' },
  { id: 'SPORTS', label: 'Sports' },
  { id: 'HOME', label: 'Home' },
];

export const ShareBorrowPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Core Data
  const [items, setItems] = useState<LendingItem[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_ITEMS' | 'REQUESTS'>('MARKETPLACE');
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE_ONLY'>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'NEWEST' | 'TRUST_SCORE'>('POPULAR');
  const [blockFilter, setBlockFilter] = useState<string>('ALL');

  // Detail Modal & Interactive Flow State
  const [selectedItemDetail, setSelectedItemDetail] = useState<LendingItem | null>(null);
  
  // Borrow Flow Modal State
  // Flow steps: 'REQUEST_FORM' -> 'SENDING' -> 'APPROVED_CONFIRMATION'
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [borrowItemTarget, setBorrowItemTarget] = useState<LendingItem | null>(null);
  const [borrowStep, setBorrowStep] = useState<'SELECT_DETAILS' | 'CONFIRM_SENT' | 'SIMULATE_APPROVED'>('SELECT_DETAILS');
  const [borrowStartDate, setBorrowStartDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [borrowTimeSlot, setBorrowTimeSlot] = useState<string>('Morning (9:00 AM - 12:00 PM)');
  const [borrowDays, setBorrowDays] = useState<number>(2);
  const [borrowMessage, setBorrowMessage] = useState<string>('');
  const [lastCreatedRequest, setLastCreatedRequest] = useState<BorrowRequest | null>(null);

  // Add Item Modal State
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(searchParams.get('action') === 'create');
  const [newItemData, setNewItemData] = useState<CreateItemPayload>({
    title: '',
    description: '',
    category: 'TOOLS',
    maxBorrowDays: 3,
    depositRequired: 0,
    imageUrl: '',
    tags: [],
  });

  // Load backend / store data
  const loadData = async () => {
    setIsLoadingItems(true);
    setFetchError(null);
    try {
      const [loadedItems, loadedRequests] = await Promise.all([
        lendingService.getItems(),
        lendingService.getBorrowRequests(),
      ]);
      setItems(loadedItems);
      setRequests(loadedRequests);
    } catch (err: any) {
      setFetchError(err?.message || 'Unable to load marketplace items at this time.');
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category matching helper
  const matchesCategoryFilter = (item: LendingItem, cat: MarketplaceCategory): boolean => {
    if (cat === 'ALL') return true;
    if (cat === 'TOOLS') return item.category === 'TOOLS' || item.tags.some(t => t.toLowerCase().includes('tool') || t.toLowerCase().includes('drill') || t.toLowerCase().includes('ladder'));
    if (cat === 'KITCHEN') return (item.category === 'HOME_APPLIANCES' || item.category === 'TOOLS') && (item.tags.some(t => t.toLowerCase().includes('kitchen') || t.toLowerCase().includes('baking') || t.toLowerCase().includes('mixer')) || item.title.toLowerCase().includes('mixer') || item.title.toLowerCase().includes('cooker') || item.title.toLowerCase().includes('coffee'));
    if (cat === 'ELECTRONICS') return item.category === 'ELECTRONICS' || item.tags.some(t => t.toLowerCase().includes('projector') || t.toLowerCase().includes('electronics'));
    if (cat === 'BOOKS') return item.category === 'BOOKS_MEDIA' || item.tags.some(t => t.toLowerCase().includes('book') || t.toLowerCase().includes('read'));
    if (cat === 'SPORTS') return item.category === 'SPORTS_FITNESS' || item.tags.some(t => t.toLowerCase().includes('tennis') || t.toLowerCase().includes('sport'));
    if (cat === 'HOME') return item.category === 'HOME_APPLIANCES' || item.category === 'GARDENING' || item.category === 'CAMPING' || item.tags.some(t => t.toLowerCase().includes('clean') || t.toLowerCase().includes('tent') || t.toLowerCase().includes('balcony'));
    return true;
  };

  // Filtered & Sorted items
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      // Category
      if (!matchesCategoryFilter(item, selectedCategory)) return false;

      // Availability Filter
      if (availabilityFilter === 'AVAILABLE_ONLY' && item.status !== 'AVAILABLE') return false;

      // Block / Nearby Filter
      if (blockFilter !== 'ALL') {
        const itemBlock = item.ownerApartment.includes('Block A') ? 'Block A' :
                         item.ownerApartment.includes('Block B') ? 'Block B' :
                         item.ownerApartment.includes('Block C') ? 'Block C' : '';
        if (itemBlock !== blockFilter) return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesOwner = item.ownerName.toLowerCase().includes(query);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesOwner && !matchesTags) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'POPULAR') {
        return (b.usageCount || 0) - (a.usageCount || 0);
      }
      if (sortBy === 'TRUST_SCORE') {
        return b.ownerTrustScore - a.ownerTrustScore;
      }
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [items, selectedCategory, availabilityFilter, blockFilter, searchQuery, sortBy]);

  // Derived collections
  const myItems = items.filter((i) => i.ownerId === user?.id);
  const myRequests = requests.filter((r) => r.requesterId === user?.id || r.ownerId === user?.id);

  // Open Item Detail
  const handleOpenDetail = (item: LendingItem) => {
    setSelectedItemDetail(item);
  };

  // Initiate borrow request from card or detail view
  const handleStartBorrowFlow = (item: LendingItem) => {
    setBorrowItemTarget(item);
    setBorrowDays(Math.min(2, item.maxBorrowDays || 3));
    setBorrowMessage(`Hi ${item.ownerName.split(' ')[0]}! Would love to borrow your ${item.title} for our apartment.`);
    setBorrowStep('SELECT_DETAILS');
    setIsBorrowModalOpen(true);
  };

  // Submit Request Flow
  const handleSubmitBorrowRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowItemTarget || !borrowMessage.trim()) return;

    try {
      const createdReq = await lendingService.requestBorrow({
        itemId: borrowItemTarget.id,
        requestedDays: borrowDays,
        purpose: `${borrowMessage} [Scheduled: ${borrowStartDate} · ${borrowTimeSlot}]`,
      }, user ? {
        id: user.id,
        name: user.name,
        apartmentNumber: user.apartmentNumber,
        block: user.block,
        trustScore: user.trustScore,
      } : undefined);

      setLastCreatedRequest(createdReq);
      setBorrowStep('CONFIRM_SENT');
      showToast('Request Sent! 🤝', `Borrow request delivered to ${borrowItemTarget.ownerName}.`, 'success');
      loadData();
    } catch {
      showToast('Request Failed', 'Could not submit borrow request.', 'error');
    }
  };

  // Simulate Owner Approval action for demo / real-time feel
  const handleSimulateApproval = async () => {
    if (!lastCreatedRequest) return;
    try {
      await lendingService.updateBorrowRequestStatus(lastCreatedRequest.id, 'APPROVED');
      setBorrowStep('SIMULATE_APPROVED');
      showToast('Borrow Confirmed! 🎉', `${borrowItemTarget?.ownerName} approved your request. Coordinate pickup!`, 'success');
      loadData();
    } catch {
      showToast('Update Failed', 'Could not simulate approval.', 'error');
    }
  };

  // Owner action to approve / reject
  const handleUpdateRequestStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED' | 'RETURNED') => {
    try {
      await lendingService.updateBorrowRequestStatus(requestId, status);
      showToast('Request Updated', `Request marked as ${status.toLowerCase()}`, 'success');
      loadData();
    } catch {
      showToast('Update Failed', 'Could not update request status.', 'error');
    }
  };

  // Add Item Submit
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.title.trim()) return;

    try {
      await lendingService.createItem({
        ...newItemData,
        imageUrl: newItemData.imageUrl || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=900&auto=format&fit=crop&q=80',
      });
      showToast('Item Listed! 📦', 'Your item is now available to Oakridge neighbours.', 'success');
      setIsAddItemModalOpen(false);
      setNewItemData({
        title: '',
        description: '',
        category: 'TOOLS',
        maxBorrowDays: 3,
        depositRequired: 0,
        imageUrl: '',
        tags: [],
      });
      loadData();
    } catch {
      showToast('Listing Failed', 'Could not add item to marketplace.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION (Prompt: "Share with neighbors" & "Borrow something instead of buying it.") */}
      {/* ========================================================================= */}
      <section className="bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Oakridge Heights Sharing Economy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Share with neighbors
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            Borrow something instead of buying it.
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddItemModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-bold rounded-xl text-sm shadow-sm hover:shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List an Item to Lend</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS (Marketplace, My Items, Requests) */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3 text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('MARKETPLACE')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'MARKETPLACE'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Marketplace</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'MARKETPLACE' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
          }`}>
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MY_ITEMS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'MY_ITEMS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>My Listed Items</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'MY_ITEMS' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
          }`}>
            {myItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'REQUESTS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Borrow Requests</span>
          {myRequests.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'REQUESTS' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {myRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. MARKETPLACE VIEW: Search, Category Chips, Filters & Item Cards Grid */}
      {/* ========================================================================= */}
      {activeTab === 'MARKETPLACE' && (
        <div className="space-y-6">
          {/* Search bar & Controls Bar */}
          <div className="bg-white/95 rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Bar: "What do you need?" */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you need? (e.g. Power drill, ladder, mixer, tent...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Controls: Availability & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Availability Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    availabilityFilter === 'ALL' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('AVAILABLE_ONLY')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                    availabilityFilter === 'AVAILABLE_ONLY' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Available only</span>
                </button>
              </div>

              {/* Nearby / Block Filter */}
              <select
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
                className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">📍 All Campus Blocks</option>
                <option value="Block A">Nearby: Block A</option>
                <option value="Block B">Nearby: Block B</option>
                <option value="Block C">Nearby: Block C</option>
              </select>

              {/* Sort dropdown */}
              <div className="flex items-center space-x-1.5 pl-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="POPULAR">Most Borrowed</option>
                  <option value="TRUST_SCORE">Highest Owner Trust</option>
                  <option value="NEWEST">Newly Added</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips: All, Tools, Kitchen, Electronics, Books, Sports, Home */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Active Filters Bar / Results Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <div>
              Showing <span className="font-bold text-slate-900">{filteredAndSortedItems.length}</span> shared items in Oakridge Heights
              {blockFilter !== 'ALL' && <span className="ml-1.5 text-indigo-600 font-semibold">({blockFilter} only)</span>}
            </div>
            {(selectedCategory !== 'ALL' || availabilityFilter !== 'ALL' || searchQuery || blockFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setAvailabilityFilter('ALL');
                  setSearchQuery('');
                  setBlockFilter('ALL');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ITEM CARDS GRID: Large Images, Owner, Usage, Request Button */}
          {/* ========================================================================= */}
          {isLoadingItems ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <ItemCardSkeleton key={idx} />
              ))}
            </div>
          ) : fetchError ? (
            <ErrorState
              title="Marketplace Temporarily Unavailable"
              message={fetchError}
              onRetry={loadData}
            />
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching items found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No neighbour has listed this item yet. You can post a request on the community board or clear your search filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setAvailabilityFilter('ALL');
                  setSearchQuery('');
                  setBlockFilter('ALL');
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedItems.map((item) => {
                const isOwner = item.ownerId === user?.id;
                const isAvailable = item.status === 'AVAILABLE';

                return (
                  <article
                    key={item.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Top: Large Image with Badges */}
                    <div 
                      onClick={() => handleOpenDetail(item)}
                      className="relative h-56 sm:h-60 w-full bg-slate-100 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&auto=format&fit=crop&q=80'
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Availability Tag */}
                      <div className="absolute top-3 left-3">
                        {isAvailable ? (
                          <span className="inline-flex items-center space-x-1 bg-emerald-600/95 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            <Clock className="w-3 h-3" />
                            <span>In Use</span>
                          </span>
                        )}
                      </div>

                      {/* Nearby Block Indicator Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center space-x-1 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm border border-slate-200/80">
                          <MapPin className="w-3 h-3 text-indigo-600" />
                          <span>{item.ownerApartment.split('·')[0].trim() || 'Block B'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle: Content Section */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Title */}
                        <h3 
                          onClick={() => handleOpenDetail(item)}
                          className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-snug cursor-pointer line-clamp-1"
                          title={item.title}
                        >
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Owner Info & Usage Reputation */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        {/* Owner Profile Line */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {item.ownerName.charAt(0)}
                            </div>
                            <div className="truncate font-semibold text-slate-800">
                              <span>{item.ownerName}</span>
                              <span className="mx-1 text-slate-400">·</span>
                              <span className="text-slate-500 font-normal">{item.ownerApartment}</span>
                            </div>
                          </div>

                          {/* Owner Trust Badge */}
                          <div 
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold shrink-0"
                            title={`Verified Society Trust Score: ${item.ownerTrustScore}`}
                          >
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{item.ownerTrustScore}</span>
                          </div>
                        </div>

                        {/* Usage Counter / Monthly borrowing activity */}
                        <div className="flex items-center justify-between text-[11.5px] text-slate-500 font-medium">
                          <div className="flex items-center space-x-1.5 text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-lg">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span className="font-semibold">{item.usageText || 'Used twice this month'}</span>
                          </div>
                          <span className="text-slate-400">Max {item.maxBorrowDays} days</span>
                        </div>
                      </div>

                      {/* Request to Borrow Button / Flow Trigger */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={!isAvailable || isOwner}
                          onClick={() => handleStartBorrowFlow(item)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-98 ${
                            isOwner
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : isAvailable
                              ? 'bg-slate-900 hover:bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          {isOwner ? (
                            <span>Your Listed Item</span>
                          ) : isAvailable ? (
                            <>
                              <span>Request to Borrow</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <span>Currently Borrowed</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MY LISTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'MY_ITEMS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Shared Inventory</h2>
            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List New Item</span>
            </button>
          </div>

          {myItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">You haven't listed any items yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Lend tools, games, or kitchen gear you only use occasionally. Build neighbour trust points and earn community rewards!
              </p>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                List your first item (+10 Trust Points!)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-3">
                  <div className="flex space-x-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.category}</p>
                      <div className="mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status === 'AVAILABLE' ? 'Available' : 'Borrowed by neighbor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Max {item.maxBorrowDays} days</span>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(item)}
                      className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REQUESTS TAB (Incoming & Outgoing Requests) */}
      {/* ========================================================================= */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Borrow Requests & Approvals</h2>
          </div>

          {myRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
              No borrow requests active right now. Browse the marketplace to borrow tools from neighbors!
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => {
                const isIncomingForMe = req.ownerId === user?.id;
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{req.itemTitle}</h4>
                        <StatusBadge status={req.status} />
                        {isIncomingForMe && (
                          <span className="bg-violet-100 text-violet-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Incoming Request for your item
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>{isIncomingForMe ? 'Requested by:' : 'Owner:'}</strong> {isIncomingForMe ? `${req.requesterName} (${req.requesterApartment})` : 'You requested from owner'}
                      </p>
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                        "{req.purpose}"
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Requested for {req.requestedDays} days · {new Date(req.requestedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action Controls for Owner */}
                    {isIncomingForMe && req.status === 'PENDING' && (
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateRequestStatus(req.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRequestStatus(req.id, 'APPROVED')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Approve & Lend
                        </button>
                      </div>
                    )}

                    {req.status === 'APPROVED' && (
                      <div className="text-right shrink-0">
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
                          ✓ Confirmed & Handed Over
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ITEM DETAIL MODAL (Image, Name, Owner, Apartment/Block, Description, Availability, Borrow history, Rules, Request button) */}
      {/* ========================================================================= */}
      {selectedItemDetail && (
        <Modal
          isOpen={Boolean(selectedItemDetail)}
          onClose={() => setSelectedItemDetail(null)}
          title={selectedItemDetail.title}
          subtitle={`Listed by ${selectedItemDetail.ownerName} · ${selectedItemDetail.ownerApartment}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-slate-800">
            {/* Image */}
            <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={selectedItemDetail.imageUrl}
                alt={selectedItemDetail.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                {selectedItemDetail.status === 'AVAILABLE' ? (
                  <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Available Now
                  </span>
                ) : (
                  <span className="bg-slate-900/85 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Currently Borrowed
                  </span>
                )}
              </div>
            </div>

            {/* Owner, Apartment & Reputation Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedItemDetail.ownerName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedItemDetail.ownerName}</div>
                  <div className="text-xs text-slate-500">{selectedItemDetail.ownerApartment} · Verified Resident</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="bg-amber-100/70 border border-amber-200 px-3 py-1.5 rounded-xl font-bold text-amber-900 flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Trust Score: {selectedItemDetail.ownerTrustScore}</span>
                </div>
                <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-semibold text-slate-700">
                  {selectedItemDetail.usageText || 'Used twice this month'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedItemDetail.description}
              </p>
            </div>

            {/* Rules Section */}
            <div className="space-y-2 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Owner's Borrowing Rules</span>
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                {selectedItemDetail.rules && selectedItemDetail.rules.length > 0 ? (
                  selectedItemDetail.rules.map((rule, idx) => (
                    <li key={idx} className="leading-snug">{rule}</li>
                  ))
                ) : (
                  <>
                    <li>Return within max {selectedItemDetail.maxBorrowDays} days in clean condition.</li>
                    <li>Notify owner through society chat if extending or returning early.</li>
                    <li>Handle with care; replace damaged bits or consumables.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Borrow History / Community Reputation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Borrow History & Community Reviews</span>
              </h4>
              {selectedItemDetail.borrowHistory && selectedItemDetail.borrowHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedItemDetail.borrowHistory.map((hist, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{hist.borrowerName}</span> ({hist.borrowerApartment})
                        <p className="text-slate-500 mt-0.5 italic">"{hist.returnedInCondition}"</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-amber-600 font-bold">★ {hist.rating}.0</span>
                        <div className="text-[10.5px] text-slate-400">{hist.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No prior reviews logged yet. Be the first neighbor to borrow and review!</p>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Max borrow limit: <strong className="text-slate-800">{selectedItemDetail.maxBorrowDays} days</strong>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemDetail(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={selectedItemDetail.status !== 'AVAILABLE' || selectedItemDetail.ownerId === user?.id}
                  onClick={() => {
                    const item = selectedItemDetail;
                    setSelectedItemDetail(null);
                    handleStartBorrowFlow(item);
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    selectedItemDetail.ownerId === user?.id
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : selectedItemDetail.status === 'AVAILABLE'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {selectedItemDetail.ownerId === user?.id ? 'Your Listing' : 'Request to Borrow'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 7. COMPLETE BORROW REQUEST FLOW MODAL */}
      {/* Step 1: Request to Borrow -> Select date/time -> Add message -> Send Request */}
      {/* Step 2: Owner approves -> Borrowing confirmed */}
      {/* ========================================================================= */}
      {isBorrowModalOpen && borrowItemTarget && (
        <Modal
          isOpen={isBorrowModalOpen}
          onClose={() => setIsBorrowModalOpen(false)}
          title={
            borrowStep === 'SELECT_DETAILS'
              ? `Borrow ${borrowItemTarget.title}`
              : borrowStep === 'CONFIRM_SENT'
              ? 'Request Sent to Owner'
              : 'Borrowing Confirmed! 🎉'
          }
          subtitle={`Owner: ${borrowItemTarget.ownerName} (${borrowItemTarget.ownerApartment})`}
          maxWidth="md"
        >
          {/* Progress Flow Indicator */}
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                borrowStep === 'SELECT_DETAILS' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {borrowStep === 'SELECT_DETAILS' ? '1' : '✓'}
              </span>
              <span>Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                borrowStep === 'CONFIRM_SENT' ? 'bg-indigo-600 text-white' : borrowStep === 'SIMULATE_APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {borrowStep === 'SIMULATE_APPROVED' ? '✓' : '2'}
              </span>
              <span>Sent</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                borrowStep === 'SIMULATE_APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </span>
              <span>Confirmed</span>
            </div>
          </div>

          {/* STEP 1: SELECT DATE/TIME & MESSAGE */}
          {borrowStep === 'SELECT_DETAILS' && (
            <form onSubmit={handleSubmitBorrowRequest} className="space-y-4 text-xs">
              {/* Item snapshot */}
              <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src={borrowItemTarget.imageUrl}
                  alt={borrowItemTarget.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{borrowItemTarget.title}</h4>
                  <p className="text-slate-500">Pick up from {borrowItemTarget.ownerApartment}</p>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    value={borrowStartDate}
                    onChange={(e) => setBorrowStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pickup Time Window
                  </label>
                  <select
                    value={borrowTimeSlot}
                    onChange={(e) => setBorrowTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-800"
                  >
                    <option>Morning (9:00 AM - 12:00 PM)</option>
                    <option>Afternoon (1:00 PM - 4:00 PM)</option>
                    <option>Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Days duration */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  How many days do you need it?
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={1}
                    max={borrowItemTarget.maxBorrowDays || 7}
                    value={borrowDays}
                    onChange={(e) => setBorrowDays(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                    {borrowDays} {borrowDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              {/* Add message */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Add message to {borrowItemTarget.ownerName.split(' ')[0]}
                </label>
                <textarea
                  required
                  rows={3}
                  value={borrowMessage}
                  onChange={(e) => setBorrowMessage(e.target.value)}
                  placeholder="Tell your neighbor what project you're working on and when you'll return it..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Trust reward badge */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Trust Guarantee:</span> Returning this {borrowItemTarget.title} on time earns you <strong>+10 Community Trust Points</strong>.
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!borrowMessage.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REQUEST SENT & PENDING OWNER REVIEW */}
          {borrowStep === 'CONFIRM_SENT' && (
            <div className="text-center py-4 space-y-4 text-xs">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto ring-4 ring-indigo-50">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Sent to {borrowItemTarget.ownerName}!</h3>
                <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                  {borrowItemTarget.ownerName} has been notified for {borrowStartDate} ({borrowTimeSlot}). You can track this request under "My Borrow Requests".
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBorrowModalOpen(false);
                    setActiveTab('MY_REQUESTS');
                  }}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  View My Requests
                </button>
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BORROWING CONFIRMED */}
          {borrowStep === 'SIMULATE_APPROVED' && (
            <div className="text-center py-4 space-y-4 text-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Borrowing Confirmed!</h3>
                <p className="text-slate-600 mt-1 max-w-xs mx-auto">
                  {borrowItemTarget.ownerName} has confirmed your pickup for <strong>{borrowStartDate}</strong> at <strong>{borrowItemTarget.ownerApartment}</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-1 text-emerald-900">
                <div className="font-bold flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pickup Location:</span>
                </div>
                <p className="text-xs">
                  {borrowItemTarget.ownerName} · {borrowItemTarget.ownerApartment}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Item status has been updated to <strong>BORROWED</strong> in the society registry.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 8. LIST NEW ITEM MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Lend an Item to Neighbors"
        subtitle="Share tools, appliances, books or camping gear"
        maxWidth="md"
      >
        <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Item Title</label>
            <input
              type="text"
              required
              value={newItemData.title}
              onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
              placeholder="e.g., Bosch Rotary Hammer Drill Kit"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={newItemData.category}
                onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value as ItemCategory })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
              >
                <option value="TOOLS">Tools & Hardware</option>
                <option value="HOME_APPLIANCES">Kitchen & Home</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="BOOKS_MEDIA">Books & Board Games</option>
                <option value="SPORTS_FITNESS">Sports & Fitness</option>
                <option value="CAMPING">Camping & Outdoor</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Borrow Days</label>
              <input
                type="number"
                min={1}
                max={30}
                value={newItemData.maxBorrowDays}
                onChange={(e) => setNewItemData({ ...newItemData, maxBorrowDays: parseInt(e.target.value) || 1 })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description & Usage Notes</label>
            <textarea
              rows={3}
              value={newItemData.description}
              onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
              placeholder="Includes standard drill bit set and case. Please wipe clean before returning."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              value={newItemData.imageUrl}
              onChange={(e) => setNewItemData({ ...newItemData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">Leave empty to use a high-quality default product photo.</p>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
            >
              List Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
