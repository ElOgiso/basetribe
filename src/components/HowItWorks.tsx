import React, { useState } from 'react';
import { 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  Star, 
  AlertTriangle, 
  Ban, 
  Trophy,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Link as LinkIcon,
  X,
  Zap,
  Shield,
  Crown
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

export function HowItWorks() {
  const [isOpen, setIsOpen] = useState(false);

  const sessions = [
    { time: '08:00', window: '08:00 – 08:15', rule: 'LIKE & RECAST', color: 'from-blue-500 to-cyan-500' },
    { time: '12:00', window: '12:00 – 12:15', rule: 'LIKE ONLY', color: 'from-green-500 to-emerald-500' },
    { time: '16:00', window: '16:00 – 16:15', rule: 'FULL ENGAGEMENT', color: 'from-purple-500 to-pink-500' },
    { time: '20:00', window: '20:00 – 20:15', rule: 'RECAST & COMMENT ONLY', color: 'from-orange-500 to-red-500' },
    { time: '00:00', window: '00:00 – 00:15', rule: 'LIKE & QUOTE', color: 'from-indigo-500 to-purple-500' },
    { time: '04:00', window: '04:00 – 04:15', rule: 'FULL ENGAGEMENT', color: 'from-pink-500 to-rose-500' },
  ];

  const vettingSteps = [
    { time: 'T - 8 min', label: 'Rules Guide posted', icon: Clock },
    { time: 'T - 5 min', label: 'Posting reminder', icon: AlertTriangle },
    { time: 'T (Start)', label: 'SESSION OPEN - Link posting begins', icon: CheckCircle },
    { time: 'T + 15 min', label: 'SESSION CLOSED - Engagement period starts', icon: Ban },
    { time: 'T + 3h 15m', label: 'Vetting Alert - API checking begins', icon: Zap },
    { time: 'T + 3h 45m', label: 'Final Check Complete - Rewards finalized', icon: Trophy },
  ];

  const pointsSystem = [
    { action: 'Like', points: '+1 pt', icon: ThumbsUp, color: 'text-blue-400' },
    { action: 'Comment', points: '+3 pts', icon: MessageCircle, color: 'text-green-400' },
    { action: 'Recast/Quote', points: '+2 pts', icon: Repeat2, color: 'text-purple-400' },
  ];

  return (
    <>
      {/* Floating Question Mark Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#7B2CBF]/90 to-[#00D4FF]/90 backdrop-blur-sm border-2 border-white/20 shadow-2xl shadow-[#7B2CBF]/50 flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-[#00D4FF]/70 group"
        aria-label="How it works"
      >
        <HelpCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39FF14] rounded-full animate-pulse" />
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#001F3F] border-2 border-[#00D4FF]/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl sm:text-3xl bg-gradient-to-r from-[#00D4FF] via-[#39FF14] to-[#7B2CBF] bg-clip-text text-transparent">
              <Zap className="w-8 h-8 text-[#39FF14]" />
              How It Works
            </DialogTitle>
            <DialogDescription className="sr-only">
              Complete guide to engagement sessions, vetting process, and leaderboard system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Intro */}
            <p className="text-white/80 leading-relaxed">
              Hey Tribe ⚡️ — here's everything you need to know about our daily sessions, vetting, and leaderboard system 👇
            </p>

            {/* Session Timing */}
            <Card className="bg-white/5 border-[#00D4FF]/30 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-[#00D4FF]" />
                <h3 className="text-xl font-bold text-white">Session Timing (WAT)</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">
                We run 6 strict engagement sessions daily. Each window is only 15 minutes long.
              </p>
              
              <div className="grid gap-3">
                {sessions.map((session, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#00D4FF]/50 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${session.color} flex items-center justify-center font-bold text-white shadow-lg`}>
                      {session.time}
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">{session.window}</div>
                      <Badge className="mt-1 bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/30">
                        {session.rule}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg">
                <p className="text-sm text-white/80">
                  <strong className="text-[#39FF14]">Note:</strong> Check the 'Session Open' message for specific rules per session.
                </p>
              </div>
            </Card>

            {/* Vetting Process */}
            <Card className="bg-white/5 border-[#7B2CBF]/30 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-[#7B2CBF]" />
                <h3 className="text-xl font-bold text-white">Vetting Process</h3>
              </div>

              <div className="space-y-3">
                {vettingSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#7B2CBF] to-[#00D4FF] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#00D4FF]">{step.time}</div>
                        <div className="text-white/80 text-sm">{step.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Star System & Penalties */}
            <Card className="bg-white/5 border-[#39FF14]/30 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-[#39FF14]" />
                <h3 className="text-xl font-bold text-white">Star System & Penalties</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Positive Actions */}
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                    <div className="font-bold text-white mb-1">New User Start</div>
                    <div className="text-2xl">⭐⭐ 2 Stars</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30">
                    <div className="font-bold text-white mb-1">Success Reward</div>
                    <div className="text-2xl">+1 Star ⭐</div>
                    <div className="text-[#39FF14] text-sm mt-1">+ 100 $BTRIBE per success</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                    <div className="font-bold text-white mb-1 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      VIP Status (20+ Stars)
                    </div>
                    <div className="text-sm text-white/80">Special rewards unlocked</div>
                  </div>
                </div>

                {/* Negative Actions */}
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30">
                    <div className="font-bold text-white mb-1">Miss Engagement</div>
                    <div className="text-2xl">-1 Star ⭐</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                    <div className="font-bold text-white mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      Soft Ban (5 Defaults)
                    </div>
                    <div className="text-sm text-white/80">24h ban, 0 Stars</div>
                    <div className="text-sm text-yellow-400 mt-1">⚠️ Probation: Pass 5 sessions</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-400/30">
                    <div className="font-bold text-white mb-1 flex items-center gap-2">
                      <Ban className="w-5 h-5 text-red-400" />
                      Hard Ban (10 Defaults)
                    </div>
                    <div className="text-2xl text-red-400">House-Arrest</div>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="p-4 bg-[#7B2CBF]/20 border border-[#7B2CBF]/40 rounded-lg">
                <div className="font-bold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#39FF14]" />
                  Self-Vetting
                </div>
                <p className="text-sm text-white/80">
                  Click 'Vet Myself Now' if engeaing on TG after sessions for instant score check (costs <span className="text-[#39FF14] font-bold">200 $BTRIBE</span>)
                </p>
              </div>
            </Card>

            {/* Leaderboard & Points */}
            <Card className="bg-white/5 border-[#00D4FF]/30 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-[#00D4FF]" />
                <h3 className="text-xl font-bold text-white">Leaderboard & Points</h3>
              </div>

              <div className="grid gap-3">
                {pointsSystem.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${item.color}`} />
                        <span className="text-white font-medium">{item.action}</span>
                      </div>
                      <Badge className={`${item.color} bg-white/10`}>
                        {item.points}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-white/60 mt-4">
                Leaderboard updates after each session's vetting completes.
              </p>
            </Card>

            {/* Link Posting Rules */}
            <Card className="bg-white/5 border-[#39FF14]/30 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="w-6 h-6 text-[#39FF14]" />
                <h3 className="text-xl font-bold text-white">Link Posting Rules</h3>
              </div>

              <div className="grid gap-3">
                <div className="p-4 rounded-lg bg-green-500/10 border-2 border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-green-400">ALLOWED</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    <strong>Share your post Links:</strong> Post when session is open in the feed or on telegram.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-red-400">FORBIDDEN</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Spam links, bot links, scam links are <strong className="text-red-400">auto-deleted</strong>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}