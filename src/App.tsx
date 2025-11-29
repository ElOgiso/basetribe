// BaseTribe - Community Engagement App
'use client';

import './styles/globals.css';
import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { 
  Home, 
  Trophy, 
  User, 
  Coins, 
  Shield, 
  Users, 
  Wallet,
  LogOut,
  ExternalLink,
  Rocket,
  AlertCircle,
  Swords,
  Share2,
  Activity
} from 'lucide-react';
import { CONFIG, NFT_TOKENS, LINKS } from './lib/constants';
import { 
  fetchUserDataByFID, 
  fetchFarcasterProfile, 
  fetchLeaderboard, 
  checkMembership,
  updateBTribeBalance,
  updateJesseBalance,
  updateUSDCBalance
} from './lib/api';
import { connectWallet, getAccounts } from './lib/wallet';
import { copyToClipboard } from './lib/clipboard';
import { fetchFidFromWallet, getClaimableBalance, claimTokens, claimJesseTokens, claimUSDC } from './lib/claiming';
import type { UserData, LeaderboardEntry } from './lib/types';
import tribeLogo from './assets/logo.png';
import qrCodeImage from './assets/qrcode.png';
import donationBackground from './assets/qrbackground.png';
import tribeBanner from './assets/meetthetribe.png';

// Components
import { TokenScroller } from './components/TokenScroller';
import { BalanceCard } from './components/BalanceCard';
import { LeaderboardView } from './components/LeaderboardView';
import { NFTMint } from './components/NFTMint';
import { JoinFlow } from './components/JoinFlow';
import { SessionTimer } from './components/SessionTimer';
import { ManifoldNFTClaim } from './components/ManifoldNFTClaim';
import { NFTOwnershipBadge } from './components/NFTOwnershipBadge';
import { BTribeSwap } from './components/BTribeSwap';
import { HowItWorks } from './components/HowItWorks';
import { OnboardingPopup } from './components/OnboardingPopup';
import { JoinPageGuide } from './components/JoinPageGuide';
import { XCommunityPost } from './components/XCommunityPost';
import { CommunityStats } from './components/CommunityStats';
import { SwapRaidNotification } from './components/SwapRaidNotification';
import { ProjectsSection } from './components/ProjectsSection';
import { LiveRaidBlock } from './components/LiveRaidBlock';
import { SessionNotificationBanner } from './components/SessionNotificationBanner';
import { SessionProgressBlock } from './components/SessionProgressBlock';
import { WelcomeBanner } from './components/WelcomeBanner';
import { RainingSeasonOverlay } from './components/RainingSeasonOverlay';
import { ActivityFeed } from './components/ActivityFeed';

