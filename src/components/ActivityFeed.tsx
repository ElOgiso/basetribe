// ActivityFeed.tsx - Premium mobile-first activity feed
// Shows user engagement posts with real Farcaster cast data

'use client';

import { useState, useEffect } from 'react';
import { Flame, Star, AlertTriangle, Sparkles, Check, X, Clock, Plus } from 'lucide-react';
import { fetchActivityFeed, fetchFarcasterProfile, type ActivityFeedItem } from '../lib/api';
import { CastCard } from './CastCard';
import { PostModal } from './PostModal';
import { FeedInfoBanner } from './FeedInfoBanner';
import { getSessionState, canUserPost } from '../lib/session';

interface ActivityFeedProps {
  userFid?: string;
  limit?: number;
  userData?: any;
  onRefresh?: () => void;
}

export function ActivityFeed({ userFid, limit = 50, userData, onRefresh }: ActivityFeedProps) {
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCache, setProfileCache] = useState<Map<string, { pfpUrl: string; displayName: string }>>(new Map());
  const [showPostModal, setShowPostModal] = useState(false);
  const [sessionState, setSessionState] = useState(getSessionState());
  const [showCanPostButton, setShowCanPostButton] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Initial load
  useEffect(() => {
    loadFeedData();
  }, [limit]);

  // Auto-refresh feed every 2 minutes to show new posts (reduced from 30s to prevent API spam)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing activity feed...');
      loadFeedData();
    }, 120000); // 2 minutes

    return () => clearInterval(refreshInterval);
  }, [limit]);

  // Update session state every second
  useEffect(() => {
    const updateSession = () => {
      const state = getSessionState();
      setSessionState(state);
      
      // Check if user can post
      const { canPost } = canUserPost(userData);
      setShowCanPostButton(canPost);
    };

    updateSession();
    const interval = setInterval(updateSession, 10000); // Update every 10 seconds instead of 1
    return () => clearInterval(interval);
  }, [userData]);

  const loadFeedData = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Loading activity feed...');
      
      const data = await fetchActivityFeed(limit);
      setFeedItems(data);
      setLastUpdated(new Date());

      // Fetch profile pictures for all users
      const uniqueFids = [...new Set(data.map(item => item.farcaster_fid))];
      const profiles = new Map();

      await Promise.all(
        uniqueFids.map(async (fid) => {
          const profile = await fetchFarcasterProfile(fid);
          if (profile) {
            profiles.set(fid, {
              pfpUrl: profile.pfpUrl,
              displayName: profile.displayName,
            });
          }
        })
      );

      setProfileCache(profiles);
      console.log(`✅ Loaded ${data.length} feed items with profiles`);
    } catch (error) {
      console.error('❌ Error loading activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSuccess = () => {
    // Reload feed data after successful post
    loadFeedData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getBadgeColor = (banStatus: string) => {
    if (banStatus === 'banned') return 'bg-red-500';
    if (banStatus === 'probation') return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getBadgeText = (banStatus: string) => {
    if (banStatus === 'banned') return 'BANNED';
    if (banStatus === 'probation') return 'PROBATION';
    return '';
  };

  const getStatusColor = (status: string) => {
    if (status === 'passed' || status === 'completed' || status === 'success') return 'text-green-600 bg-green-50';
    if (status === 'pending' || status === 'waiting') return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusText = (status: string) => {
    if (status === 'passed' || status === 'completed' || status === 'success') return 'Reward Earned';
    if (status === 'pending' || status === 'waiting') return 'Reward Pending';
    return 'Defaulted';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'passed' || status === 'completed' || status === 'success') return <Check className="w-4 h-4" />;
    if (status === 'pending' || status === 'waiting') return <Clock className="w-4 h-4" />;
    return <X className="w-4 h-4" />;
  };

  const formatSessionTime = (time: string, date: string, index: string) => {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>{date} • {time} WAT</span>
        {index && <span className="px-2 py-0.5 bg-gray-100 rounded-full">Session #{index}</span>}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="h-24 bg-gray-200 rounded-xl mb-4" />
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-12 h-12 text-[#0052FF]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activity Yet</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Be the first to post and engage! Start earning $BTRIBE tokens.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 pb-24">
      {/* Post Modal */}
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPostSuccess={handlePostSuccess}
        userData={userData}
      />

      {/* Feed Info Banner */}
      <FeedInfoBanner
        totalPosts={feedItems.length}
        isLoading={isLoading}
        onRefresh={loadFeedData}
        lastUpdated={lastUpdated}
      />

      {/* Floating Post Button - Only show when session is active and user is full member */}
      {showCanPostButton && (
        <button
          onClick={() => setShowPostModal(true)}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-r from-[#39FF14] to-[#00FF41] hover:from-[#00FF41] hover:to-[#39FF14] rounded-full shadow-2xl shadow-[#39FF14]/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation"
          aria-label="Create post"
        >
          <Plus className="w-6 h-6 text-black" />
        </button>
      )}

      {feedItems.map((item, index) => {
        const profile = profileCache.get(item.farcaster_fid);
        const isBanned = item.ban_status === 'banned';
        const isProbation = item.ban_status === 'probation';

        return (
          <div
            key={`${item.farcaster_username}-${item.timestamp}-${index}`}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${
              isBanned ? 'opacity-50 grayscale' : ''
            }`}
          >
            {/* User Header */}
            <div className="p-5 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={profile?.pfpUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.farcaster_username}`}
                      alt={item.farcaster_username}
                      className="w-12 h-12 rounded-full ring-2 ring-gray-100"
                    />
                    {item.streak_count > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center ring-2 ring-white">
                        <Flame className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 truncate">
                        @{item.farcaster_username}
                      </p>
                      {(isBanned || isProbation) && (
                        <span className={`px-2 py-0.5 text-xs rounded-full text-white ${getBadgeColor(item.ban_status)}`}>
                          {getBadgeText(item.ban_status)}
                        </span>
                      )}
                    </div>
                    
                    {/* User Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {item.streak_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{item.streak_count}</span>
                        </div>
                      )}
                      {item.stars > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{item.stars}</span>
                        </div>
                      )}
                      {item.defaults > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          <span>{item.defaults}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {getStatusText(item.status)}
                  </span>
                </div>
              </div>

              {/* Reward Info */}
              {item.status === 'passed' || item.status === 'completed' ? (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900">
                        Earned +100 $BTRIBE
                      </p>
                      <p className="text-xs text-green-700">
                        Session completed successfully
                      </p>
                    </div>
                  </div>
                </div>
              ) : item.status === 'defaulted' || item.status === 'failed' ? (
                <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900">
                        Missed Reward
                      </p>
                      <p className="text-xs text-red-700">
                        Incomplete engagement tasks
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-900">
                        Reward Pending
                      </p>
                      <p className="text-xs text-orange-700">
                        Waiting for verification
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cast Embed */}
            <div className="px-5 pb-5">
              <CastCard 
                castUrl={item.link} 
                castHash={item.cast_hash}
              />
            </div>

            {/* Session Meta */}
            <div className="px-5 pb-5 pt-0">
              {formatSessionTime(item.session_time, item.session_date, item.session_index)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
