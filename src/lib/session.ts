// session.ts - Session state management utilities

import { SESSIONS } from './constants';

export interface SessionState {
  isActive: boolean;
  currentSession: string | null;
  timeRemaining: string;
  nextSession: string;
}

/**
 * Check if a session is currently active (within 15-minute window)
 */
export function getSessionState(): SessionState {
  const now = new Date();
  const waTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));

  // Check if we're in an active session (15-minute window)
  for (let i = 0; i < SESSIONS.length; i++) {
    const sessionTime = SESSIONS[i];
    const nextSession = SESSIONS[(i + 1) % SESSIONS.length];
    
    const [sessionHour, sessionMin] = sessionTime.split(':').map(Number);
    
    const sessionDate = new Date(waTime);
    sessionDate.setHours(sessionHour, sessionMin, 0, 0);
    
    const sessionEnd = new Date(sessionDate.getTime() + 15 * 60 * 1000); // 15 min window
    
    if (waTime >= sessionDate && waTime < sessionEnd) {
      // Session is active
      const remaining = Math.floor((sessionEnd.getTime() - waTime.getTime()) / 1000);
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      
      return {
        isActive: true,
        currentSession: sessionTime,
        timeRemaining: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        nextSession,
      };
    }
  }
  
  // No active session - find the next upcoming session
  let closestSession = null;
  let minTimeDiff = Infinity;
  
  for (let i = 0; i < SESSIONS.length; i++) {
    const sessionTime = SESSIONS[i];
    const [sessionHour, sessionMin] = sessionTime.split(':').map(Number);
    
    const sessionDate = new Date(waTime);
    sessionDate.setHours(sessionHour, sessionMin, 0, 0);
    
    // If session time has passed today, check tomorrow
    if (sessionDate <= waTime) {
      sessionDate.setDate(sessionDate.getDate() + 1);
    }
    
    const timeDiff = sessionDate.getTime() - waTime.getTime();
    
    if (timeDiff > 0 && timeDiff < minTimeDiff) {
      minTimeDiff = timeDiff;
      closestSession = {
        time: sessionTime,
        sessionDate: sessionDate,
      };
    }
  }
  
  // Display the next upcoming session
  if (closestSession) {
    const remaining = Math.floor((closestSession.sessionDate.getTime() - waTime.getTime()) / 1000);
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    return {
      isActive: false,
      currentSession: null,
      timeRemaining: hours > 0 
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`,
      nextSession: closestSession.time,
    };
  }

  // Fallback
  return {
    isActive: false,
    currentSession: null,
    timeRemaining: '0:00',
    nextSession: SESSIONS[0],
  };
}

/**
 * Check if user is a full member
 */
export function isFullMember(userData: any): boolean {
  if (!userData) return false;
  
  // Check if status is "full member" (case insensitive)
  const status = (userData.status || '').toLowerCase();
  return status === 'full member';
}

/**
 * Check if user can post (is full member AND session is active)
 */
export function canUserPost(userData: any): { canPost: boolean; reason?: string } {
  console.log('🔍 Checking if user can post:', { userData });
  
  if (!userData) {
    console.log('❌ Cannot post: Not connected');
    return { canPost: false, reason: 'Not connected' };
  }

  const status = (userData.status || '').toLowerCase();
  console.log('👤 User status:', status);
  
  if (!isFullMember(userData)) {
    console.log('❌ Cannot post: Full member status required. Current status:', userData.status);
    return { canPost: false, reason: 'Full member status required' };
  }

  const sessionState = getSessionState();
  console.log('⏰ Session state:', sessionState);
  
  if (!sessionState.isActive) {
    console.log('❌ Cannot post: No active session');
    return { canPost: false, reason: 'No active session' };
  }

  console.log('✅ User can post!');
  return { canPost: true };
}