import React from 'react';
import { 
  Package, 
  Calendar, 
  Shield, 
  Star, 
  Tag, 
  User, 
  Clock, 
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { LendingItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ItemCardProps {
  item: LendingItem;
  currentUserId?: string;
  onRequestBorrow?: (item: LendingItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  currentUserId,
  onRequestBorrow,
}) => {
  const isMine = currentUserId === item.ownerId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Image Frame */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package className="w-12 h-12" />
            </div>
          )}

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <StatusBadge status={item.status} size="sm" />
            {isMine && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-600 text-white shadow-xs">
                My Listing
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/70 backdrop-blur-xs text-white rounded-lg text-xs font-semibold flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>Max {item.maxBorrowDays} {item.maxBorrowDays === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <span>{item.category.replace('_', ' ')}</span>
          </div>

          <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 mb-1.5">
            {item.title}
          </h4>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>

          {/* Owner Info Box */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center text-[10px]">
                {item.ownerName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800 leading-tight">{item.ownerName}</p>
                <p className="text-[10px] text-slate-400">{item.ownerApartment}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{item.ownerTrustScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px]">Security Deposit</span>
            <span className="font-bold text-slate-800">
              {item.depositRequired > 0 ? `$${item.depositRequired}` : 'Free Sharing'}
            </span>
          </div>

          {isMine ? (
            <span className="text-xs font-semibold text-slate-400 italic">
              Your Shared Item
            </span>
          ) : item.status === 'AVAILABLE' ? (
            <button
              type="button"
              onClick={() => onRequestBorrow && onRequestBorrow(item)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <span>Borrow Item</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
              Currently in Use
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
