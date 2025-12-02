// OnboardingPopup - Reminder slideshow for new users

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Rocket, Send, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import baseTribeLogo from '../assets/logo.png';

interface ReminderSlide {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: {
    text: string;
    link: string;
  };
}

interface OnboardingPopupProps {
  onNavigate?: (tab: string) => void;
}

export function OnboardingPopup({ onNavigate }: OnboardingPopupProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasAutoShown, setHasAutoShown] = useState(false);

  const slides: ReminderSlide[] = [
    {
      id: 1,
      icon: <Rocket className="w-12 h-12 text-[#39FF14]" />,
      title: "Welcome to BaseTribe!",
      description: "Ready to earn $BTRIBE tokens? Let's show you how to get started with daily raids and missions.",
    },
    {
      id: 2,
      icon: <TrendingUp className="w-12 h-12 text-[#39FF14]" />,
      title: "Start Earning Now!",
      description: "Check out the Raid Starter Tasks in the app. Complete simple engagement missions and earn $BTRIBE tokens instantly!",
    },
    {
      id: 3,
      icon: <Users className="w-12 h-12 text-[#39FF14]" />,
      title: "Get Full Access",
      description: "Visit the Join page to complete your profile and unlock all features. Become a Full Member and participate in live raid sessions with more reward opportunities!",
      cta: {
        text: "Go to Join Page",
        link: "join",
      },
    },
  ];

  // Auto-show popup after 3 minutes on first visit
  useEffect(() => {
    const hasShown = localStorage.getItem('basetribe_reminder_shown');
    
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsMinimized(false);
        setHasAutoShown(true);
      }, 180000); // 3 minutes

      return () => clearTimeout(timer);
    } else {
      setHasAutoShown(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    setIsMinimized(true);
    setCurrentSlide(0);
    localStorage.setItem('basetribe_reminder_shown', 'true');
  };

  const handleOrbClick = () => {
    setIsMinimized(false);
  };

  const handleCTA = (link: string) => {
    // Check if it's a tab navigation
    if (link === 'join' && onNavigate) {
      onNavigate('join');
      handleClose();
    } else if (link.startsWith('#')) {
      // Internal navigation
      const element = document.querySelector(link);
      element?.scrollIntoView({ behavior: 'smooth' });
      handleClose();
    } else {
      // External link
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <>
      {/* Minimized State - BaseTribe Logo Orb */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-4 z-[9999]"
          >
            <button
              onClick={handleOrbClick}
              className="relative group"
              aria-label="BaseTribe Quick Start"
            >
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-[#39FF14] rounded-full blur-xl opacity-60 animate-pulse" />
              
              {/* Main orb with BaseTribe logo */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#001F3F] to-[#002855] rounded-full border-4 border-[#39FF14] shadow-2xl shadow-[#39FF14]/60 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 overflow-hidden">
                <img 
                  src={baseTribeLogo} 
                  alt="BaseTribe" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-[#39FF14] text-[#001F3F] text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  Quick Start Guide
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State - Slideshow Card */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.9, opacity: 0, x: 100 }}
            className="fixed bottom-32 right-4 z-[9999] w-[90vw] sm:w-[380px] max-w-[420px]"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#003366] border-2 border-[#39FF14] shadow-2xl shadow-[#39FF14]/30">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all group"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
              </button>

              {/* Slide Content */}
              <div className="p-6 pt-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-[#39FF14]/20 to-[#39FF14]/5 rounded-2xl flex items-center justify-center border border-[#39FF14]/30">
                      {currentSlideData.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {currentSlideData.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/80 text-sm leading-relaxed">
                      {currentSlideData.description}
                    </p>

                    {/* CTA Button */}
                    {currentSlideData.cta && (
                      <Button
                        onClick={() => handleCTA(currentSlideData.cta!.link)}
                        className="w-full bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#39FF14]/30"
                      >
                        {currentSlideData.cta.text}
                      </Button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="px-6 pb-6">
                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? 'w-8 bg-[#39FF14]'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-3">
                  <Button
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    variant="outline"
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold"
                  >
                    {currentSlide === slides.length - 1 ? (
                      'Got It!'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0052FF]/10 rounded-full blur-3xl" />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}