// PostModal.tsx - Modal for posting links during active sessions
// Only shows for full members when session is open

'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess: () => void;
  userData: any;
}

export function PostModal({ isOpen, onClose, onPostSuccess, userData }: PostModalProps) {
  const [castUrl, setCastUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePost = async () => {
    // Validate URL
    if (!castUrl.trim()) {
      setError('Please enter a Warpcast URL');
      return;
    }

    // Basic validation for Warpcast URLs
    if (!castUrl.includes('warpcast.com/')) {
      setError('Please enter a valid Warpcast URL');
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      console.log('📤 Posting cast URL:', castUrl);
      console.log('📤 User data:', {
        username: userData?.farcaster_username,
        fid: userData?.farcaster_fid,
        telegram_username: userData?.telegram_username,
        telegram_id: userData?.telegram_id,
      });

      // Extract cast hash from URL
      let castHash = '';
      try {
        // URL format: https://warpcast.com/username/0x123...
        const urlParts = castUrl.split('/');
        castHash = urlParts[urlParts.length - 1];
        if (!castHash || castHash.length < 10) {
          throw new Error('Invalid cast hash');
        }
      } catch (err) {
        setError('Could not extract cast hash from URL. Please check the format.');
        setIsPosting(false);
        return;
      }

      console.log('🔑 Extracted cast hash:', castHash);

      // Get current session time and date
      const now = new Date();
      const waTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
      const sessionDate = waTime.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
      const timestamp = waTime.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // Determine current session time (find the most recent session)
      // Sessions: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
      const SESSIONS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
      const currentHour = waTime.getHours();
      const currentMin = waTime.getMinutes();
      
      let sessionTime = '00:00';
      let sessionIndex = 1;
      
      // Find which session we're currently in (15-minute posting window)
      for (let i = 0; i < SESSIONS.length; i++) {
        const [sessionHour, sessionMin] = SESSIONS[i].split(':').map(Number);
        const nextSessionHour = i < SESSIONS.length - 1 
          ? parseInt(SESSIONS[i + 1].split(':')[0])
          : 24;
        
        if (currentHour === sessionHour && currentMin < 15) {
          // Within posting window
          sessionTime = SESSIONS[i];
          sessionIndex = i + 1;
          break;
        } else if (currentHour > sessionHour && currentHour < nextSessionHour) {
          // Between sessions, use the most recent one
          sessionTime = SESSIONS[i];
          sessionIndex = i + 1;
        }
      }

      console.log('📅 Session details:', {
        date: sessionDate,
        time: sessionTime,
        index: sessionIndex,
        timestamp,
      });

      // Post to Google Sheets via serverless API
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addEngagement',
          data: {
            session_date: sessionDate,
            timestamp: timestamp,
            session_time: sessionTime,
            session_index: sessionIndex.toString(),
            telegram_id: userData?.telegram_id || '',
            telegram_username: userData?.telegram_username || '',
            farcaster_username: userData?.farcaster_username || '',
            cast_hash: castHash,
            link: castUrl,
            status: 'pending',
            checked_at: '',
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to post');
      }

      console.log('✅ Post successful:', result);

      // Success!
      setCastUrl('');
      onPostSuccess();
      onClose();

    } catch (err: any) {
      console.error('❌ Error posting:', err);
      setError(err.message || 'Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="relative w-full max-w-lg bg-gradient-to-br from-[#001F3F] via-[#0a0a0a] to-[#001F3F] border-2 border-[#39FF14]/30 shadow-2xl shadow-[#39FF14]/20 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          disabled={isPosting}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39FF14] to-[#00FF41] flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white">Post to Feed</h2>
          </div>
          <p className="text-sm text-gray-400">
            Share your Warpcast engagement to earn rewards
          </p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Warpcast URL
            </label>
            <input
              type="url"
              value={castUrl}
              onChange={(e) => {
                setCastUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://warpcast.com/username/0x..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#39FF14]/50 focus:ring-2 focus:ring-[#39FF14]/20 transition-all"
              disabled={isPosting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 Paste your Warpcast post URL to submit your engagement. Make sure you've completed the required actions before posting!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white"
            disabled={isPosting}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            className="flex-1 bg-gradient-to-r from-[#39FF14] to-[#00FF41] hover:from-[#00FF41] hover:to-[#39FF14] text-black font-bold"
            disabled={isPosting || !castUrl.trim()}
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
