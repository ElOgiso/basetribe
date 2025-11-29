// FeedInfoBanner.tsx - Information banner for the Activity Feed
// Clarifies that all posts are always visible regardless of session timing

'use client';

import { TrendingUp, RefreshCw, Info } from 'lucide-react';

interface FeedInfoBannerProps {
  totalPosts: number;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated?: Date;
}

export function FeedInfoBanner({ totalPosts, isLoading, onRefresh, lastUpdated }: FeedInfoBannerProps) {
  return (
    <div className="sticky top-0 z-30 bg-gradient-to-r from-[#0052FF] to-[#7B3FE4] rounded-2xl p-4 shadow-lg mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live Activity Feed
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} • Auto-updates every 30s
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2 touch-manipulation"
          aria-label="Refresh feed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {/* Info Notice */}
      <div className="flex items-start gap-2 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
        <Info className="w-4 h-4 text-blue-100 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-blue-100">
            <span className="font-semibold text-white">All posts are always visible</span> regardless of session time. 
            Only <span className="text-[#39FF14]">full members</span> can create posts during active sessions.
          </p>
        </div>
      </div>
      
      {lastUpdated && (
        <p className="text-xs text-blue-200 mt-2 text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
