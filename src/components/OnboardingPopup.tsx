// OnboardingPopup - Chat-based onboarding with live backend verification

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, CheckCircle, AlertCircle, Loader2, Gift, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner@2.0.3';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  component?: 'input' | 'buttons' | 'reward';
  metadata?: any;
}

type OnboardingStep = 
  | 'welcome' 
  | 'ask_username' 
  | 'verifying' 
  | 'verified' 
  | 'failed' 
  | 'ask_base_username' 
  | 'completing' 
  | 'success' 
  | 'reward';

export function OnboardingPopup() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // User data
  const [farcasterUsername, setFarcasterUsername] = useState('');
  const [farcasterFid, setFarcasterFid] = useState('');
  const [followers, setFollowers] = useState(0);
  const [userStatus, setUserStatus] = useState('');
  const [baseUsername, setBaseUsername] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardToken, setRewardToken] = useState('');
  const [claimed, setClaimed] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('basetribe_onboarding_completed');
    
    if (!completed) {
      setIsMinimized(false);
      addBotMessage('👋 Welcome to BaseTribe!\nLet\'s get you verified and unlock full access.');
      setCurrentStep('welcome');
    } else {
      setHasSeenOnboarding(true);
      setIsMinimized(true);
    }
  }, []);

  const addBotMessage = (content: string, isLoading = false, component?: 'input' | 'buttons' | 'reward', metadata?: any) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      isLoading,
      component,
      metadata,
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleStart = () => {
    // Remove loading state from bot message
    setMessages(prev => prev.map(msg => ({ ...msg, isLoading: false })));
    
    setTimeout(() => {
      addBotMessage('What is your username?\n(Do not include @)', false, 'input');
      setCurrentStep('ask_username');
    }, 800);
  };

  const handleUsernameSubmit = async () => {
    if (!inputValue.trim()) {
      toast.error('Please enter a username');
      return;
    }

    const username = inputValue.trim().replace('@', '');
    setFarcasterUsername(username);
    addUserMessage(username);
    setInputValue('');
    setIsProcessing(true);

    // Show verifying message
    setTimeout(() => {
      addBotMessage('Verifying your username… 🔍', true);
      setCurrentStep('verifying');
    }, 500);

    // Call backend API
    try {
      const response = await fetch('/api/onboarding/verify-farcaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      if (data.success && data.fid) {
        // Verified!
        setFarcasterFid(data.fid);
        setFollowers(data.followers || 0);
        setUserStatus(data.status || 'New Member');

        setTimeout(() => {
          addBotMessage(
            `✅ Verified!\nFID: ${data.fid}\nFollowers: ${data.followers || 0}\nYou are a ${data.status || 'New Member'}.`
          );
          setCurrentStep('verified');

          setTimeout(() => {
            addBotMessage('Great! Now enter your Base username.', false, 'input');
            setCurrentStep('ask_base_username');
          }, 2000);
        }, 800);
      } else {
        // Failed
        setTimeout(() => {
          addBotMessage('❌ Username not found.\nPlease check spelling and try again.', false, 'buttons', { retry: true });
          setCurrentStep('failed');
        }, 800);
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      setTimeout(() => {
        addBotMessage('❌ Network error. Please try again.', false, 'buttons', { retry: true });
        setCurrentStep('failed');
      }, 800);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBaseUsernameSubmit = async () => {
    if (!inputValue.trim()) {
      toast.error('Please enter your Base username');
      return;
    }

    const baseUser = inputValue.trim();
    setBaseUsername(baseUser);
    addUserMessage(baseUser);
    setInputValue('');
    setIsProcessing(true);

    // Show completing message
    setTimeout(() => {
      addBotMessage('Speaking to tribe chief about you… ⚡', true);
      setCurrentStep('completing');
    }, 500);

    // Call backend API to complete onboarding
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farcasterUsername,
          farcasterFid,
          baseUsername: baseUser,
          followers,
        }),
      });

      const data = await response.json();

      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      if (data.success) {
        setTimeout(() => {
          addBotMessage('🎉 You\'re all set!\nWelcome to the tribe.');
          setCurrentStep('success');

          // Check if user gets a reward
          if (data.reward && data.reward.amount > 0) {
            setTimeout(() => {
              setRewardAmount(data.reward.amount);
              setRewardToken(data.reward.token);
              addBotMessage('', false, 'reward', { amount: data.reward.amount, token: data.reward.token });
              setCurrentStep('reward');
            }, 1500);
          } else {
            // No reward, complete onboarding
            setTimeout(() => {
              completeOnboarding();
            }, 2000);
          }
        }, 1000);
      } else {
        setTimeout(() => {
          addBotMessage('❌ Something went wrong. Please try again.', false, 'buttons', { retry: true });
        }, 800);
      }
    } catch (error) {
      console.error('❌ Completion error:', error);
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      setTimeout(() => {
        addBotMessage('❌ Network error. Please try again.', false, 'buttons', { retry: true });
      }, 800);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimReward = async () => {
    if (claimed) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/onboarding/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farcasterFid,
          amount: rewardAmount,
          token: rewardToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClaimed(true);
        toast.success(`🎉 Claimed ${rewardAmount} $${rewardToken}!`);
        
        setTimeout(() => {
          completeOnboarding();
        }, 2000);
      } else {
        toast.error('Failed to claim reward. Please contact support.');
      }
    } catch (error) {
      console.error('❌ Claim error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('basetribe_onboarding_completed', 'true');
    setHasSeenOnboarding(true);
    
    setTimeout(() => {
      setIsMinimized(true);
      toast.success('Welcome to BaseTribe! 🎉');
    }, 500);
  };

  const handleRetry = () => {
    setMessages([]);
    setCurrentStep('welcome');
    setFarcasterUsername('');
    setFarcasterFid('');
    setBaseUsername('');
    
    setTimeout(() => {
      addBotMessage('👋 Welcome to BaseTribe!\nLet\'s get you verified and unlock full access.');
    }, 300);
  };

  const handleOrbClick = () => {
    setIsMinimized(false);
    
    if (hasSeenOnboarding) {
      // Show completed state
      setMessages([]);
      addBotMessage('Welcome back! You\'ve already completed onboarding.');
      setTimeout(() => {
        addBotMessage('Explore the app to start earning $BTRIBE tokens! 💰');
      }, 1000);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      if (currentStep === 'ask_username') {
        handleUsernameSubmit();
      } else if (currentStep === 'ask_base_username') {
        handleBaseUsernameSubmit();
      }
    }
  };

  return (
    <>
      {/* Minimized State - Blue Orb */}
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
              aria-label="BaseTribe Onboarding"
            >
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-[#4169E1] rounded-full blur-xl opacity-50 animate-pulse" />
              
              {/* Main orb */}
              <div className="relative w-14 h-14 bg-gradient-to-br from-[#4169E1] to-[#5B3FD6] rounded-full border-2 border-[#00D4FF] shadow-lg shadow-[#4169E1]/50 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-[#4169E1] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  Get Started
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State - Chat Interface */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            <Card className="relative overflow-hidden bg-white border-2 border-[#E5E7EB] shadow-2xl flex flex-col" style={{ height: '600px', maxHeight: '80vh' }}>
              {/* Header */}
              <div className="bg-gradient-to-r from-[#4169E1] to-[#5B3FD6] px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white blur-md opacity-50 animate-pulse" />
                    <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#4169E1]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">BaseTribe Onboarding</h3>
                    <p className="text-white/80 text-xs">Get verified & join the tribe</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Minimize"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Chat Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Bot Message */}
                    {message.type === 'bot' && (
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#4169E1] to-[#5B3FD6] rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            {message.isLoading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-[#4169E1]" />
                                <span className="text-gray-600 text-sm">Processing...</span>
                              </div>
                            ) : (
                              <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          {message.component === 'buttons' && (
                            <div className="mt-2 flex gap-2">
                              <Button
                                onClick={handleStart}
                                className="bg-gradient-to-r from-[#4169E1] to-[#5B3FD6] text-white hover:opacity-90"
                                size="sm"
                              >
                                Start Onboarding
                              </Button>
                              {message.metadata?.retry && (
                                <Button
                                  onClick={handleRetry}
                                  variant="outline"
                                  size="sm"
                                >
                                  Try Again
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Reward Card */}
                          {message.component === 'reward' && (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="mt-3 bg-gradient-to-br from-[#F0C75E] via-[#FFD700] to-[#F0C75E] rounded-2xl p-5 border-2 border-[#FFD700] shadow-lg shadow-[#F0C75E]/50"
                            >
                              <div className="text-center space-y-3">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
                                  <Gift className="w-8 h-8 text-[#F0C75E]" />
                                </div>
                                <div>
                                  <p className="text-[#0A0F2B] font-bold text-2xl">
                                    +{message.metadata.amount} ${message.metadata.token}
                                  </p>
                                  <p className="text-[#0A0F2B]/70 text-sm mt-1">
                                    Early member bonus!
                                  </p>
                                </div>
                                <Button
                                  onClick={handleClaimReward}
                                  disabled={claimed || isProcessing}
                                  className="w-full bg-[#0A0F2B] hover:bg-[#0A0F2B]/90 text-white font-bold"
                                >
                                  {claimed ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Claimed!
                                    </>
                                  ) : isProcessing ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Claiming...
                                    </>
                                  ) : (
                                    'Claim Reward'
                                  )}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* User Message */}
                    {message.type === 'user' && (
                      <div className="bg-gradient-to-r from-[#4169E1] to-[#5B3FD6] rounded-2xl rounded-tr-none px-4 py-3 shadow-sm max-w-[85%]">
                        <p className="text-white text-sm">{message.content}</p>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Show "Start Onboarding" button on welcome */}
                {currentStep === 'welcome' && messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-start"
                  >
                    <Button
                      onClick={handleStart}
                      className="bg-gradient-to-r from-[#4169E1] to-[#5B3FD6] text-white hover:opacity-90"
                    >
                      Start Onboarding
                    </Button>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Bar */}
              {(currentStep === 'ask_username' || currentStep === 'ask_base_username') && (
                <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleInputKeyPress}
                      placeholder={currentStep === 'ask_username' ? 'yourname' : 'base.eth'}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4169E1] transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={currentStep === 'ask_username' ? handleUsernameSubmit : handleBaseUsernameSubmit}
                      disabled={isProcessing || !inputValue.trim()}
                      className="w-10 h-10 bg-gradient-to-r from-[#4169E1] to-[#5B3FD6] rounded-full flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
