// Join community flow component

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, CheckCircle, Info, Twitter, Send, Hash, MessageCircle, Repeat2, ThumbsUp } from 'lucide-react';
import { LINKS } from '@/lib/constants';
import tribeLogo from '../assets/logo.png';

interface JoinFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinFlow({ open, onOpenChange }: JoinFlowProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Base Tribe! 🌊',
      description: 'Requirements to join the Base Tribe community',
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            To join this community, you must have:
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-[#39FF14] mt-0.5 flex-shrink-0" />
              <p className="text-white">A Telegram account</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-[#39FF14] mt-0.5 flex-shrink-0" />
              <p className="text-white">Valid Farcaster ID (FID)</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-[#39FF14] mt-0.5 flex-shrink-0" />
              <p className="text-white">Deep respect for Jesse 🫡</p>
            </div>
          </div>
          <Button
            onClick={() => setStep(1)}
            className="w-full bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold py-6 rounded-xl"
          >
            Next: How to Join
          </Button>
        </div>
      ),
    },
    {
      title: 'How to Join 📝',
      description: 'Step-by-step instructions to join the community',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-[#001F3F]/50 p-4 rounded-lg border border-white/10">
              <p className="text-[#39FF14] font-medium mb-2">Step 1</p>
              <p className="text-white text-sm">
                Click the community invite link below to join our Telegram group
              </p>
            </div>
            <div className="bg-[#001F3F]/50 p-4 rounded-lg border border-white/10">
              <p className="text-[#39FF14] font-medium mb-2">Step 2</p>
              <p className="text-white text-sm">
                You'll be welcomed by the Assessment Bot
              </p>
            </div>
            <div className="bg-[#001F3F]/50 p-4 rounded-lg border border-white/10">
              <p className="text-[#39FF14] font-medium mb-2">Step 3</p>
              <p className="text-white text-sm">
                Read instructions carefully and DM the Assessment Bot
              </p>
            </div>
            <div className="bg-[#001F3F]/50 p-4 rounded-lg border border-white/10">
              <p className="text-[#39FF14] font-medium mb-2">Step 4</p>
              <p className="text-white text-sm">
                Send your FID and Basename only when prompted
              </p>
            </div>
          </div>
          <Button
            onClick={() => setStep(2)}
            className="w-full bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold py-6 rounded-xl"
          >
            Next: Community Channels
          </Button>
        </div>
      ),
    },
    {
      title: 'Community Channels 🎯',
      description: 'Join our Telegram and explore available channels',
      content: (
        <div className="space-y-4">
          {/* Creative Telegram Join Block with Animated Logo */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-[#0088cc]/20 via-[#0088cc]/10 to-[#001F3F]/50 border-2 border-[#0088cc]/50 p-6 rounded-2xl backdrop-blur-sm group hover:border-[#0088cc] transition-all duration-300">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0088cc]/0 via-[#0088cc]/20 to-[#0088cc]/0 animate-shimmer pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#0088cc]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#39FF14]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10 space-y-4">
              {/* Animated Logo */}
              <div className="flex justify-center">
                <div className="relative animate-float">
                  <img 
                    src={tribeLogo} 
                    alt="Base Tribe Logo" 
                    className="w-24 h-24 animate-spin-slow"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(0, 136, 204, 0.8)) drop-shadow(0 0 40px rgba(57, 255, 20, 0.4))',
                    }}
                  />
                  {/* Pulse rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#0088cc] animate-ping opacity-20" />
                  <div className="absolute inset-0 rounded-full border-2 border-[#39FF14] animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
              
              {/* Engaging text */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-extrabold text-white">
                  Join Our Engaging Community Now!
                </h3>
                <p className="text-[#0088cc] font-medium">
                  Connect with Base Tribe members worldwide
                </p>
              </div>
              
              {/* Telegram Join Button */}
              <a
                href={LINKS.TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-gradient-to-r from-[#0088cc] to-[#0099dd] hover:from-[#0099dd] hover:to-[#00aaee] text-white font-bold py-6 rounded-xl shadow-2xl shadow-[#0088cc]/50 transition-all duration-300 hover:scale-105 hover:shadow-[#0088cc]/70">
                  <Send className="w-5 h-5 mr-2" />
                  Join Telegram Community
                </Button>
              </a>
            </div>
            
            <style jsx>{`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
              
              @keyframes spin-slow {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
              
              .animate-float {
                animation: float 3s ease-in-out infinite;
              }
              
              .animate-spin-slow {
                animation: spin-slow 20s linear infinite;
              }
            `}</style>
          </Card>
          
          {/* X Community Block */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-[#1DA1F2]/20 via-[#1DA1F2]/10 to-[#001F3F]/50 border-2 border-[#1DA1F2]/50 p-6 rounded-2xl backdrop-blur-sm group hover:border-[#1DA1F2] transition-all duration-300">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1DA1F2]/0 via-[#1DA1F2]/20 to-[#1DA1F2]/0 animate-shimmer pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#1DA1F2]/20 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10 space-y-4">
              {/* Engaging text */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Twitter className="w-8 h-8 text-[#1DA1F2] animate-bounce" />
                  <h3 className="text-2xl font-extrabold text-white">
                    JOIN X COMMUNITY
                  </h3>
                </div>
                <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1DA1F2] via-[#39FF14] to-[#1DA1F2] animate-gradient-x">
                  START #BASEPOSTING
                </p>
              </div>
              
              {/* X Links */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={LINKS.X_PROFILE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-gradient-to-r from-[#1DA1F2] to-[#0d8cd8] hover:from-[#0d8cd8] hover:to-[#1DA1F2] text-white font-bold py-4 rounded-xl shadow-xl shadow-[#1DA1F2]/40 transition-all duration-300 hover:scale-105">
                    <Twitter className="w-4 h-4 mr-2" />
                    X Profile
                  </Button>
                </a>
                <a
                  href={LINKS.X_COMMUNITY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#39FF14] text-[#001F3F] font-bold py-4 rounded-xl shadow-xl shadow-[#39FF14]/40 transition-all duration-300 hover:scale-105">
                    <Hash className="w-4 h-4 mr-2" />
                    Community
                  </Button>
                </a>
              </div>
            </div>
          </Card>
          
          {/* Embedded X Post */}
          <Card className="bg-[#001F3F]/50 p-4 rounded-2xl border-2 border-[#1DA1F2]/30 hover:border-[#1DA1F2]/60 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#1DA1F2]">
                <Twitter className="w-5 h-5" />
                <h4 className="font-bold">Latest from @TribeOnBase</h4>
              </div>
              <a
                href="https://x.com/TribeOnBase/status/1992043125573882361"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#000]/30 rounded-xl p-4 hover:bg-[#000]/50 transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/20 flex items-center justify-center flex-shrink-0">
                      <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Base Tribe</span>
                        <span className="text-white/60 text-sm">@TribeOnBase</span>
                      </div>
                      <p className="text-white/90 mt-2 leading-relaxed">
                        Join the most engaging community on Base! 🌊
                        <br />
                        Daily sessions, rewards, and vibes. Let's build together! 
                        <br />
                        #Base #BaseTribe #Farcaster
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-white/60 text-sm">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Repeat2 className="w-4 h-4" />
                          <span>Repost</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>Like</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-white/60 text-sm">Click to view on X</span>
                    <ExternalLink className="w-4 h-4 text-[#1DA1F2] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            </div>
          </Card>
          
          {/* Channel List */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-center mb-3">📱 Available Channels</h4>
            <Card className="bg-[#001F3F]/50 p-3 border border-white/10">
              <h4 className="text-[#39FF14] font-medium mb-1">ASSESSMENT</h4>
              <p className="text-white/70 text-sm">New member onboarding and verification</p>
            </Card>
            <Card className="bg-[#001F3F]/50 p-3 border border-white/10">
              <h4 className="text-[#39FF14] font-medium mb-1">ENGAGEMENT</h4>
              <p className="text-white/70 text-sm">6 daily sessions for posting Farcaster casts</p>
            </Card>
            <Card className="bg-[#001F3F]/50 p-3 border border-white/10">
              <h4 className="text-[#39FF14] font-medium mb-1">GENERAL</h4>
              <p className="text-white/70 text-sm">Community discussions and updates</p>
            </Card>
            <Card className="bg-[#001F3F]/50 p-3 border border-white/10">
              <h4 className="text-[#39FF14] font-medium mb-1">REWARD</h4>
              <p className="text-white/70 text-sm">Claim your earned $BTRIBE tokens</p>
            </Card>
            <Card className="bg-[#001F3F]/50 p-3 border border-white/10">
              <h4 className="text-[#39FF14] font-medium mb-1">LEADERBOARD</h4>
              <p className="text-white/70 text-sm">Track top performers and rankings</p>
            </Card>
            <Card className="bg-[#001F3F]/50 p-3 border border-white/10">
              <h4 className="text-[#39FF14] font-medium mb-1">RAID_DAILY_REWARD</h4>
              <p className="text-white/70 text-sm">Daily raid missions for extra rewards</p>
            </Card>
          </div>
          
          <p className="text-center text-xs text-white/60">
            Once assessed, welcome to the tribe built on Base by Base Tribe! 🚀
          </p>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#001F3F] to-[#003366] border border-white/20 max-w-md max-h-[90vh] overflow-y-auto z-[9999] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{steps[step].title}</DialogTitle>
          <DialogDescription className="text-white/80">{steps[step].description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {steps[step].content}
        </div>
        {step > 0 && (
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            className="text-white/60 hover:text-white"
          >
            Back
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}