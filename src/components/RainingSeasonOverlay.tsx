// Raining Season Overlay - Transparent animated overlay with rain effects and claim functionality

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Droplets, Trophy, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { CONFIG } from '@/lib/constants';

interface RainingSeasonOverlayProps {
  isConnected: boolean;
  userFid: string | null;
  onClaimSuccess?: () => void;
}

interface RainStatus {
  isRaining: boolean;
  hasRaidBadge: boolean;
  canClaim: boolean;
  rainClaimed: boolean;
  winner: string | null;
}

interface Raindrop {
  id: number;
  x: number;
  delay: number;
  duration: number;
  drift: number;
}

export function RainingSeasonOverlay({ isConnected, userFid, onClaimSuccess }: RainingSeasonOverlayProps) {
  const [rainStatus, setRainStatus] = useState<RainStatus>({
    isRaining: false,
    hasRaidBadge: false,
    canClaim: false,
    rainClaimed: false,
    winner: null,
  });
  
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Generate random raindrops for animation
  useEffect(() => {
    if (!rainStatus.isRaining) {
      setRaindrops([]);
      return;
    }

    // Generate 15 raindrops with random positions and timing
    const drops: Raindrop[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random X position (0-100%)
      delay: Math.random() * 3, // Random delay (0-3s)
      duration: 2 + Math.random() * 1.5, // Random duration (2-3.5s)
      drift: (Math.random() - 0.5) * 20, // Random drift (-10 to +10)
    }));

    setRaindrops(drops);
  }, [rainStatus.isRaining]);

  // Poll rain status every 10 seconds
  useEffect(() => {
    // ⚠️ DISABLED: Rain feature requires backend deployment
    // Uncomment when backend is ready to avoid CORS errors
    return;
    
    if (!isConnected || !userFid) return;

    const checkRainStatus = async () => {
      try {
        const response = await fetch(CONFIG.ENGAGEMENT_BOT_URL, {
          method: 'POST',
          mode: 'no-cors', // ✅ Prevent CORS errors
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'check_rain_status',
            fid: userFid,
          }),
        });

        // With no-cors mode, we can't read response
        console.log('🌧️ Rain status check sent (no-cors mode)');
      } catch (error) {
        // Network error - fail silently
        console.log('ℹ️ Rain feature backend not available (this is OK)');
      }
    };

    // Check immediately on mount
    checkRainStatus();

    // ⚠️ DISABLED: Polling disabled to prevent API spam since feature is not yet deployed
    // Poll every 10 seconds
    // const interval = setInterval(checkRainStatus, 10000);

    // return () => clearInterval(interval);
  }, [isConnected, userFid]);

  // Handle claim action
  const handleClaim = async () => {
    if (!userFid || isClaiming) return;

    // ⚠️ DISABLED: Rain feature requires backend deployment
    toast.error('Rain feature coming soon! Backend not yet deployed.');
    return;

    setIsClaiming(true);

    try {
      const response = await fetch(CONFIG.ENGAGEMENT_BOT_URL, {
        method: 'POST',
        mode: 'no-cors', // ✅ Prevent CORS errors
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'claim_rain',
          fid: userFid,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Success! User won the rain
        setShowConfetti(true);
        toast.success(
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#FFD700]" />
            <div>
              <p className="font-bold text-lg">🎉 You Won!</p>
              <p className="text-sm">You claimed ${data.reward} {data.currency}!</p>
            </div>
          </div>,
          { duration: 6000 }
        );

        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);

        // Trigger callback to refresh user data
        if (onClaimSuccess) {
          onClaimSuccess();
        }

        // Update status
        setRainStatus(prev => ({
          ...prev,
          canClaim: false,
          rainClaimed: true,
          winner: 'You',
        }));
      } else {
        // Failed - someone else claimed it
        toast.error(
          <div>
            <p className="font-bold">⚡ Too Slow!</p>
            <p className="text-sm">{data.message}</p>
          </div>,
          { duration: 5000 }
        );

        // Refresh status to show winner
        setTimeout(() => {
          // Re-check status to update UI
          setRainStatus(prev => ({
            ...prev,
            canClaim: false,
            rainClaimed: true,
          }));
        }, 1000);
      }
    } catch (error) {
      console.error('Error claiming rain:', error);
      toast.error('Failed to claim. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Don't render anything if not raining
  if (!rainStatus.isRaining) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Confetti celebration overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50"
          >
            {/* Confetti particles */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                  scale: [0, 1.5, 1],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut',
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#FFD700', '#39FF14', '#00D4FF', '#7B2CBF'][Math.floor(Math.random() * 4)],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rain clouds at top */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, 0],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 left-0 w-full h-full"
        >
          {/* Cloud 1 */}
          <div className="absolute top-0 left-[10%] w-32 h-20">
            <div className="absolute inset-0 bg-[#00D4FF]/30 blur-2xl rounded-full animate-pulse"></div>
            <Cloud className="absolute top-2 left-2 w-28 h-16 text-[#00D4FF]/50" />
          </div>
          
          {/* Cloud 2 */}
          <div className="absolute top-2 right-[15%] w-40 h-24">
            <div className="absolute inset-0 bg-[#0095FF]/30 blur-2xl rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <Cloud className="absolute top-2 left-2 w-36 h-20 text-[#0095FF]/50" />
          </div>

          {/* Cloud 3 */}
          <div className="absolute top-4 left-[40%] w-36 h-22">
            <div className="absolute inset-0 bg-[#00D4FF]/30 blur-2xl rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            <Cloud className="absolute top-2 left-2 w-32 h-18 text-[#00D4FF]/50" />
          </div>
        </motion.div>
      </div>

      {/* Status message at top center */}
      <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#001F3F]/80 backdrop-blur-md border border-[#00D4FF]/50 rounded-2xl px-6 py-3 shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#00D4FF] animate-pulse" />
            <span className="text-white font-bold text-sm">
              {rainStatus.rainClaimed && rainStatus.winner
                ? `🏆 Rain claimed by @${rainStatus.winner}!`
                : rainStatus.canClaim
                ? '🌧️ Raining Season Active - Claim Now!'
                : '🌧️ Raining Season Active - Only active raiders can claim'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Raid Badge (if user has it) */}
      {rainStatus.hasRaidBadge && (
        <div className="absolute top-6 right-6 pointer-events-none z-50">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#39FF14]/50 blur-xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-[#39FF14] to-[#2ECC11] rounded-full p-3 border-2 border-white/30 shadow-2xl">
              <Shield className="w-6 h-6 text-[#001F3F]" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-[#001F3F]/90 rounded-lg px-2 py-1 text-[10px] font-bold text-[#39FF14] border border-[#39FF14]/30">
                RAIDER
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Regular falling raindrops (background) */}
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          initial={{
            x: `${drop.x}%`,
            y: -50,
            opacity: 0,
          }}
          animate={{
            x: [`${drop.x}%`, `${drop.x + drop.drift}%`],
            y: '110vh',
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute pointer-events-none"
          style={{ top: 0 }}
        >
          <div className="relative w-8 h-10">
            {/* Raindrop shape with USDC coin inside */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/40 to-[#0095FF]/60 rounded-full backdrop-blur-sm">
              <div className="absolute inset-0 rounded-full border border-[#00D4FF]/30"></div>
              {/* Tiny USDC icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center text-[8px] font-bold text-[#2775CA]">
                  $
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* BIG CLAIM RAINDROP (only if user can claim) */}
      <AnimatePresence>
        {rainStatus.canClaim && !rainStatus.rainClaimed && (
          <motion.div
            initial={{ scale: 0, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 100 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-50"
          >
            {/* CLAIM HITBOX - Clickable area */}
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="relative group disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="Claim Rain Reward"
            >
              {/* Pulsing outer ring */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 -m-8 rounded-full border-4 border-[#00D4FF] blur-sm"
              ></motion.div>

              {/* Neon glow */}
              <div className="absolute inset-0 -m-6 bg-[#00D4FF] blur-3xl opacity-60 rounded-full animate-pulse"></div>

              {/* Big raindrop body */}
              <div className="relative w-32 h-40 group-hover:scale-110 transition-transform">
                {/* Glossy raindrop */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#00D4FF] via-[#0095FF] to-[#0077CC] rounded-full backdrop-blur-xl shadow-2xl border-2 border-white/30">
                  {/* Highlight shine */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/40 rounded-full blur-md"></div>
                  
                  {/* Rotating USDC coin inside */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#2775CA]"
                    >
                      <span className="text-3xl font-bold text-[#2775CA]">$</span>
                    </motion.div>
                  </div>

                  {/* CLAIM label */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="bg-[#39FF14] text-[#001F3F] px-6 py-2 rounded-full font-bold text-sm shadow-xl border-2 border-white/50"
                    >
                      {isClaiming ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Zap className="w-4 h-4" />
                          </motion.div>
                          CLAIMING...
                        </span>
                      ) : (
                        'TAP TO CLAIM'
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Sparkles around the big drop */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.25,
                    }}
                    className="absolute w-2 h-2 bg-[#FFD700] rounded-full"
                    style={{
                      top: `${20 + Math.sin((i / 6) * Math.PI * 2) * 40}%`,
                      left: `${50 + Math.cos((i / 6) * Math.PI * 2) * 50}%`,
                    }}
                  />
                ))}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}