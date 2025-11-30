// Live Raid Block - Display active raids and starter missions from Google Sheets

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Swords, 
  Users, 
  Target, 
  ExternalLink,
  Radio,
  Flame,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  Trophy,
  BarChart3,
  Eye,
  Wallet as WalletIcon,
  Loader2,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import type { UserData } from '@/lib/types';
import { CONFIG } from '@/lib/constants';
import { toast } from 'sonner@2.0.3';
import { ethers } from 'ethers';

interface RaidData {
  teleId: string;
  sponsorUsername: string;
  shoutoutCredit: number;
  paidPremium: boolean;
  castLink: string;
  targetUser: string;
  targetFid: string;
  rewardBtribe: number;
  rewardJesse: number;
  luckyRewardUsdc: number;
  status: string;
  postedDate: string;
  luckyRewardEligible: boolean;
  raidRowId: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string;
  rewardAmount: number;
  rewardToken: 'BTRIBE' | 'JESSE';
  actionType: 'link' | 'wallet' | 'progress' | 'navigation';
  actionUrl?: string;
  verifyText: string;
  progress?: number;
  maxProgress?: number;
  hasBooster?: boolean;
  completed: boolean;
}

interface LiveRaidBlockProps {
  isConnected: boolean;
  userData: UserData | null;
  onRefreshUserData?: () => void;
}

