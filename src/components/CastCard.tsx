// CastCard.tsx - Premium Farcaster cast embed card
// Displays real cast data with live engagement metrics

'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Heart, MessageCircle, Repeat2, Quote } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CastData {
  hash: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    bio: string;
  };
  text: string;
  embeds: Array<{
    url?: string;
    metadata?: any;
  }>;
  reactions: {
    likes: number;
    recasts: number;
    quotes: number;
    replies: number;
  };
  timestamp: string;
  parentHash?: string;
}

interface CastCardProps {
  castUrl: string;
  castHash?: string;
  className?: string;
}

export function CastCard({ castUrl, castHash, className = '' }: CastCardProps) {
  const [castData, setCastData] = useState<CastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCastData();
  }, [castUrl, castHash]);

  const fetchCastData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Determine identifier (prefer cast hash, fallback to URL)
      const identifier = castHash || castUrl;
      const type = castHash ? 'hash' : 'url';

      console.log(`📡 Fetching cast: ${identifier} (type: ${type})`);

      const response = await fetch(
        `/api/cast?action=getCast&identifier=${encodeURIComponent(identifier)}&type=${type}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cast data');
      }

      const data = await response.json();
      setCastData(data);
      console.log('✅ Cast data loaded:', data);
    } catch (err) {
      console.error('❌ Error fetching cast:', err);
      setError('Could not load cast');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCast = () => {
    // Open in Warpcast
    if (castData) {
      const warpcastUrl = `https://warpcast.com/${castData.author.username}/${castData.hash.substring(0, 10)}`;
      window.open(warpcastUrl, '_blank');
    } else {
      window.open(castUrl, '_blank');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="flex gap-6 mt-6">
            <div className="h-8 bg-gray-200 rounded w-16" />
            <div className="h-8 bg-gray-200 rounded w-16" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !castData) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-red-100 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-600">Could not load cast</p>
            <button
              onClick={handleOpenCast}
              className="text-[#0052FF] hover:underline flex items-center gap-1 mt-2"
            >
              Open in Warpcast <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={fetchCastData}
            className="px-4 py-2 bg-[#0052FF] text-white rounded-xl hover:bg-[#0041CC] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleOpenCast}
      className={`bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-5 shadow-sm border border-blue-100/50 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group ${className}`}
    >
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={castData.author.pfpUrl}
          alt={castData.author.displayName}
          className="w-12 h-12 rounded-full ring-2 ring-blue-100"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {castData.author.displayName}
          </p>
          <p className="text-sm text-gray-500 truncate">
            @{castData.author.username}
          </p>
        </div>
        <div className="text-xs text-gray-400">
          {formatTimestamp(castData.timestamp)}
        </div>
      </div>

      {/* Cast Text */}
      <div className="text-gray-800 mb-4 leading-relaxed">
        {castData.text}
      </div>

      {/* Embeds (images, links) */}
      {castData.embeds.length > 0 && (
        <div className="mb-4 space-y-2">
          {castData.embeds.map((embed, index) => {
            if (embed.url) {
              // Check if it's an image
              if (embed.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return (
                  <img
                    key={index}
                    src={embed.url}
                    alt="Embed"
                    className="rounded-xl max-h-96 w-full object-cover"
                  />
                );
              }
              // Otherwise show as link
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-[#0052FF] hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="truncate">{embed.url}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Engagement Metrics */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-gray-600 group-hover:text-pink-500 transition-colors">
          <Heart className="w-5 h-5" />
          <span className="font-medium">{formatNumber(castData.reactions.likes)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 group-hover:text-green-500 transition-colors">
          <Repeat2 className="w-5 h-5" />
          <span className="font-medium">{formatNumber(castData.reactions.recasts)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 group-hover:text-blue-500 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{formatNumber(castData.reactions.replies)}</span>
        </div>
        <div className="ml-auto text-xs text-gray-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Tap to open <ExternalLink className="w-3 h-3" />
        </div>
      </div>

      {/* Reply indicator if it's a reply */}
      {castData.parentHash && (
        <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          Reply to another cast
        </div>
      )}
    </div>
  );
}