export default function App() {
  // ✅ SDK READY SIGNAL
  useEffect(() => {
    const load = async () => {
      try {
        await sdk.actions.ready();
      } catch (err) {
        console.error("SDK Ready Error:", err);
      }
    };
    load();
  }, []);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileData, setProfileData] = useState<{ pfpUrl: string; displayName: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [showJoinFlow, setShowJoinFlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJesse, setIsLoadingJesse] = useState(false);
  const [isLoadingRaidBtribe, setIsLoadingRaidBtribe] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userFid, setUserFid] = useState<string | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // ✅ SDK READY SIGNAL - Dynamically load Farcaster Frame SDK
  useEffect(() => {
    const load = async () => {
      try {
        // Dynamically import SDK to avoid build-time issues
        const { default: sdk } = await import('@farcaster/miniapp-sdk');
        await sdk.actions.ready();
        console.log('✅ Farcaster MiniApp SDK ready');
      } catch (err) {
        // SDK not available or failed to load - this is OK for non-frame environments
        console.warn("Farcaster Frame SDK not available (this is OK for web):", err);
      }
    };
    load();
  }, []);

  // Clear any stuck intervals on mount (fixes restored version issues)
  useEffect(() => {
    // Get the highest interval ID
    const intervalId = setInterval(() => {}, 9999999);
    // Clear all intervals up to that ID
    for (let i = 1; i < intervalId; i++) {
      clearInterval(i);
    }
    clearInterval(intervalId);
    console.log('🧹 Cleared any stuck intervals from previous version');
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection();
    
    // Load Manifold widget script globally once on app startup
    const manifoldScript = document.createElement('script');
    manifoldScript.src = 'https://connect.manifoldxyz.dev/2.3.11/connect.umd.js';
    manifoldScript.async = true;
    manifoldScript.id = 'manifold-widget-script';
    manifoldScript.onload = () => {
      console.log('✅ Manifold widget script loaded globally');
      // Dispatch event so components know script is ready
      window.dispatchEvent(new Event('manifoldScriptLoaded'));
    };
    
    // Only add if not already loaded
    if (!document.getElementById('manifold-widget-script')) {
      document.head.appendChild(manifoldScript);
    }
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      handleDisconnect();
    } else if (accounts[0] !== address) {
      // User switched accounts
      setAddress(accounts[0]);
      setIsConnected(true);
      loadUserData(accounts[0]);
    }
  };

  const checkConnection = async () => {
    const accounts = await getAccounts();
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      setIsConnected(true);
      loadUserData(accounts[0]);
    }
  };

  const handleConnect = async () => {
    const account = await connectWallet();
    if (account) {
      setAddress(account);
      setIsConnected(true);
      loadUserData(account);
    } else {
      setNotification({
        type: 'error',
        message: 'Please install MetaMask or another Web3 wallet',
      });
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setUserData(null);
    setProfileData(null);
    setIsMember(false);
    setUserFid(null);
  };

  // Load real user data from Google Sheets
  const loadUserData = async (walletAddress: string) => {
    setIsLoadingUserData(true);
    
    try {
      console.log('👤 Loading user data for wallet:', walletAddress);
      
      // Step 1: Get FID from wallet address
      const fid = await fetchFidFromWallet(walletAddress);
      
      if (!fid) {
        console.log('⚠️ No FID found for wallet, user is not a member');
        // User doesn't have FID - show zero balance
        const nonMemberUser: UserData = {
          telegram_id: '',
          telegram_username: '',
          farcaster_username: '',
          farcaster_fid: '',
          base_username: '',
          stars: 0,
          defaults: 0,
          btribe_balance: 0,
          jesse_balance: 0,
          status: '',
          session_streak: 0,
          followers: 0,
          profile_image: '',
          wallet_address: walletAddress,
          last_engaged_date: '',
          fail_count: 0,
          ban_status: '',
          email: '',
          probation_count: 0,
          invite_link: '',
          invites_count: 0,
          usdc_claims: 0,
          premium: false,
          shoutouts_left: 0,
          membership_nft: '',
          completed_tasks: '',
          booster: 0,
        };
        setUserData(nonMemberUser);
        setIsMember(false);
        setUserFid(null);
        setIsLoadingUserData(false);
        return;
      }
      
      console.log('✅ FID found:', fid);
      setUserFid(fid);
      
      // Step 2: Fetch user data from Google Sheets by FID
      const userData = await fetchUserDataByFID(fid);
      
      if (!userData) {
        console.log('⚠️ No user data found in Google Sheets for FID:', fid);
        // FID exists but not in sheets - show zero balance
        const newUser: UserData = {
          telegram_id: '',
          telegram_username: '',
          farcaster_username: '',
          farcaster_fid: fid,
          base_username: '',
          stars: 0,
          defaults: 0,
          btribe_balance: 0,
          jesse_balance: 0,
          status: '',
          session_streak: 0,
          followers: 0,
          profile_image: '',
          wallet_address: walletAddress,
          last_engaged_date: '',
          fail_count: 0,
          ban_status: '',
          email: '',
          probation_count: 0,
          invite_link: '',
          invites_count: 0,
          usdc_claims: 0,
          premium: false,
          shoutouts_left: 0,
          membership_nft: '',
          completed_tasks: '',
          booster: 0,
        };
        setUserData(newUser);
        setIsMember(false);
        setIsLoadingUserData(false);
        return;
      }
      
      console.log('✅ User data loaded from Google Sheets:', userData);
      
      // Step 3: Set user data with wallet address
      setUserData({
        ...userData,
        wallet_address: walletAddress,
      });
      
      // Step 4: Check membership status
      const membershipStatus = await checkMembership(fid);
      setIsMember(membershipStatus);
      
      // Step 5: Fetch Farcaster profile data
      if (userData.farcaster_fid) {
        const profile = await fetchFarcasterProfile(userData.farcaster_fid);
        if (profile) {
          setProfileData(profile);
        }
      }
      
      console.log('✅ User loaded successfully - Member:', membershipStatus);
      
      // Show welcome banner on first visit (check localStorage)
      const hasSeenBanner = localStorage.getItem('basetribe_seen_welcome_banner');
      if (!hasSeenBanner && membershipStatus) {
        setTimeout(() => setShowWelcomeBanner(true), 1000); // Show after 1 second
      }
      
    } catch (error) {
      console.warn('⚠️ User data temporarily unavailable');
      
      // On error, show zero balance
      const errorUser: UserData = {
        telegram_id: '',
        telegram_username: '',
        farcaster_username: '',
        farcaster_fid: '',
        base_username: '',
        stars: 0,
        defaults: 0,
        btribe_balance: 0,
        jesse_balance: 0,
        status: '',
        session_streak: 0,
        followers: 0,
        profile_image: '',
        wallet_address: walletAddress,
        last_engaged_date: '',
        fail_count: 0,
        ban_status: '',
        email: '',
        probation_count: 0,
        invite_link: '',
        invites_count: 0,
        usdc_claims: 0,
        premium: false,
        shoutouts_left: 0,
        membership_nft: '',
        completed_tasks: '',
        booster: 0,
      };
      setUserData(errorUser);
      setIsMember(false);
      setUserFid(null);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Fetch leaderboard
  useEffect(() => {
    loadLeaderboard();
    
    // Refresh leaderboard every hour (3600000 ms)
    const interval = setInterval(() => {
      loadLeaderboard();
      console.log('🔄 Leaderboard refreshed from Google Sheets');
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      console.log('📊 Fetching leaderboard from Google Sheets...');
      const data = await fetchLeaderboard();
      
      if (data && data.length > 0) {
        setLeaderboard(data);
        console.log(`✅ Loaded ${data.length} leaderboard entries from Sheets`);
      } else {
        // Silently set empty leaderboard - this is normal when data is loading
        setLeaderboard([]);
      }
    } catch (error) {
      // Silent fail - leaderboard will show empty state
      setLeaderboard([]);
    }
  };

  const handleClaim = async () => {
    if (!isConnected || !address || !userData || userData.btribe_balance === 0) {
      return;
    }

    try {
      setIsLoading(true);
      
      const fid = userData.farcaster_fid || userFid || '';
      console.log('🔍 Claiming tokens for wallet:', address, 'FID:', fid);
      
      // Call real claiming function from lib/claiming.ts
      const result = await claimTokens(address, userData.btribe_balance, fid);

      if (result.success) {
        setNotification({
          type: 'success',
          message: `Successfully claimed ${userData.btribe_balance} $BTRIBE! TX: ${result.txHash?.slice(0, 10)}...`,
        });
        
        // Update local state with new balance (should be 0 after full claim)
        const newBalance = result.newBalance !== undefined ? result.newBalance : 0;
        setUserData(prev => prev ? { ...prev, btribe_balance: newBalance } : null);
        
        // ✅ Update Google Sheets with new balance (CRITICAL - must succeed)
        if (fid && result.txHash) {
          try {
            await updateBTribeBalance(fid, newBalance, userData.btribe_balance, result.txHash);
            console.log('✅ $BTRIBE balance updated in Google Sheets');
          } catch (updateError) {
            console.error('❌ Failed to update Google Sheets:', updateError);
            // Show error to user - this is critical
            setNotification({
              type: 'error',
              message: 'Tokens claimed but failed to update balance record. Please contact support.',
            });
          }
        }
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to claim tokens. Please try again.',
        });
      }
    } catch (error) {
      console.error('Claim error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to claim tokens. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimJesse = async () => {
    if (!isConnected || !address || !isMember) {
      showMembershipAlert();
      return;
    }

    if (!userData || userData.jesse_balance === 0) {
      setNotification({
        type: 'error',
        message: 'No $JESSE balance available to claim.',
      });
      return;
    }

    try {
      setIsLoadingJesse(true);
      
      console.log('🔍 Claiming JESSE with user data:', userData);
      
      // Call real claiming function from lib/claiming.ts
      const result = await claimJesseTokens(address, userData.jesse_balance, userData);

      if (result.success) {
        setNotification({
          type: 'success',
          message: `Successfully claimed ${userData.jesse_balance} $JESSE! TX: ${result.txHash?.slice(0, 10)}...`,
        });
        
        // Update local state with new balance
        if (result.newBalance !== undefined) {
          setUserData(prev => prev ? { ...prev, jesse_balance: result.newBalance! } : null);
        }
        
        // ✅ Update Google Sheets with new balance (CRITICAL - must succeed)
        if (userData.farcaster_fid && result.txHash) {
          try {
            await updateJesseBalance(userData.farcaster_fid, result.newBalance!, userData.jesse_balance, result.txHash);
            console.log('✅ $JESSE balance updated in Google Sheets');
          } catch (updateError) {
            console.error('❌ Failed to update Google Sheets:', updateError);
            // Show error to user - this is critical
            setNotification({
              type: 'error',
              message: 'Tokens claimed but failed to update balance record. Please contact support.',
            });
          }
        }
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to claim tokens. Please try again.',
        });
      }
    } catch (error) {
      console.error('Claim error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to claim tokens. Please try again.',
      });
    } finally {
      setIsLoadingJesse(false);
    }
  };

  const handleClaimRaidBtribe = async () => {
    if (!isConnected || !address || !isMember) {
      showMembershipAlert();
      return;
    }

    if (!userData || userData.usdc_claims === 0) {
      setNotification({
        type: 'error',
        message: 'No USDC balance available to claim.',
      });
      return;
    }

    try {
      setIsLoadingRaidBtribe(true);
      
      console.log('🔍 Claiming USDC with user data:', userData);
      
      // Call real claiming function from lib/claiming.ts
      const result = await claimUSDC(address, userData.usdc_claims, userData);

      if (result.success) {
        setNotification({
          type: 'success',
          message: `Successfully claimed ${userData.usdc_claims} USDC! TX: ${result.txHash?.slice(0, 10)}...`,
        });
        
        // Update local state with new balance
        if (result.newBalance !== undefined) {
          setUserData(prev => prev ? { ...prev, usdc_claims: result.newBalance! } : null);
        }
        
        // ✅ Update Google Sheets with new balance (CRITICAL - must succeed)
        if (userData.farcaster_fid && result.txHash) {
          try {
            await updateUSDCBalance(userData.farcaster_fid, result.newBalance!, userData.usdc_claims, result.txHash);
            console.log('✅ USDC balance updated in Google Sheets');
          } catch (updateError) {
            console.error('❌ Failed to update Google Sheets:', updateError);
            // Show error to user - this is critical
            setNotification({
              type: 'error',
              message: 'Tokens claimed but failed to update balance record. Please contact support.',
            });
          }
        }
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to claim USDC. Please try again.',
        });
      }
    } catch (error) {
      console.error('USDC Claim error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to claim USDC. Please try again.',
      });
    } finally {
      setIsLoadingRaidBtribe(false);
    }
  };

  const handleJoinCommunity = () => {
    // Always show join flow - even for members who want to invite others
    setShowJoinFlow(true);
  };

  const showMembershipAlert = () => {
    setNotification({
      type: 'error',
      message: 'You are not a member of the tribe yet. Join us now!',
    });
    setTimeout(() => {
      setShowJoinFlow(true);
    }, 2000);
  };

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] via-[#002855] to-[#001F3F] overflow-x-hidden">
      {/* Welcome Banner - Shows on first visit */}
      <WelcomeBanner
        userData={userData}
        isVisible={showWelcomeBanner}
        onClose={() => {
          setShowWelcomeBanner(false);
          localStorage.setItem('basetribe_seen_welcome_banner', 'true');
        }}
      />

      {/* Responsive Container - Mobile first (430px) but expands on larger screens */}
      <div className="max-w-[430px] md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto relative">
        {/* Token Scroller */}
        <TokenScroller />

        {/* Header with Session Notification Banner - Both sticky */}
        <div className="sticky top-0 z-50">
          {/* Header */}
          <div className="bg-[#001F3F]/80 backdrop-blur-md border-b border-white/10">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={tribeLogo} 
                    alt="BaseTribe" 
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-white font-bold text-base sm:text-lg truncate">We Are a Tribe Community</h1>
                    <p className="text-white/60 text-xs">Built on Base</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* BETA Badge - Always visible */}
                  <div className="bg-[#001F3F] border border-[#00D4FF] rounded px-2 py-1">
                    <span className="text-white font-bold text-xs tracking-wider">BETA</span>
                  </div>
                  
                  {isConnected ? (
                    <>
                      {profileData && (
                        <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1">
                          {profileData.pfpUrl && (
                            <img 
                              src={profileData.pfpUrl} 
                              alt="Profile" 
                              className="w-6 h-6 rounded-full flex-shrink-0"
                            />
                          )}
                          <span className="text-white text-xs hidden sm:inline truncate max-w-[80px]">{profileData.displayName}</span>
                        </div>
                      )}
                      <Button
                        onClick={handleDisconnect}
                        variant="ghost"
                        size="icon"
                        className="text-white flex-shrink-0"
                      >
                        <LogOut className="w-5 h-5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleConnect}
                      className="bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold rounded-xl text-sm px-3 py-2"
                    >
                      <Wallet className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Session Notification Banner - Always visible with header */}
          <SessionNotificationBanner />
        </div>

        {/* Main Content */}
        <div className="px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab List */}
            <TabsList className="grid w-full grid-cols-5 bg-[#001F3F]/50 p-1 rounded-xl mb-6">
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7B2CBF] data-[state=active]:to-[#00D4FF] data-[state=active]:text-white rounded-lg"
              >
                <Home className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Home</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7B2CBF] data-[state=active]:to-[#00D4FF] data-[state=active]:text-white rounded-lg"
              >
                <Activity className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Feed</span>
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7B2CBF] data-[state=active]:to-[#00D4FF] data-[state=active]:text-white rounded-lg"
              >
                <Trophy className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Ranks</span>
              </TabsTrigger>
              <TabsTrigger
                value="community"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7B2CBF] data-[state=active]:to-[#00D4FF] data-[state=active]:text-white rounded-lg"
              >
                <Users className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Join</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7B2CBF] data-[state=active]:to-[#00D4FF] data-[state=active]:text-white rounded-lg"
              >
                <Swords className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">My Raids</span>
              </TabsTrigger>
            </TabsList>

            {/* Home Tab */}
            <TabsContent value="home" className="space-y-6 relative">
              {/* Raining Season Overlay */}
              {activeTab === 'home' && (
                <RainingSeasonOverlay 
                  isConnected={isConnected}
                  userFid={userFid}
                  onClaimSuccess={() => address && loadUserData(address)}
                />
              )}
              
              {/* Community Stats */}
              <CommunityStats />
              
              {/* Session Timer - No overflow wrapper needed */}
              <SessionTimer />
              
              {/* Session Progress Block */}
              <SessionProgressBlock 
                isConnected={isConnected}
                userData={userData}
              />
              
              <BalanceCard
                userData={userData}
                onClaim={isMember ? handleClaim : showMembershipAlert}
                isLoading={isLoading}
                onClaimJesse={handleClaimJesse}
                onClaimRaidBtribe={handleClaimRaidBtribe}
                isLoadingJesse={isLoadingJesse}
                isLoadingRaidBtribe={isLoadingRaidBtribe}
                isLoadingUserData={isLoadingUserData}
              />

              {/* NFT Ownership Badge Display */}
              <NFTOwnershipBadge 
                walletAddress={address}
                isConnected={isConnected}
              />

              {/* BTribe Token Swap */}
              <BTribeSwap 
                walletAddress={address}
                isConnected={isConnected}
              />

              {/* How It Works Floating Button */}
              <HowItWorks />

              {/* Onboarding Popup - First-time user guide */}
              <OnboardingPopup />

              {/* BaseTribe Characters Banner - Featured Preview */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#001F3F] to-[#0a0a0a] border-2 border-[#39FF14]/30 shadow-2xl shadow-[#39FF14]/20 p-0">
                {/* Bottom Left Badge - Responsive sizing */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-[#001F3F]/95 backdrop-blur-md border border-[#39FF14]/50 rounded-full px-2 py-1 sm:px-4 sm:py-2 shadow-lg">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#39FF14] animate-pulse" />
                    <span className="text-[#39FF14] font-bold text-[10px] sm:text-xs tracking-wider uppercase">Meet The Tribe</span>
                  </div>
                </div>

                {/* Banner Image */}
                <div className="relative w-full overflow-hidden">
                  <img 
                    src={tribeBanner}
                    alt="BaseTribe Characters - Cyberpunk Community"
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#39FF14]/10 to-transparent rounded-bl-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#00D4FF]/10 to-transparent rounded-tr-full pointer-events-none" />
              </Card>

              {/* BaseTribe NFT Membership Section */}
              <ManifoldNFTClaim 
                isConnected={isConnected} 
                walletAddress={address} 
                userFid={userFid}
              />
            </TabsContent>

            {/* Activity Feed Tab */}
            <TabsContent value="activity">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Activity Feed</h2>
                    <p className="text-sm text-gray-400">Latest community engagements</p>
                  </div>
                </div>
                <ActivityFeed 
                  userFid={userFid} 
                  limit={50} 
                  userData={userData}
                  onRefresh={() => address && loadUserData(address)}
                />
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <LeaderboardView leaderboard={leaderboard} />
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Join the Tribe 🌊</h2>
                <p className="text-white/60 text-sm">
                  Become part of the Base Tribe community
                </p>
              </div>

              <Card className="bg-gradient-to-br from-[#7B2CBF] to-[#00D4FF] p-6 rounded-xl border-0 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                  <Users className="w-16 h-16 mx-auto text-white" />
                  <h3 className="text-xl font-bold text-white">Ready to Join?</h3>
                  <p className="text-white/80">
                    Connect with fellow Base enthusiasts, participate in engagement sessions,
                    and earn $BTRIBE tokens for your contributions.
                  </p>
                  <Button
                    onClick={handleJoinCommunity}
                    className="w-full bg-white hover:bg-white/90 text-[#7B2CBF] font-bold py-6 rounded-xl touch-manipulation active:scale-95 transition-transform"
                  >
                    Start Joining Process
                  </Button>
                </div>
              </Card>

              {/* Join Page Guide */}
              <JoinPageGuide />

              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Card className="bg-[#001F3F]/50 p-4 rounded-xl border border-white/10">
                  <h4 className="text-[#39FF14] font-medium mb-2">Telegram</h4>
                  <p className="text-white/70 text-sm mb-3">Join our active community chat</p>
                  <a href={LINKS.TELEGRAM} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join
                    </Button>
                  </a>
                </Card>

                <Card className="bg-[#001F3F]/50 p-4 rounded-xl border border-white/10">
                  <h4 className="text-[#39FF14] font-medium mb-2">Farcaster</h4>
                  <p className="text-white/70 text-sm mb-3">Follow us on Farcaster</p>
                  <a href={LINKS.FARCASTER} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                  </a>
                </Card>

                <Card className="bg-[#001F3F]/50 p-4 rounded-xl border border-white/10">
                  <h4 className="text-[#39FF14] font-medium mb-2">Zora</h4>
                  <p className="text-white/70 text-sm mb-3">Check our Zora profile</p>
                  <a href={LINKS.ZORA} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit
                    </Button>
                  </a>
                </Card>
              </div>

              {/* X Community Post */}
              <XCommunityPost tweetUrl="https://x.com/TribeOnBase/status/1992043125573882361" />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {isConnected && userData ? (
                <div className="max-w-2xl mx-auto space-y-6">
                  <Card className="bg-gradient-to-br from-[#001F3F] to-[#003366] p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4 mb-6">
                      {profileData?.pfpUrl && (
                        <img
                          src={profileData.pfpUrl}
                          alt="Profile"
                          className="w-20 h-20 rounded-full border-2 border-[#39FF14]"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-white">{profileData?.displayName}</h3>
                        <p className="text-white/60">@{userData.farcaster_username}</p>
                        <Badge className={`mt-2 ${
                          isMember ? 'bg-[#39FF14] text-[#001F3F]' : 'bg-white/20 text-white'
                        }`}>
                          {isMember ? 'Full Member' : 'Not a Member'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-white/60 text-sm mb-1">Wallet</p>
                        <p className="text-white text-sm font-mono">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-white/60 text-sm mb-1">FID</p>
                        <p className="text-white text-sm">{userData.farcaster_fid}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-white/60 text-sm mb-1">Base Username</p>
                        <p className="text-white text-sm">{userData.base_username || 'Not set'}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-white/60 text-sm mb-1">Status</p>
                        <p className="text-white text-sm capitalize">{userData.status}</p>
                      </div>
                    </div>
                    
                    {/* Share Banner Button */}
                    <Button
                      onClick={() => setShowWelcomeBanner(true)}
                      className="w-full mt-4 bg-gradient-to-r from-[#39FF14] to-green-500 hover:from-[#39FF14]/90 hover:to-green-500/90 text-black font-bold py-3 rounded-xl shadow-lg hover:shadow-[#39FF14]/50 transition-all"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Your Stats Banner
                    </Button>
                  </Card>

                  <Card className="bg-[#001F3F]/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-white font-bold mb-4">Your Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Stars</span>
                        <span className="text-white font-bold">{userData.stars} ⭐</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Defaults</span>
                        <span className="text-white font-bold">{userData.defaults} ⚠️</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Session Streak</span>
                        <span className="text-white font-bold">{userData.session_streak} 🔥</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Invites</span>
                        <span className="text-[#00D4FF] font-bold">{userData.invites_count} 👥</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">$BTRIBE Balance</span>
                        <span className="text-[#39FF14] font-bold">{userData.btribe_balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">$JESSE Balance</span>
                        <span className="text-[#FFD700] font-bold">{userData.jesse_balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">USDC Balance</span>
                        <span className="text-[#2775CA] font-bold">{userData.usdc_claims.toLocaleString()} 💵</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Booster Balance</span>
                        <span className="text-[#7B2CBF] font-bold">{userData.booster.toLocaleString()} 🚀</span>
                      </div>
                      {userData.followers > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Followers</span>
                          <span className="text-white font-bold">{userData.followers.toLocaleString()}</span>
                        </div>
                      )}
                      {userData.probation_count > 0 && (
                        <div className="flex justify-between items-center border-t border-red-500/30 pt-3 mt-3">
                          <span className="text-red-400">Probation Count</span>
                          <span className="text-red-400 font-bold">{userData.probation_count} ⚠️</span>
                        </div>
                      )}
                      {userData.fail_count > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400">Fail Count</span>
                          <span className="text-orange-400 font-bold">{userData.fail_count}</span>
                        </div>
                      )}
                      {userData.premium && (
                        <div className="flex justify-between items-center border-t border-yellow-500/30 pt-3 mt-3">
                          <span className="text-yellow-400">Premium Status</span>
                          <span className="text-yellow-400 font-bold">✨ VIP</span>
                        </div>
                      )}
                      {userData.membership_nft && (
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400">NFT Membership</span>
                          <span className="text-purple-400 font-bold text-xs">{userData.membership_nft}</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Live Raid Block */}
                  <LiveRaidBlock 
                    isConnected={isConnected} 
                    userData={userData}
                    onRefreshUserData={() => address && loadUserData(address)}
                  />
                </div>
              ) : (
                <Card className="bg-[#001F3F]/50 p-8 rounded-xl border border-white/10 max-w-md mx-auto text-center">
                  <Wallet className="w-16 h-16 mx-auto text-white/40 mb-4" />
                  <h3 className="text-white font-bold mb-2">Connect Your Wallet</h3>
                  <p className="text-white/60 mb-4">
                    Connect your wallet to view your profile and stats
                  </p>
                  <Button
                    onClick={handleConnect}
                    className="bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold py-3 rounded-xl"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Join Flow Dialog */}
        <JoinFlow open={showJoinFlow} onOpenChange={setShowJoinFlow} />

        {/* Projects Section */}
        <ProjectsSection />

        {/* Footer with Donation Section */}
        <div className="mt-12">
          {/* Donation Section with Background */}
          <div className="relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: `url(${donationBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#001F3F]/70 via-[#001F3F]/80 to-[#001F3F]" />
            
            {/* Donation Content */}
            <div className="relative max-w-4xl mx-auto px-4 py-16">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-[#39FF14]/20 border border-[#39FF14] rounded-full px-6 py-2 mb-4">
                  <Rocket className="w-5 h-5 text-[#39FF14]" />
                  <span className="text-[#39FF14] font-bold tracking-wide uppercase text-sm">Support the Tribe</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Donate to This Community
                </h2>
                <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">
                  These donation funds are used to support more community projects, development and raid events
                </p>
              </div>

              {/* QR Code and Wallet Address Card */}
              <Card className="bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#003366] border-2 border-[#39FF14]/30 rounded-2xl p-8 shadow-2xl shadow-[#39FF14]/20 max-w-2xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* QR Code */}
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#39FF14] to-[#00D4FF] rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-white p-3 rounded-xl">
                      <img 
                        src={qrCodeImage} 
                        alt="Donation QR Code" 
                        className="w-40 h-40 md:w-48 md:h-48"
                      />
                    </div>
                  </div>

                  {/* Wallet Address */}
                  <div className="flex-1 w-full">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[#39FF14] text-xs font-semibold tracking-widest uppercase mb-2">
                          Ethereum Address
                        </p>
                        <div className="bg-[#001F3F]/80 backdrop-blur-sm p-4 rounded-xl border border-[#39FF14]/30">
                          <p className="text-white font-mono text-xs md:text-sm break-all leading-relaxed">
                            0xe7550917d87D6a9852055f8e20630647Aa5C9370
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-[#39FF14]/10 p-3 rounded-lg">
                        <Shield className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                        <p className="text-white/80 text-xs">
                          Scan QR code or send donations directly to the address above on Base network
                        </p>
                      </div>

                      <Button
                        onClick={async () => {
                          const success = await copyToClipboard('0xe7550917d87D6a9852055f8e20630647Aa5C9370');
                          setNotification({
                            type: success ? 'success' : 'error',
                            message: success 
                              ? 'Wallet address copied to clipboard!'
                              : 'Failed to copy. Please copy manually.',
                          });
                        }}
                        className="w-full bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-[#001F3F] font-bold py-3 rounded-xl shadow-lg shadow-[#39FF14]/30 transition-all hover:shadow-[#39FF14]/50"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Copy Address
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer Credits */}
          <div className="pb-8 text-center">
            <p className="text-white/40 text-sm">
              Built on Base by Base Tribe.
            </p>
          </div>
        </div>
      </div>
      

    </div>
  );
}