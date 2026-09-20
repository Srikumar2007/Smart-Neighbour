import React from 'react';

export const ItemCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs animate-pulse">
    <div className="h-44 sm:h-48 bg-slate-200" />
    <div className="p-3.5 space-y-2.5">
      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
      <div className="h-3 bg-slate-200 rounded-md w-1/2" />
      <div className="pt-2 flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded-full w-16" />
        <div className="h-7 bg-slate-200 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

export const ReportCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200 rounded-md w-2/5" />
      <div className="h-4 bg-slate-200 rounded-full w-16" />
    </div>
    <div className="h-3 bg-slate-200 rounded-md w-4/5" />
    <div className="h-3 bg-slate-200 rounded-md w-3/5" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-3 bg-slate-200 rounded-md w-24" />
      <div className="h-6 bg-slate-200 rounded-lg w-16" />
    </div>
  </div>
);

export const EventCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs animate-pulse">
    <div className="h-36 bg-slate-200" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
      <div className="h-3 bg-slate-200 rounded-md w-1/2" />
      <div className="h-3 bg-slate-200 rounded-md w-2/3" />
      <div className="pt-2 flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded-full w-20" />
        <div className="h-7 bg-slate-200 rounded-xl w-24" />
      </div>
    </div>
  </div>
);
