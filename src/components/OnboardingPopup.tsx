// Onboarding Popup - Guided tutorial for first-time users

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ONBOARDING_STEPS = [
  "Ready to climb the Base leaderboard?",
  "Meet the community that helps you get discovered.",
  "Connect, comment, and rise together.",
  "More visibility. More rewards. More fun.",
  "Your tribe is waiting. Tap join on the top menu to join.",
];

const STEP_DELAY = 7000; // 7 seconds between steps

export function OnboardingPopup() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true); // Default to minimized so orb shows immediately
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user has seen onboarding before
    const completed = localStorage.getItem('basetribe_onboarding_completed');
    
    if (!completed) {
      // First time user - show onboarding expanded
      setIsMinimized(false);
      startOnboardingSequence();
    } else {
      // Returning user - show minimized orb (always visible)
      setHasSeenOnboarding(true);
      setIsMinimized(true);
    }
  }, []);

  const startOnboardingSequence = () => {
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      
      if (step < ONBOARDING_STEPS.length) {
        setCurrentStep(step);
      } else {
        // All steps complete - minimize but keep orb visible
        clearInterval(interval);
        setTimeout(() => {
          setIsMinimized(true);
          setHasSeenOnboarding(true);
          localStorage.setItem('basetribe_onboarding_completed', 'true');
        }, STEP_DELAY);
      }
    }, STEP_DELAY);
    
    setIntervalId(interval);
  };

  const handleNext = () => {
    // Clear any running interval
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Go to next step
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - minimize
      handleMinimize();
    }
  };

  const handleMinimize = () => {
    // Clear interval if running
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setIsMinimized(true);
    setHasSeenOnboarding(true);
    localStorage.setItem('basetribe_onboarding_completed', 'true');
  };

  const handleOrbClick = () => {
    // Reopen the onboarding when clicking the orb
    setIsMinimized(false);
    setCurrentStep(0); // Start from beginning
    
    // Restart the sequence
    startOnboardingSequence();
  };

  // Always show the orb - either expanded or minimized
  return (
    <>
      {/* Minimized State - Blue Orb (Always Visible) */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-40 right-6 z-40"
          >
            <button
              onClick={handleOrbClick}
              className="relative group"
              aria-label="Tribe Edge Guide"
            >
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-[#0052FF] rounded-full blur-xl opacity-50 animate-pulse" />
              
              {/* Main orb */}
              <div className="relative w-14 h-14 bg-gradient-to-br from-[#0052FF] to-[#003DB8] rounded-full border-2 border-[#00D4FF] shadow-lg shadow-[#0052FF]/50 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-[#0052FF] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  Tribe Edge
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State - Onboarding Messages */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="fixed bottom-40 right-6 z-40 max-w-sm"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-[#0052FF] via-[#003DB8] to-[#0052FF] border-2 border-[#00D4FF] shadow-2xl shadow-[#0052FF]/50">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              
              {/* Close/Minimize button */}
              <button
                onClick={handleMinimize}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Minimize"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Content */}
              <div className="relative p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white blur-md opacity-50 animate-pulse" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-white to-[#00D4FF] rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#0052FF]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Welcome to BaseTribe!</h3>
                    <p className="text-white/80 text-xs">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
                  </div>
                </div>

                {/* Message Display with Animation */}
                <div className="min-h-[80px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="text-white text-base leading-relaxed"
                    >
                      {ONBOARDING_STEPS[currentStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {ONBOARDING_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index <= currentStep
                          ? 'w-8 bg-white'
                          : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button - Always visible */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={handleNext}
                    className="w-full bg-white hover:bg-white/90 text-[#0052FF] font-bold py-3 rounded-xl shadow-lg transition-all hover:shadow-white/50"
                  >
                    {currentStep === ONBOARDING_STEPS.length - 1 ? (
                      <>Let's Go! 🚀</>
                    ) : (
                      <>
                        Next <ChevronRight className="w-4 h-4 ml-1 inline" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full" />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}