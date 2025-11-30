// Farcaster SDK Provider
// Loads and initializes the Farcaster MiniApp SDK

'use client';

import { useEffect, useState } from 'react';
import { CONFIG } from '@/lib/constants';

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
      context: {
        client: {
          fid: number;
          displayName?: string;
          username?: string;
          pfpUrl?: string;
        };
      };
    };
  }
}

interface FarcasterSDKProviderProps {
  children: React.ReactNode;
}

export function FarcasterSDKProvider({ children }: FarcasterSDKProviderProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    // Load Farcaster SDK from CDN
    const loadSDK = () => {
      // Check if SDK is already loaded
      if (window.sdk) {
        setIsSDKLoaded(true);
        console.log('✅ Farcaster SDK already loaded');
        return;
      }

      // Create script tag to load SDK
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@farcaster/miniapp-sdk@latest/dist/index.js';
      script.async = true;
      
      script.onload = () => {
        if (window.sdk) {
          setIsSDKLoaded(true);
          console.log('✅ Farcaster SDK loaded successfully');
          
          // Log context if available
          if (window.sdk.context?.client) {
            console.log('👤 User context:', {
              fid: window.sdk.context.client.fid,
              username: window.sdk.context.client.username,
            });
          }
        } else {
          console.warn('⚠️ SDK script loaded but window.sdk not available');
        }
      };
      
      script.onerror = () => {
        console.warn('⚠️ Failed to load Farcaster SDK - app may not be running in Farcaster/Base app');
      };
      
      document.head.appendChild(script);
    };

    loadSDK();

    // Cleanup
    return () => {
      // SDK cleanup if needed
    };
  }, []);

  return <>{children}</>;
}

/**
 * Hook to check if SDK is loaded and ready
 */
export function useFarcasterSDK() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userContext, setUserContext] = useState<{
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isSubscribed = true;
    
    const checkSDK = () => {
      if (window.sdk && isSubscribed) {
        setIsLoaded(true);
        
        if (window.sdk.context?.client) {
          setUserContext({
            fid: window.sdk.context.client.fid,
            username: window.sdk.context.client.username,
            displayName: window.sdk.context.client.displayName,
            pfpUrl: window.sdk.context.client.pfpUrl,
          });
        }
        
        // Clear interval once SDK is loaded
        if (interval) {
          clearInterval(interval);
          interval = null;
          console.log('✅ Farcaster SDK loaded - stopped polling');
        }
      }
    };

    checkSDK();
    
    // Only set interval if SDK not already loaded
    if (!window.sdk) {
      interval = setInterval(checkSDK, 1000);
    }

    return () => {
      isSubscribed = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return {
    isLoaded,
    userContext,
    addMiniApp: window.sdk?.actions?.addMiniApp,
  };
}
