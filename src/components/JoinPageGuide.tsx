import React from 'react';
import { 
  Clock, 
  Heart, 
  Repeat2, 
  MessageCircle, 
  AlertTriangle,
  Coins,
  DollarSign,
  Zap,
  Users,
  Crown,
  Gift,
  Bot,
  HelpCircle,
  Shield,
  Ban,
  CheckCircle,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function JoinPageGuide() {
  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="text-center space-y-2 md:space-y-3">
        <div className="inline-flex items-center gap-1.5 md:gap-2 bg-[#39FF14]/20 border border-[#39FF14] rounded-full px-4 py-1.5 md:px-6 md:py-2">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#39FF14]" />
          <span className="text-[#39FF14] font-bold tracking-wide uppercase text-xs md:text-sm">How It Works</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white px-4">
          Your Guide to Base Tribe
        </h2>
        <p className="text-white/60 text-xs md:text-sm lg:text-base max-w-2xl mx-auto px-4">
          Everything you need to know about earning, engaging, and thriving in our community in miniapp and telegram.
        </p>
      </div>

      {/* Core Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Sessions */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/30 p-4 md:p-6 space-y-3 md:space-y-4 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2 md:mb-3">
            <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white">Sessions</h3>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-400/30 text-blue-200 border-blue-400 text-xs">6 per day</Badge>
              <Badge className="bg-cyan-400/30 text-cyan-200 border-cyan-400 text-xs">15 mins each</Badge>
            </div>
            <p className="text-white/80 text-xs md:text-sm leading-relaxed">
              Drop links <span className="text-cyan-400 font-bold">only when session opens</span>. 
              Timing is everything!
            </p>
          </div>
          <div className="pt-2 md:pt-3 border-t border-white/10">
            <p className="text-white/60 text-xs">
              💡 Wait for the "Session Open" message before posting
            </p>
          </div>
        </Card>

        {/* Engage */}
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/30 p-4 md:p-6 space-y-3 md:space-y-4 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2 md:mb-3">
            <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white">Engage</h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <Heart className="w-4 h-4 text-green-400" />
              <span className="text-white/80 text-xs md:text-sm">Like</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Repeat2 className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80 text-xs md:text-sm">Recast</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <MessageCircle className="w-4 h-4 text-teal-400" />
              <span className="text-white/80 text-xs md:text-sm">Comment genuinely</span>
            </div>
          </div>
          <p className="text-white/80 text-xs md:text-sm leading-relaxed pt-2">
            Interact with tribe links to score <span className="text-[#39FF14] font-bold">a Star ⭐</span>
          </p>
        </Card>

        {/* Avoid Defaults */}
        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-400/30 p-4 md:p-6 space-y-3 md:space-y-4 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2 md:mb-3">
            <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white">Avoid Defaults</h3>
          <div className="space-y-2">
            <div className="bg-red-500/20 border border-red-400/40 rounded-lg p-2.5 md:p-3">
              <p className="text-white/90 text-xs md:text-sm font-medium">
                Posted a link but didn't engage?
              </p>
              <p className="text-red-300 text-xs mt-1">
                = <span className="font-bold">No reward</span>
              </p>
            </div>
            <p className="text-white/80 text-xs md:text-sm leading-relaxed">
              <span className="font-bold text-orange-300">Be present.</span> To be supported, we must support others.
            </p>
          </div>
        </Card>
      </div>

      {/* How to Earn */}
      <Card className="bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#003366] border-2 border-[#39FF14]/30 p-5 md:p-8">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#39FF14] to-[#2ECC11] flex items-center justify-center">
            <Coins className="w-5 h-5 md:w-6 md:h-6 text-[#001F3F]" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">How to Earn</h3>
            <p className="text-white/60 text-xs md:text-sm">Multiple ways to get rewarded</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Token Rewards */}
          <div className="space-y-3 md:space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#FFD700]" />
                <h4 className="font-bold text-white text-sm md:text-base">$JESSE Token</h4>
              </div>
              <p className="text-white/70 text-xs md:text-sm">
                Earn through <span className="text-[#FFD700] font-medium">Base Raid</span> and <span className="text-[#39FF14] font-medium">engagement rewards</span>
              </p>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-xs">
                Active Members Only
              </Badge>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#39FF14]" />
                <h4 className="font-bold text-white text-sm md:text-base">$BTRIBE Token</h4>
              </div>
              <p className="text-white/70 text-xs md:text-sm">
                Daily engagement rewards and special bonuses
              </p>
              <Badge className="bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/30 text-xs">
                100 per Success
              </Badge>
            </div>
          </div>

          {/* USDC & Claim */}
          <div className="space-y-3 md:space-y-4">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-400/30 rounded-xl p-4 md:p-5 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                <h4 className="font-bold text-white text-sm md:text-base">USDC Rewards</h4>
              </div>
              <p className="text-white/70 text-xs md:text-sm">
                Random lucky USDC rewards for <span className="text-green-400 font-medium">consistent players</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-green-300">
                <Target className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Stay active to increase your chances</span>
              </div>
            </div>

            <div className="bg-white/5 border border-[#00D4FF]/30 rounded-xl p-4 md:p-5 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#00D4FF]" />
                <h4 className="font-bold text-white text-sm md:text-base">Claiming Rewards</h4>
              </div>
              <p className="text-white/70 text-xs md:text-sm">
                Bots handle tracking, verification & payouts automatically
              </p>
              <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg p-2.5 md:p-3 mt-2">
                <p className="text-[#00D4FF] text-xs font-medium">
                  ⚡ Must claim rewards in miniapp on Base
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Extra Opportunities */}
      <div>
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#7B2CBF]" />
          <h3 className="text-xl md:text-2xl font-bold text-white">Extra Opportunities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Raid Master */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/30 p-4 md:p-6 space-y-3 md:space-y-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 md:mb-4">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <Badge className="bg-purple-400/30 text-purple-200 border-purple-400 mb-2 md:mb-3 text-xs">
                Guide Role
              </Badge>
              <h4 className="text-lg md:text-xl font-bold text-white mb-2">Raid Master</h4>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                Guide growth and help rookies succeed in the tribe
              </p>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                <p className="text-purple-300 text-xs font-medium">
                  🎯 Mentor · Lead · Earn Extra
                </p>
              </div>
            </div>
          </Card>

          {/* VIP Premium */}
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/30 p-4 md:p-6 space-y-3 md:space-y-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-3 md:mb-4">
                <Crown className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <Badge className="bg-yellow-400/30 text-yellow-200 border-yellow-400 mb-2 md:mb-3 text-xs">
                Premium Service
              </Badge>
              <h4 className="text-lg md:text-xl font-bold text-white mb-2">VIP Status</h4>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                Deeper reach & exclusive perks for dedicated members
              </p>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                <p className="text-yellow-300 text-xs font-medium">
                  👑 20+ Stars Required
                </p>
              </div>
            </div>
          </Card>

          {/* Early Bonus */}
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/30 p-4 md:p-6 space-y-3 md:space-y-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-3 md:mb-4">
                <Gift className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <Badge className="bg-cyan-400/30 text-cyan-200 border-cyan-400 mb-2 md:mb-3 text-xs">
                Early Member Bonus
              </Badge>
              <h4 className="text-lg md:text-xl font-bold text-white mb-2">Pioneer Reward</h4>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                Early members get bonus $BTRIBE tokens
              </p>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                <p className="text-cyan-300 text-xs font-medium">
                  🎁 Limited Time Offer
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Automation & Support */}
      <Card className="bg-gradient-to-r from-[#001F3F] to-[#003366] border border-[#00D4FF]/30 p-5 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7B2CBF] flex items-center justify-center flex-shrink-0">
            <Bot className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Automation & Support</h3>
            <p className="text-white/70 text-xs md:text-sm lg:text-base leading-relaxed mb-3 md:mb-4">
              Bots only verify <span className="text-[#00D4FF] font-medium">session activities</span>, 
              <span className="text-[#7B2CBF] font-medium"> leaderboards</span>, and 
              <span className="text-[#39FF14] font-medium"> payouts</span> automatically.
            </p>
            <div className="flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 rounded-lg p-3 md:p-4">
              <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-[#39FF14]" />
              <div>
                <p className="text-white text-xs md:text-sm font-medium">Need assistance?</p>
                <p className="text-white/60 text-xs">Head to <span className="text-[#39FF14]">#help-channel</span> in Telegram</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Policy */}
      <Card className="bg-gradient-to-br from-red-500/10 via-[#001F3F] to-[#001F3F] border-2 border-red-500/30 p-5 md:p-8">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">Platform Policy</h3>
              <p className="text-white/60 text-xs md:text-sm">Community Guidelines</p>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Prohibited Section */}
          <div className="bg-red-500/10 border-2 border-red-400/40 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Ban className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
              <h4 className="text-lg md:text-xl font-bold text-red-300">Strictly Prohibited</h4>
            </div>
            
            <div className="space-y-2.5 md:space-y-3">
              <div className="flex items-start gap-2 md:gap-3 bg-red-500/10 border border-red-400/30 rounded-lg p-3 md:p-4">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-300 font-bold text-xs md:text-sm">✕</span>
                </div>
                <div>
                  <p className="text-white font-medium text-xs md:text-sm mb-1">Spammy Engagement</p>
                  <p className="text-white/60 text-xs">Generic comments, copy-paste responses</p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:gap-3 bg-red-500/10 border border-red-400/30 rounded-lg p-3 md:p-4">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-300 font-bold text-xs md:text-sm">✕</span>
                </div>
                <div>
                  <p className="text-white font-medium text-xs md:text-sm mb-1">Manipulated Activity</p>
                  <p className="text-white/60 text-xs">Using bots, fake accounts, or automation</p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:gap-3 bg-red-500/10 border border-red-400/30 rounded-lg p-3 md:p-4">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-300 font-bold text-xs md:text-sm">✕</span>
                </div>
                <div>
                  <p className="text-white font-medium text-xs md:text-sm mb-1">Artificial Engagement</p>
                  <p className="text-white/60 text-xs">Engagement rings, paid interactions, gaming the system</p>
                </div>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 md:p-4 mt-3 md:mt-4">
              <p className="text-red-200 text-xs font-medium text-center">
                ⚠️ Violators will be permanently banned with no appeal
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-gradient-to-br from-[#39FF14]/10 to-[#00D4FF]/10 border-2 border-[#39FF14]/30 rounded-xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-[#39FF14] mx-auto" />
                <h5 className="text-white font-bold text-sm md:text-base">Authentic Community</h5>
                <p className="text-white/60 text-xs">Real people, real connections</p>
              </div>
              <div className="space-y-2">
                <Heart className="w-7 h-7 md:w-8 md:h-8 text-[#00D4FF] mx-auto" />
                <h5 className="text-white font-bold text-sm md:text-base">Real Engagement</h5>
                <p className="text-white/60 text-xs">Meaningful interactions only</p>
              </div>
              <div className="space-y-2">
                <Coins className="w-7 h-7 md:w-8 md:h-8 text-[#FFD700] mx-auto" />
                <h5 className="text-white font-bold text-sm md:text-base">Genuine Rewards</h5>
                <p className="text-white/60 text-xs">Earned through participation</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}