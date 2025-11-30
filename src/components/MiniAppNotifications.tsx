// MiniApp Notifications Component
// Allows users to add the miniapp and enable/disable notifications

'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Bell, BellOff, Check, Loader2, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    sdk?: {
      actions: {
        addMiniApp: () => Promise<{
          added: boolean;
          notificationDetails?: {
            token: string;
            url: string;
          };
        }>;
      };
    };
  }
}

export function MiniAppNotifications() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [addedToApp, setAddedToApp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isSubscribed = true;
    
    // Check if SDK is loaded
    const checkSDK = () => {
      if (window.sdk?.actions?.addMiniApp && isSubscribed) {
        setIsSDKLoaded(true);
        // Clear interval once SDK is loaded
        if (interval) {
          clearInterval(interval);
          interval = null;
          console.log('✅ MiniApp SDK loaded - stopped polling');
        }
      }
    };

    checkSDK();
    
    // Only set interval if SDK not already loaded
    if (!window.sdk?.actions?.addMiniApp) {
      interval = setInterval(checkSDK, 1000);
    }
    
    // Check localStorage for notification status
    const notifStatus = localStorage.getItem('basetribe_notifications_enabled');
    const appAddedStatus = localStorage.getItem('basetribe_app_added');
    
    if (notifStatus === 'true') {
      setNotificationsEnabled(true);
    }
    if (appAddedStatus === 'true') {
      setAddedToApp(true);
    }

    return () => {
      isSubscribed = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const handleAddMiniApp = async () => {
    if (!isSDKLoaded || !window.sdk) {
      setMessage({
        type: 'error',
        text: 'SDK not loaded. Please open this app in the Base or Farcaster app.',
      });
      return;
    }

    try {
      setIsAdding(true);
      setMessage(null);

      const result = await window.sdk.actions.addMiniApp();

      if (result.added) {
        setAddedToApp(true);
        localStorage.setItem('basetribe_app_added', 'true');
        
        if (result.notificationDetails) {
          setNotificationsEnabled(true);
          localStorage.setItem('basetribe_notifications_enabled', 'true');
          
          setMessage({
            type: 'success',
            text: '🎉 BaseTribe added! You\'ll get notified when sessions start.',
          });
        } else {
          setMessage({
            type: 'success',
            text: '✅ BaseTribe added to your app!',
          });
        }
      }
    } catch (error) {
      console.error('Error adding mini app:', error);
      setMessage({
        type: 'error',
        text: 'Failed to add app. Please try again.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Don't show if SDK not available (web browser)
  if (!isSDKLoaded) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#003366] border-2 border-[#39FF14]/30 p-6 shadow-2xl shadow-[#39FF14]/20">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#39FF14]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#00D4FF]/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                notificationsEnabled 
                  ? 'bg-[#39FF14]/20 border-2 border-[#39FF14]' 
                  : 'bg-white/10 border-2 border-white/30'
              }`}>
                {notificationsEnabled ? (
                  <Bell className="w-6 h-6 text-[#39FF14]" />
                ) : (
                  <BellOff className="w-6 h-6 text-white/60" />
                )}
              </div>
              {notificationsEnabled && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#39FF14] rounded-full border-2 border-[#001F3F] animate-pulse">
                  <Check className="w-3 h-3 text-[#001F3F] absolute top-0.5 left-0.5" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg">Session Notifications</h3>
              <p className="text-white/60 text-sm">
                {notificationsEnabled 
                  ? 'You\'ll be notified when sessions start' 
                  : 'Never miss an engagement session'}
              </p>
            </div>
          </div>
          
          {addedToApp && (
            <Badge className="bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Added
            </Badge>
          )}
        </div>

        {/* Description */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <p className="text-white/80 text-sm leading-relaxed">
            Add BaseTribe to your Base or Farcaster app to receive push notifications whenever new engagement sessions start. 
            You'll never miss a chance to earn $BTRIBE tokens! 🚀
          </p>
        </div>

        {/* Action Button */}
        {!addedToApp ? (
          <Button
            onClick={handleAddMiniApp}
            disabled={isAdding}
            className="w-full bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold py-6 rounded-xl shadow-lg shadow-[#39FF14]/40 transition-all hover:shadow-[#39FF14]/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Adding to App...
              </>
            ) : (
              <>
                <Bell className="w-5 h-5 mr-2" />
                Add to App & Enable Notifications
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#39FF14] text-sm font-medium">
              <Check className="w-4 h-4" />
              <span>BaseTribe is in your app</span>
            </div>
            {notificationsEnabled && (
              <div className="flex items-center gap-2 text-[#39FF14] text-sm font-medium">
                <Check className="w-4 h-4" />
                <span>Notifications enabled</span>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14]' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="text-[#39FF14] font-bold text-lg">6x</div>
            <div className="text-white/60 text-xs">Daily Sessions</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="text-[#39FF14] font-bold text-lg">15min</div>
            <div className="text-white/60 text-xs">Per Session</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
