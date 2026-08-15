import React from 'react';

export const ModuleSkeleton: React.FC<{ type?: 'dashboard' | 'table' | 'cards' | 'default' }> = ({
  type = 'default',
}) => {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-zinc-800 rounded-lg" />
            <div className="h-4 w-96 bg-zinc-800/60 rounded-md" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-zinc-800 rounded-xl" />
            <div className="h-10 w-32 bg-amber-500/20 rounded-xl" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-zinc-800 rounded" />
                <div className="w-8 h-8 rounded-lg bg-zinc-800" />
              </div>
              <div className="h-8 w-36 bg-zinc-800 rounded-md" />
              <div className="h-3 w-28 bg-zinc-800/60 rounded" />
            </div>
          ))}
        </div>

        {/* Content Block Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-4">
            <div className="h-6 w-48 bg-zinc-800 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-zinc-800/50 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-4">
            <div className="h-6 w-40 bg-zinc-800 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-800/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Filter Bar Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
          <div className="h-10 w-full sm:w-80 bg-zinc-800 rounded-xl" />
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="h-10 w-28 bg-zinc-800 rounded-xl" />
            <div className="h-10 w-36 bg-amber-500/20 rounded-xl" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden p-4 space-y-3">
          <div className="h-10 bg-zinc-800/80 rounded-xl" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 bg-zinc-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-5 animate-pulse">
      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-zinc-800 rounded" />
          <div className="h-4 w-72 bg-zinc-800/60 rounded" />
        </div>
        <div className="h-10 w-32 bg-amber-500/20 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 bg-zinc-800/40 rounded-xl" />
        <div className="h-32 bg-zinc-800/40 rounded-xl" />
      </div>
      <div className="h-48 bg-zinc-800/40 rounded-xl" />
    </div>
  );
};