export function LiveRaidBlock({ isConnected, userData, onRefreshUserData }: LiveRaidBlockProps) {
  const [liveRaid, setLiveRaid] = useState<RaidData | null>(null);
  const [isLoadingRaid, setIsLoadingRaid] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completingRaid, setCompletingRaid] = useState(false);
  const [claimingMission, setClaimingMission] = useState<string | null>(null);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  const [lastClaimedReward, setLastClaimedReward] = useState<{ amount: number; token: string } | null>(null);
  
  // Track which missions have been clicked (with timestamp)
  const [clickedMissions, setClickedMissions] = useState<Map<string, number>>(new Map());
  
  // Track countdown timers for each mission
  const [missionTimers, setMissionTimers] = useState<Map<string, number>>(new Map());
  
  // Store balances before claiming to verify reward was received
  const [balanceBeforeClaim, setBalanceBeforeClaim] = useState<{
    btribe: number;
    jesse: number;
  } | null>(null);

  // Track wallet check passed state for hold-100k-btribe mission
  const [walletCheckPassed, setWalletCheckPassed] = useState(false);
  const [checkingWallet, setCheckingWallet] = useState(false);

  // Load completed missions from Google Sheets userData
  useEffect(() => {
    if (!userData?.completed_tasks) {
      setCompletedMissions(new Set());
      return;
    }
    
    // Parse completed_tasks field (comma-separated task IDs)
    const completedTaskIds = userData.completed_tasks
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    setCompletedMissions(new Set(completedTaskIds));
    console.log('✅ Loaded completed tasks from Google Sheets:', completedTaskIds);
  }, [userData?.completed_tasks]);

  // Timer effect - count down from 20 seconds for each clicked mission
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionTimers(prev => {
        const newTimers = new Map(prev);
        let hasChanges = false;
        
        for (const [missionId, timeLeft] of newTimers.entries()) {
          if (timeLeft > 0) {
            newTimers.set(missionId, timeLeft - 1);
            hasChanges = true;
          }
        }
        
        return hasChanges ? newTimers : prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch live raid data from Google Sheets BASERAID tab
  useEffect(() => {
    const fetchLiveRaid = async () => {
      try {
        setIsLoadingRaid(true);
        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=BASERAID`
        );
        const text = await response.text();
        const jsonText = text.substring(47, text.length - 2);
        const data = JSON.parse(jsonText);

        const rows = data.table.rows;
        
        // Find active raid matching user's telegram ID or get the first active raid
        const activeRaidRow = rows.slice(1).find((row: any) => {
          const status = row.c[9]?.v || ''; // Column J: status
          return status.toLowerCase() === 'pending' || status.toLowerCase() === 'active';
        });

        if (activeRaidRow) {
          const raid: RaidData = {
            teleId: activeRaidRow.c[0]?.v || '',
            sponsorUsername: activeRaidRow.c[1]?.v || '',
            shoutoutCredit: parseInt(activeRaidRow.c[2]?.v) || 0,
            paidPremium: activeRaidRow.c[3]?.v === 'true',
            castLink: activeRaidRow.c[4]?.v || '',
            targetUser: activeRaidRow.c[5]?.v || '',
            targetFid: activeRaidRow.c[6]?.v || '',
            rewardBtribe: parseFloat(activeRaidRow.c[7]?.v) || 0,
            luckyRewardUsdc: parseFloat(activeRaidRow.c[8]?.v) || 0,
            status: activeRaidRow.c[9]?.v || 'pending',
            postedDate: activeRaidRow.c[10]?.v || '',
            luckyRewardEligible: activeRaidRow.c[11]?.v === 'true',
            raidRowId: activeRaidRow.c[12]?.v || '',
            rewardJesse: parseFloat(activeRaidRow.c[13]?.v) || 0,
          };
          setLiveRaid(raid);
          console.log('✅ Live raid loaded:', raid);
        } else {
          setLiveRaid(null);
          console.log('ℹ️ No active raids found');
        }
      } catch (error) {
        // Silent fail - raid data temporarily unavailable
        setLiveRaid(null);
      } finally {
        setIsLoadingRaid(false);
      }
    };

    fetchLiveRaid();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveRaid, 30000);
    return () => clearInterval(interval);
  }, [userData]);

  // Initialize starter missions
  useEffect(() => {
    const sessionProgress = userData?.session_streak || 0;
    
    const starterMissions: Mission[] = [
      {
        id: 'follow_basetribe',
        title: 'Follow BaseTribe on X',
        description: 'Starter Mission: Follow BaseTribe',
        reward: '100 BTRIBE',
        rewardAmount: 100,
        rewardToken: 'BTRIBE',
        actionType: 'link',
        actionUrl: 'https://x.com/TribeOnBase',
        verifyText: 'VERIFY',
        completed: false,
      },
      {
        id: 'hold-100k-btribe',
        title: 'Hold 100,000 $BTRIBE',
        description: 'Starter Mission: Hold 100,000 BTRIBE',
        reward: '30 JESSE + Booster',
        rewardAmount: 30,
        rewardToken: 'JESSE',
        actionType: 'wallet',
        verifyText: 'CHECK WALLET',
        hasBooster: true,
        completed: false,
      },
      {
        id: 'join_x_community',
        title: 'Join BaseTribe X Community',
        description: 'Join BaseTribe X Community',
        reward: '200 BTRIBE',
        rewardAmount: 200,
        rewardToken: 'BTRIBE',
        actionType: 'link',
        actionUrl: 'https://x.com/i/communities/1675957153310408709',
        verifyText: 'VERIFY',
        completed: false,
      },
      {
        id: 'join_sessions',
        title: 'Join at least 5 Sessions',
        description: 'Participate in 5 Engagement Sessions',
        reward: '50 JESSE',
        rewardAmount: 50,
        rewardToken: 'JESSE',
        actionType: 'progress',
        verifyText: 'CLAIM',
        progress: Math.min(sessionProgress, 5),
        maxProgress: 5,
        completed: sessionProgress >= 5,
      },
      {
        id: 'visit_leaderboard',
        title: 'Visit Leaderboard',
        description: 'Visit Leaderboard Page',
        reward: '5 JESSE',
        rewardAmount: 5,
        rewardToken: 'JESSE',
        actionType: 'navigation',
        verifyText: 'OPEN LEADERBOARD',
        completed: false,
      },
      {
        id: 'follow_xdodo',
        title: 'Follow Our Project: X-Dodo',
        description: 'Starter Mission: Follow X-Dodo Project',
        reward: '100 BTRIBE',
        rewardAmount: 100,
        rewardToken: 'BTRIBE',
        actionType: 'link',
        actionUrl: 'https://x.com/dododotxyz',
        verifyText: 'VERIFY',
        completed: false,
      },
      {
        id: 'follow_fomoclix',
        title: 'Follow Our Project: FomoClix',
        description: 'Starter Mission: Follow FomoClix',
        reward: '100 BTRIBE',
        rewardAmount: 100,
        rewardToken: 'BTRIBE',
        actionType: 'link',
        actionUrl: 'https://x.com/FomoClix',
        verifyText: 'VERIFY',
        completed: false,
      },
      {
        id: 'subscribe_paragraph',
        title: 'Subscribe to our Paragraph',
        description: 'Starter Mission: Subscribe to BaseTribe Blog',
        reward: '10 JESSE',
        rewardAmount: 10,
        rewardToken: 'JESSE',
        actionType: 'link',
        actionUrl: 'https://paragraph.com/@basetribe/',
        verifyText: 'VERIFY',
        completed: false,
      },
    ];

    setMissions(starterMissions);
  }, [userData]);

  const handleCompleteRaid = async () => {
    if (!liveRaid || !userData) return;
    
    setCompletingRaid(true);
    try {
      // TODO: Update raid status in Google Sheets
      console.log('Completing raid:', liveRaid.raidRowId);
      // In production, this would call your Google Apps Script to update status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh raid data
      setLiveRaid(null);
      toast.success('Raid completed successfully!');
    } catch (error) {
      console.error('Error completing raid:', error);
      toast.error('Failed to complete raid.');
    } finally {
      setCompletingRaid(false);
    }
  };

  // Check wallet balance for ERC20 token (for Hold 100k BTRIBE mission)
  const checkWalletBalance = async (walletAddress: string, requiredAmount: number): Promise<{ hasEnough: boolean; balance: number; message: string }> => {
    try {
      console.log('🔍 Checking wallet balance for:', walletAddress);
      
      // ERC20 ABI for balanceOf
      const ERC20_ABI = [
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];
      
      // Connect to Base network with timeout
      console.log('🌐 Connecting to Base network...');
      const provider = new ethers.JsonRpcProvider(CONFIG.RPC_PROVIDER_URL);
      
      // Create contract instance for $BTRIBE token
      const tokenContract = new ethers.Contract(
        CONFIG.BTRIBE_TOKEN_ADDRESS,
        ERC20_ABI,
        provider
      );
      
      // Add timeout wrapper
      const timeout = (ms: number) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), ms)
      );
      
      // Get token decimals with 10 second timeout
      console.log('📊 Fetching token decimals...');
      const decimalsResult = await Promise.race([
        tokenContract.decimals(),
        timeout(10000)
      ]);
      const decimals = Number(decimalsResult);
      console.log('📊 Token decimals:', decimals.toString());
      
      // Get balance with 10 second timeout
      console.log('💰 Fetching wallet balance...');
      const balanceResult = await Promise.race([
        tokenContract.balanceOf(walletAddress),
        timeout(10000)
      ]);
      
      // Convert BigInt to string first, then format
      const balanceStr = balanceResult.toString();
      console.log('💰 Raw balance (string):', balanceStr);
      
      const balance = parseFloat(ethers.formatUnits(balanceStr, decimals));
      
      console.log('💰 Formatted balance:', balance.toString(), '$BTRIBE');
      console.log('✅ Required amount:', requiredAmount.toString(), '$BTRIBE');
      
      if (balance === 0) {
        return {
          hasEnough: false,
          balance,
          message: 'No $BTRIBE found in wallet'
        };
      } else if (balance < requiredAmount) {
        return {
          hasEnough: false,
          balance,
          message: `Not enough $BTRIBE. You have ${balance.toLocaleString()} but need ${requiredAmount.toLocaleString()}`
        };
      } else {
        return {
          hasEnough: true,
          balance,
          message: `✅ Verified! You have ${balance.toLocaleString()} $BTRIBE`
        };
      }
    } catch (error) {
      console.error('❌ Error checking wallet balance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        hasEnough: false,
        balance: 0,
        message: errorMessage.includes('timeout') 
          ? 'Request timed out. Please try again.' 
          : 'Failed to check wallet balance. Please try again.'
      };
    }
  };
  
  const handleMissionAction = async (mission: Mission) => {
    if (!isConnected || !userData) return;
    
    // Check if already claimed
    if (completedMissions.has(mission.id)) {
      toast.info('You already claimed this reward!');
      return;
    }

    switch (mission.actionType) {
      case 'link':
        if (mission.actionUrl) {
          // Record the click timestamp
          const clickTime = Date.now();
          setClickedMissions(prev => new Map(prev).set(mission.id, clickTime));
          
          // Start 20-second countdown timer
          setMissionTimers(prev => new Map(prev).set(mission.id, 20));
          
          // Open the link
          window.open(mission.actionUrl, '_blank');
          
          // Show toast with timer info
          toast.info(
            <div>
              <p className="font-bold">🔗 Link Opened!</p>
              <p className="text-sm">Complete the action, then wait 20 seconds before claiming.</p>
            </div>,
            { duration: 5000 }
          );
        }
        break;
      case 'wallet':
        // Check wallet balance
        if (mission.id === 'hold-100k-btribe') {
          const walletAddress = userData.wallet_address;
          const requiredAmount = 100000; // 100,000 BTRIBE
          
          if (!walletAddress) {
            toast.error('Wallet address not found. Please connect your wallet.');
            return;
          }
          
          setCheckingWallet(true);
          
          try {
            const balanceCheck = await checkWalletBalance(walletAddress, requiredAmount);
            
            setCheckingWallet(false);
            
            if (balanceCheck.hasEnough) {
              // Success - show success message and enable claim
              setWalletCheckPassed(true);
              toast.success(
                <div>
                  <p className="font-bold">✅ {balanceCheck.message}</p>
                  <p className="text-sm">You can now claim your reward!</p>
                </div>,
                { duration: 5000 }
              );
            } else {
              // Failed - show error message
              setWalletCheckPassed(false);
              toast.error(
                <div>
                  <p className="font-bold">❌ {balanceCheck.message}</p>
                  <p className="text-sm">You need 100,000 $BTRIBE to claim this reward.</p>
                </div>,
                { duration: 6000 }
              );
            }
          } catch (error) {
            setCheckingWallet(false);
            setWalletCheckPassed(false);
            console.error('Error in wallet check:', error);
            toast.error(
              <div>
                <p className="font-bold">❌ Wallet Check Failed</p>
                <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
              </div>,
              { duration: 6000 }
            );
          }
        }
        break;
      case 'navigation':
        // TODO: Navigate to leaderboard
        console.log('Navigate to leaderboard');
        toast.info('Leaderboard navigation coming soon!');
        break;
      case 'progress':
        if (mission.completed && !completedMissions.has(mission.id)) {
          // Claim reward with animation
          await handleClaimMission(mission);
        }
        break;
    }
  };
  
  const handleClaimMission = async (mission: Mission) => {
    if (!isConnected || !userData) {
      toast.error('Please connect your wallet to claim rewards');
      return;
    }
    
    // Check if already claimed (frontend check for better UX)
    if (completedMissions.has(mission.id)) {
      toast.info('✅ You already claimed this reward!');
      return;
    }
    
    // For link missions, check if user clicked the link and waited 20 seconds
    if (mission.actionType === 'link') {
      const clickTime = clickedMissions.get(mission.id);
      const timeLeft = missionTimers.get(mission.id) || 0;
      
      if (!clickTime) {
        toast.error(
          <div>
            <p className="font-bold">❌ Complete task before claiming!</p>
            <p className="text-sm">Click "OPEN LINK" and complete the action first.</p>
          </div>,
          { duration: 4000 }
        );
        return;
      }
      
      if (timeLeft > 0) {
        toast.error(
          <div>
            <p className="font-bold">⏳ Complete task before claiming!</p>
            <p className="text-sm">Please wait {timeLeft} more seconds after completing the action.</p>
          </div>,
          { duration: 4000 }
        );
        return;
      }
    }
    
    setClaimingMission(mission.id);
    
    // Store balance before claim for verification
    const balanceBefore = {
      btribe: userData.btribe_balance || 0,
      jesse: userData.jesse_balance || 0,
    };
    setBalanceBeforeClaim(balanceBefore);
    
    try {
      // Call Google Apps Script to save completed task
      console.log('📝 Submitting task completion:', {
        fid: userData.farcaster_fid,
        taskId: mission.id,
        balanceBefore
      });

      // Send request to backend (matches backend expected format)
      const response = await fetch(CONFIG.ENGAGEMENT_BOT_URL, {
        method: 'POST',
        mode: 'no-cors', // Backend will handle CORS
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete_task',
          fid: userData.farcaster_fid,
          taskId: mission.id,
        }),
      });

      console.log('✅ Task completion submitted to Google Sheets');

      // Show animated success toast
      toast.success(
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#FFD700] animate-spin" />
          <div>
            <p className="font-bold">Processing Reward... 🎉</p>
            <p className="text-sm">+{mission.rewardAmount} ${mission.rewardToken}</p>
            <p className="text-xs text-white/70">Verifying with Google Sheets...</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      
      // Wait for backend to process (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh user data from Google Sheets to get updated balance AND completed_tasks
      console.log('🔄 Refreshing user data to verify balance update...');
      if (onRefreshUserData) {
        await onRefreshUserData();
      }
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify balance was updated correctly
      const balanceAfter = {
        btribe: userData.btribe_balance || 0,
        jesse: userData.jesse_balance || 0,
      };
      
      const expectedIncrease = mission.rewardAmount;
      const balanceField = mission.rewardToken === 'BTRIBE' ? 'btribe' : 'jesse';
      const actualIncrease = balanceAfter[balanceField] - balanceBefore[balanceField];
      
      console.log('💰 Balance verification:', {
        before: balanceBefore,
        after: balanceAfter,
        expected: expectedIncrease,
        actual: actualIncrease,
        field: balanceField
      });
      
      if (actualIncrease >= expectedIncrease || userData.completed_tasks?.includes(mission.id)) {
        // Success! Balance was updated or task is marked completed
        setCompletedMissions(prev => new Set([...prev, mission.id]));
        
        toast.success(
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-[#39FF14]" />
            <div>
              <p className="font-bold">✅ Reward Verified!</p>
              <p className="text-sm">+{mission.rewardAmount} ${mission.rewardToken} added to your balance</p>
            </div>
          </div>,
          { duration: 4000 }
        );
        
        console.log('✅ Mission claimed and verified:', mission.id);
      } else {
        // Balance not updated yet - might need more time
        toast.warning(
          <div>
            <p className="font-bold">⏳ Processing...</p>
            <p className="text-sm">Your reward is being processed. Refresh in a moment to see it.</p>
          </div>,
          { duration: 5000 }
        );
      }
      
    } catch (error) {
      console.error('❌ Error claiming mission:', error);
      toast.error('Failed to claim reward. Please try again.');
    } finally {
      setClaimingMission(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* LIVE RAID BLOCK */}
      {isLoadingRaid ? (
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-[#00D4FF]/30 rounded-[20px] p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
          </div>
        </Card>
      ) : liveRaid ? (
        <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-[#00D4FF] rounded-[20px] shadow-2xl">
          {/* Neon blue glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00D4FF] via-[#0095FF] to-[#00D4FF] opacity-50 blur-xl animate-pulse"></div>
          
          {/* Glass overlay highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative p-6 space-y-5">
            {/* Header with LIVE indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  {/* TikTok-style live pulse dot */}
                  <div className="absolute inset-0 bg-[#FF0000] rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-3 h-3 bg-[#FF0000] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#FF0000] to-[#FF3333] rounded-full px-4 py-1.5 shadow-lg">
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-white font-bold text-sm tracking-wider uppercase">LIVE RAID</span>
                </div>
                <Badge className="bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white border-0 shadow-lg">
                  Base Creator Coin
                </Badge>
              </div>
              <Swords className="w-8 h-8 text-[#00D4FF]" />
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-[#001F3F] mb-1 bg-gradient-to-r from-[#001F3F] via-[#7B2CBF] to-[#00D4FF] bg-clip-text text-transparent">
                🔴 LIVE RAID — Base Creator Coin
              </h3>
              <p className="text-[#003366]/70 text-sm">
                Support the featured creator and earn rewards
              </p>
            </div>

            {/* Target Creator Info */}
            <div className="bg-gradient-to-br from-[#E8F4FF] to-[#F0E8FF] border border-[#00D4FF]/30 rounded-2xl p-4 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-[#00D4FF]" />
                <div>
                  <p className="text-[#003366]/60 text-xs font-semibold uppercase tracking-wider mb-0.5">Target Creator</p>
                  <p className="text-[#001F3F] font-bold text-lg">@{liveRaid.targetUser}</p>
                  <p className="text-[#003366]/60 text-xs">FID: {liveRaid.targetFid}</p>
                </div>
              </div>
              
              {liveRaid.sponsorUsername && (
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#7B2CBF]" />
                  <p className="text-[#003366]/80 text-sm">
                    <span className="font-semibold">Sponsor:</span> @{liveRaid.sponsorUsername}
                    {liveRaid.paidPremium && (
                      <Badge className="ml-2 bg-[#FFD700] text-[#001F3F] text-xs border-0">Premium</Badge>
                    )}
                  </p>
                </div>
              )}

              {/* Rewards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-[#003366] text-sm font-semibold">Reward:</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {liveRaid.rewardBtribe > 0 && (
                      <span className="text-[#39FF14] font-bold">💙 {liveRaid.rewardBtribe} BTRIBE</span>
                    )}
                    {liveRaid.rewardJesse > 0 && (
                      <span className="text-[#7B2CBF] font-bold">💜 {liveRaid.rewardJesse} JESSE</span>
                    )}
                  </div>
                </div>

                {liveRaid.luckyRewardEligible && liveRaid.luckyRewardUsdc > 0 && (
                  <div className="flex items-center justify-between bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#FFD700]" />
                      <span className="text-[#003366] text-sm font-semibold">Lucky Bonus:</span>
                    </div>
                    <span className="text-[#FFD700] font-bold">💵 {liveRaid.luckyRewardUsdc} USDC</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={liveRaid.castLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0095FF] hover:from-[#0095FF] hover:to-[#0077CC] text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  VIEW CAST
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              
              <Button
                onClick={handleCompleteRaid}
                disabled={!isConnected || completingRaid}
                className="w-full bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {completingRaid ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    COMPLETING...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    COMPLETE RAID
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-[#003366]/20 rounded-[20px] p-8">
          <div className="text-center space-y-3">
            <Swords className="w-12 h-12 text-[#003366]/30 mx-auto" />
            <h3 className="text-lg font-bold text-[#003366]">No Active Raids</h3>
            <p className="text-[#003366]/60 text-sm">Check back soon for the next live raid!</p>
          </div>
        </Card>
      )}

      {/* STARTER IN-APP MISSIONS BLOCK */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
          <h2 className="text-xl font-bold text-white bg-gradient-to-r from-[#00D4FF] to-[#7B2CBF] bg-clip-text text-transparent uppercase tracking-wider">
            ⚡ Starter Missions
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#00D4FF] via-transparent to-transparent"></div>
        </div>

        <div className="grid gap-4">
          {missions.map((mission) => (
            <Card
              key={mission.id}
              className="relative overflow-hidden bg-gradient-to-br from-[#0A0F2B] via-[#1a0a2e] to-[#0A0F2B] border border-[#00D4FF]/30 rounded-[20px] hover:border-[#00D4FF] transition-all group"
            >
              {/* Animated shimmer highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative p-5 space-y-4">
                {/* Mission Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg mb-1">{mission.title}</h4>
                    <p className="text-white/60 text-sm">{mission.description}</p>
                  </div>
                  <div className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm ${
                    mission.rewardToken === 'BTRIBE' 
                      ? 'bg-gradient-to-r from-[#39FF14]/20 to-[#2ECC11]/20 border border-[#39FF14] text-[#39FF14]'
                      : 'bg-gradient-to-r from-[#7B2CBF]/20 to-[#9D4EDD]/20 border border-[#7B2CBF] text-[#9D4EDD]'
                  }`}>
                    {mission.reward}
                  </div>
                </div>

                {/* Progress Bar (if applicable) */}
                {mission.actionType === 'progress' && mission.maxProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Progress</span>
                      <span className="text-white font-bold">{mission.progress}/{mission.maxProgress}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#39FF14] to-[#2ECC11] rounded-full transition-all"
                        style={{ width: `${((mission.progress || 0) / mission.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Booster Badge */}
                {mission.hasBooster && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700] rounded-lg px-3 py-2">
                    <Zap className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-[#FFD700] text-xs font-bold uppercase tracking-wider">Reward Booster Included</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {mission.actionType === 'link' && (
                    <>
                      <Button
                        onClick={() => handleMissionAction(mission)}
                        disabled={!isConnected || claimingMission === mission.id || completedMissions.has(mission.id)}
                        className="flex-1 bg-gradient-to-r from-[#00D4FF]/20 to-[#0095FF]/20 hover:from-[#00D4FF]/30 hover:to-[#0095FF]/30 border border-[#00D4FF] text-[#00D4FF] font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {completedMissions.has(mission.id) ? '✅ COMPLETED' : 'OPEN LINK'}
                      </Button>
                      <Button
                        onClick={() => handleClaimMission(mission)}
                        disabled={!isConnected || claimingMission === mission.id || completedMissions.has(mission.id)}
                        className="flex-1 bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
                      >
                        {claimingMission === mission.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            CLAIMING...
                          </>
                        ) : completedMissions.has(mission.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            CLAIMED
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {mission.verifyText}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  
                  {mission.actionType === 'wallet' && (
                    <>
                      <Button
                        onClick={() => handleMissionAction(mission)}
                        disabled={!isConnected || checkingWallet || claimingMission === mission.id || completedMissions.has(mission.id)}
                        className="flex-1 bg-gradient-to-r from-[#7B2CBF]/20 to-[#9D4EDD]/20 hover:from-[#7B2CBF]/30 hover:to-[#9D4EDD]/30 border border-[#7B2CBF] text-[#9D4EDD] font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                      >
                        {checkingWallet ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            CHECKING...
                          </>
                        ) : (
                          <>
                            <WalletIcon className="w-4 h-4 mr-2" />
                            {mission.verifyText}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleClaimMission(mission)}
                        disabled={!isConnected || !walletCheckPassed || claimingMission === mission.id || completedMissions.has(mission.id)}
                        className="flex-1 bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
                      >
                        {claimingMission === mission.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            CLAIMING...
                          </>
                        ) : completedMissions.has(mission.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            CLAIMED
                          </>
                        ) : (
                          'CLAIM'
                        )}
                      </Button>
                    </>
                  )}
                  
                  {mission.actionType === 'navigation' && (
                    <>
                      <Button
                        onClick={() => handleMissionAction(mission)}
                        disabled={!isConnected || claimingMission === mission.id || completedMissions.has(mission.id)}
                        className="flex-1 bg-gradient-to-r from-[#00D4FF]/20 to-[#0095FF]/20 hover:from-[#00D4FF]/30 hover:to-[#0095FF]/30 border border-[#00D4FF] text-[#00D4FF] font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {mission.verifyText}
                      </Button>
                      <Button
                        onClick={() => handleClaimMission(mission)}
                        disabled={!isConnected || claimingMission === mission.id || completedMissions.has(mission.id)}
                        className="flex-1 bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
                      >
                        {claimingMission === mission.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            CLAIMING...
                          </>
                        ) : completedMissions.has(mission.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            CLAIMED
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            VERIFY VISIT
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  
                  {mission.actionType === 'progress' && (
                    <Button
                      onClick={() => handleMissionAction(mission)}
                      disabled={!isConnected || !mission.completed || claimingMission === mission.id || completedMissions.has(mission.id)}
                      className="w-full bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {claimingMission === mission.id ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          CLAIMING...
                        </>
                      ) : completedMissions.has(mission.id) ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          CLAIMED
                        </>
                      ) : mission.completed ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {mission.verifyText}
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5 mr-2" />
                          {mission.progress}/{mission.maxProgress} Sessions
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {!isConnected && (
                  <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-2">
                    <p className="text-[#FFD700] text-xs text-center font-medium">
                      ⚠️ Connect wallet to complete missions
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}