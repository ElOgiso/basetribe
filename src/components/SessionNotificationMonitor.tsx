// Session Notification Monitor
// Monitors session changes and sends notifications when sessions start

'use client';

import { useEffect, useRef } from 'react';
import { SESSIONS, ENGAGEMENT_RULES } from '@/lib/constants';
import { sendSessionStartNotification, formatSessionNotification } from '@/lib/notifications';

export function SessionNotificationMonitor() {
  const lastSessionRef = useRef<string | null>(null);
  const notificationSentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // ⚠️ DISABLED: Causes CORS errors with ENGAGEMENT_BOT_URL
    // This component is not used in production - kept for reference only
    return; // Early return - do nothing
    
    const checkAndNotify = async () => {
      const now = new Date();
      const waTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));

      // Check if we're in an active session (15-minute window)
      for (let i = 0; i < SESSIONS.length; i++) {
        const sessionTime = SESSIONS[i];
        const [sessionHour, sessionMin] = sessionTime.split(':').map(Number);
        
        const sessionDate = new Date(waTime);
        sessionDate.setHours(sessionHour, sessionMin, 0, 0);
        
        const sessionEnd = new Date(sessionDate.getTime() + 15 * 60 * 1000); // 15 min window
        
        if (waTime >= sessionDate && waTime < sessionEnd) {
          // We're in an active session
          const sessionKey = `${sessionTime}-${sessionDate.toDateString()}`;
          
          // Check if we've already sent notification for this session
          if (!notificationSentRef.current.has(sessionKey)) {
            console.log(`🔔 Session ${sessionTime} is now LIVE - sending notifications`);
            
            // Send notification
            const rule = ENGAGEMENT_RULES[sessionTime as keyof typeof ENGAGEMENT_RULES];
            const result = await sendSessionStartNotification({
              sessionTime,
              sessionNumber: i + 1,
              rule: rule?.text || 'Engage now',
            });
            
            if (result.success) {
              // Mark this session as notified
              notificationSentRef.current.add(sessionKey);
              
              // Clean up old sessions from the set (keep last 10)
              if (notificationSentRef.current.size > 10) {
                const firstKey = Array.from(notificationSentRef.current)[0];
                notificationSentRef.current.delete(firstKey);
              }
              
              console.log(`✅ Notification sent for session ${sessionTime}`);
            } else {
              console.warn(`⚠️ Failed to send notification for session ${sessionTime}:`, result.error);
            }
          }
          
          lastSessionRef.current = sessionTime;
          return;
        }
      }
      
      // Not in any session
      lastSessionRef.current = null;
    };

    // Check immediately
    checkAndNotify();

    // Check every 30 seconds
    const interval = setInterval(checkAndNotify, 30000);

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything visible
  return null;
}
