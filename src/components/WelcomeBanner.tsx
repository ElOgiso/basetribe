// World-Class Sharable Welcome Banner
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Share2, Download, Sparkles, Trophy, Coins, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { UserData } from '../lib/types';
import baseTribeLogo from '../assets/logo.png';

interface WelcomeBannerProps {
  userData: UserData | null;
  isVisible: boolean;
  onClose: () => void;
}

export function WelcomeBanner({ userData, isVisible, onClose }: WelcomeBannerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  const captureImage = async (): Promise<Blob | null> => {
    if (!bannerRef.current) return null;

    try {
      setIsProcessing(true);

      // Hide buttons before capture
      const buttons = bannerRef.current.querySelectorAll('.hide-on-capture');
      buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;

      // Capture the banner
      const canvas = await html2canvas(bannerRef.current, {
        backgroundColor: '#001F3F',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Show buttons again
      buttons.forEach(btn => (btn as HTMLElement).style.display = '');
      setIsProcessing(false);

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Failed to capture image:', error);
      
      // Always restore buttons even on error
      const buttons = bannerRef.current?.querySelectorAll('.hide-on-capture');
      buttons?.forEach(btn => (btn as HTMLElement).style.display = '');
      setIsProcessing(false);
      
      alert('Failed to capture image. Please try again.');
      return null;
    }
  };

  const handleShare = async () => {
    try {
      setIsProcessing(true);
      
      // Capture the banner as an image
      const blob = await captureImage();
      
      if (!blob) {
        setIsProcessing(false);
        return;
      }

      const file = new File([blob], `basetribe-${userData?.farcaster_username || 'member'}.png`, { 
        type: 'image/png' 
      });

      const shareText = `I'm part of the BaseTribe! 🚀 ${userData?.btribe_balance || 0} $BTRIBE earned | ${userData?.stars || 0} ⭐ Stars | Join the movement!`;

      // Check if navigator.share supports files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'BaseTribe - Building on Base Together',
            text: shareText,
            url: window.location.origin,
          });
          setIsProcessing(false);
        } catch (err: any) {
          // User cancelled or share failed
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
            // Fallback to download
            downloadBlob(blob, `basetribe-${userData?.farcaster_username || 'member'}.png`);
          }
          setIsProcessing(false);
        }
      } else {
        // Fallback: Download the image instead
        downloadBlob(blob, `basetribe-${userData?.farcaster_username || 'member'}.png`);
        
        // Also copy text to clipboard
        try {
          await navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
          alert('Image downloaded and share text copied to clipboard!');
        } catch {
          alert('Image downloaded successfully!');
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to share. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsProcessing(true);

      // Capture the banner as an image
      const blob = await captureImage();
      
      if (!blob) {
        setIsProcessing(false);
        return;
      }

      // Download the image
      downloadBlob(blob, `basetribe-${userData?.farcaster_username || 'member'}.png`);
      
      setIsProcessing(false);
      
      // Show success feedback
      setTimeout(() => {
        alert('✅ Banner downloaded successfully!');
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  const totalBalance = (userData?.btribe_balance || 0) + (userData?.jesse_balance || 0);
  const stars = userData?.stars || 0;
  const streak = userData?.session_streak || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      {/* Animated particles background - reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#39FF14] rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Main Banner - Compact mobile size */}
      <div
        ref={bannerRef}
        className={`relative w-full max-w-[340px] sm:max-w-md md:max-w-lg transform transition-all duration-700 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close button - smaller on mobile */}
        <button
          onClick={onClose}
          className="hide-on-capture absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform touch-manipulation"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>

        {/* Banner Content - Compact mobile padding */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#1a0033] border border-[#39FF14]/30 sm:border-2 shadow-2xl">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/10 via-transparent to-purple-500/10 animate-pulse" />
          
          {/* Glow effects - scaled down on mobile */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-[#39FF14]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-purple-500/20 rounded-full blur-3xl" />

          {/* Content - Reduced padding on mobile */}
          <div className="relative z-10 p-4 sm:p-6 md:p-8">
            {/* Header with Logo - Compact on mobile */}
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#39FF14]/30 blur-lg rounded-full animate-pulse" />
               <img 
                 src={baseTribeLogo}
                  alt="BaseTribe" 
                  className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-[#39FF14] shadow-lg"
                />
              </div>
            </div>

            {/* Welcome Message - Compact on mobile */}
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-[#39FF14] via-white to-purple-400 bg-clip-text text-transparent">
                Welcome to BaseTribe!
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium">
                {userData?.farcaster_username ? `@${userData.farcaster_username}` : 'Builder'}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#39FF14] animate-pulse" />
                <p className="text-xs sm:text-sm md:text-base text-[#39FF14] font-bold tracking-wide">
                  TOGETHER WE BUILD
                </p>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#39FF14] animate-pulse" />
              </div>
            </div>

            {/* Stats Grid - Compact mobile version */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {/* Total Balance */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/20 to-purple-500/20 rounded-xl blur-lg transition-all" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 sm:p-4 hover:border-[#39FF14]/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-[#39FF14] mb-1" />
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                      {totalBalance.toLocaleString()}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 font-medium mt-0.5">Tokens</p>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl blur-lg transition-all" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 sm:p-4 hover:border-yellow-500/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mb-1" />
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                      {stars}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 font-medium mt-0.5">Stars</p>
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-lg transition-all" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 sm:p-4 hover:border-purple-500/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-1" />
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                      {streak}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 font-medium mt-0.5">Streak</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Balance Breakdown - Compact mobile */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#39FF14]" />
                Token Holdings
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-white/70">$BTRIBE:</span>
                  <span className="text-base sm:text-xl font-black text-[#39FF14]">
                    {(userData?.btribe_balance || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-white/70">$JESSE:</span>
                  <span className="text-base sm:text-xl font-black text-purple-400">
                    {(userData?.jesse_balance || 0).toLocaleString()}
                  </span>
                </div>
                {userData?.usdc_claims > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-white/70">USDC:</span>
                    <span className="text-base sm:text-xl font-black text-green-400">
                      ${(userData?.usdc_claims || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA & Share Buttons - Compact mobile */}
            <div className="hide-on-capture flex flex-col gap-2 sm:gap-3">
              <Button
                onClick={handleShare}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#39FF14] to-green-500 hover:from-[#39FF14]/90 hover:to-green-500/90 text-black font-bold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-[#39FF14]/50 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                )}
                <span className="text-sm sm:text-base">
                  {isProcessing ? 'Processing...' : 'Share Stats'}
                </span>
              </Button>
              <Button
                onClick={handleDownload}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-500/90 hover:to-pink-500/90 text-white font-bold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                )}
                <span className="text-sm sm:text-base">
                  {isProcessing ? 'Processing...' : 'Download'}
                </span>
              </Button>
            </div>

            {/* Footer tagline - Smaller on mobile */}
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-[10px] sm:text-xs text-white/50 font-medium">
                Building the future of Base 🚀
              </p>
            </div>
          </div>

          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-3xl border-2 border-[#39FF14]/0 group-hover:border-[#39FF14]/50 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
