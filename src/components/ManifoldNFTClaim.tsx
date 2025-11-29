import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Shield, Sparkles, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { fetchNFTMetadata, NFT_CONFIG } from '../lib/nft';
import { mintNFT, waitForTransaction, MINT_PRICES, MINT_PRICE_BREAKDOWN, openManifoldClaimPage } from '../lib/nftMinting';
import { updateMembershipNFT } from '../lib/api';
import { fetchFidFromWallet } from '../lib/claiming';
import type { NFTMetadata } from '../lib/nft';
import bannerImage from '../assets/nftmint.png';
import { ManifoldMintButton } from './ManifoldMintButton';

interface ManifoldNFTClaimProps {
  isConnected: boolean;
  walletAddress: string | null;
  userFid?: string | null;
}

export function ManifoldNFTClaim({ isConnected, walletAddress, userFid }: ManifoldNFTClaimProps) {
  const [founderMetadata, setFounderMetadata] = useState<NFTMetadata | null>(null);
  const [believerMetadata, setBelieverMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<{ name: string; description: string } | null>(null);
  
  // Minting states
  const [isMintingFounder, setIsMintingFounder] = useState(false);
  const [isMintingBeliever, setIsMintingBeliever] = useState(false);
  const [mintSuccess, setMintSuccess] = useState<{ founder: boolean; believer: boolean }>({ founder: false, believer: false });
  const [mintError, setMintError] = useState<string | null>(null);
  
  // Manifold widget modal states
  const [showManifoldModal, setShowManifoldModal] = useState(false);
  const [manifoldUrl, setManifoldUrl] = useState('');
  const [manifoldTokenName, setManifoldTokenName] = useState('');

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [founderMeta, believerMeta] = await Promise.all([
        fetchNFTMetadata(NFT_CONFIG.TOKENS.FOUNDER.metadataUrl),
        fetchNFTMetadata(NFT_CONFIG.TOKENS.BELIEVER.metadataUrl),
      ]);

      setFounderMetadata(founderMeta);
      setBelieverMetadata(believerMeta);
    } catch (error) {
      console.error('Error loading NFT metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async (tokenId: string, tokenName: 'founder' | 'believer') => {
    if (!walletAddress) {
      setMintError('Please connect your wallet first');
      return;
    }

    const setMinting = tokenName === 'founder' ? setIsMintingFounder : setIsMintingBeliever;
    
    try {
      setMinting(true);
      setMintError(null);
      
      console.log(`🎨 Initiating ${tokenName} NFT mint...`);
      
      // Call mint function
      const result = await mintNFT(tokenId, walletAddress);
      
      if (result.success && result.txHash) {
        console.log('✅ Transaction submitted:', result.txHash);
        
        // Show success immediately
        setMintSuccess(prev => ({ ...prev, [tokenName]: true }));
        
        // Update Google Sheets with NFT claim
        try {
          // Get FID - either from prop or fetch from wallet
          let fid = userFid;
          if (!fid) {
            console.log('No FID provided, fetching from wallet...');
            fid = await fetchFidFromWallet(walletAddress);
          }
          
          if (fid) {
            const nftType = tokenName === 'founder' ? 'FOUNDER' : 'BELIEVER';
            console.log(`📝 Updating membershipNFT in Google Sheets for FID ${fid}...`);
            
            const updated = await updateMembershipNFT(
              fid,
              walletAddress,
              result.txHash,
              nftType
            );
            
            if (updated) {
              console.log('✅ Membership NFT updated in Google Sheets successfully');
            } else {
              console.warn('⚠️ Failed to update Google Sheets (mint still succeeded)');
            }
          } else {
            console.warn('⚠️ No FID found for wallet, skipping Google Sheets update');
          }
        } catch (updateError) {
          console.error('⚠️ Error updating Google Sheets (mint still succeeded):', updateError);
        }
        
        // Wait for confirmation in background
        waitForTransaction(result.txHash).then(confirmed => {
          if (confirmed) {
            console.log('✅ Transaction confirmed!');
          }
        });
        
        // Auto-hide success after 5 seconds
        setTimeout(() => {
          setMintSuccess(prev => ({ ...prev, [tokenName]: false }));
        }, 5000);
      } else {
        setMintError(result.error || 'Failed to mint NFT');
        setTimeout(() => setMintError(null), 5000);
      }
    } catch (error) {
      console.error('Mint error:', error);
      setMintError('An unexpected error occurred. Please try again.');
      setTimeout(() => setMintError(null), 5000);
    } finally {
      setMinting(false);
    }
  };

  // Calculate USD prices
  const getUsdPrice = (ethPrice: string, ethUsdRate: number = 3000) => {
    return (parseFloat(ethPrice) * ethUsdRate).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Banner only - no text */}
      <Card className="relative overflow-hidden rounded-2xl border-2 border-transparent p-0">
        {/* Premium animated border gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7B2CBF] via-[#00D4FF] to-[#7B2CBF] opacity-50 blur-sm animate-border-flow" />
        
        {/* Inner container with border offset */}
        <div className="relative m-[2px] rounded-2xl overflow-hidden">
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#7B2CBF]/0 via-[#00D4FF]/20 to-[#7B2CBF]/0 animate-shimmer pointer-events-none z-10" />
          
          {/* Banner Image - fits naturally */}
          <img 
            src={bannerImage} 
            alt="Base Tribe Banner"
            className="w-full h-auto block"
            style={{
              display: 'block',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
      </Card>

      {/* Text section below banner */}
      <div className="text-center space-y-4 px-4">
        {/* Trippy text */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl relative leading-relaxed">
          <span 
            className="relative font-extrabold animate-trippy-text"
            style={{
              background: 'linear-gradient(90deg, #001F3F 0%, #00D4FF 15%, #87CEEB 30%, #00D4FF 45%, #7B2CBF 60%, #FF8C00 75%, #7B2CBF 85%, #00D4FF 100%)',
              backgroundSize: '400% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.9)) drop-shadow(0 0 15px rgba(123,44,191,0.7)) drop-shadow(0 0 25px rgba(255,140,0,0.5)) drop-shadow(0 0 35px rgba(135,206,235,0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.8))',
              animation: 'rainbow-slide 6s linear infinite, text-glow-pulse 3s ease-in-out infinite'
            }}
          >
            Claim your exclusive membership badges on Base Network
          </span>
        </p>
        
        {/* Limited Edition Badge */}
        <div className="flex items-center justify-center">
          <Badge className="bg-gradient-to-r from-[#00D4FF] via-[#7B2CBF] to-[#FF8C00] text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 shadow-2xl shadow-[#00D4FF]/70 text-xs sm:text-sm font-bold">
            <Sparkles className="w-3 h-3 mr-1 inline" />
            Limited Edition
          </Badge>
        </div>
        
        {/* Add custom animation keyframes */}
        <style>{`
          @keyframes rainbow-slide {
            0% {
              background-position: 0% center;
            }
            100% {
              background-position: 400% center;
            }
          }
          
          @keyframes text-glow-pulse {
            0%, 100% {
              filter: drop-shadow(0 0 8px rgba(0,212,255,0.9)) drop-shadow(0 0 15px rgba(123,44,191,0.7)) drop-shadow(0 0 25px rgba(255,140,0,0.5)) drop-shadow(0 0 35px rgba(135,206,235,0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.8));
            }
            50% {
              filter: drop-shadow(0 0 15px rgba(0,212,255,1)) drop-shadow(0 0 25px rgba(123,44,191,0.9)) drop-shadow(0 0 40px rgba(255,140,0,0.7)) drop-shadow(0 0 50px rgba(135,206,235,0.8)) drop-shadow(2px 2px 4px rgba(0,0,0,0.8));
            }
          }
          
          .animate-trippy-text {
            animation: rainbow-slide 6s linear infinite, text-glow-pulse 3s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Error notification */}
      {mintError && (
        <Card className="bg-red-500/20 border-2 border-red-500 p-4 rounded-xl max-w-5xl mx-auto">
          <p className="text-white text-center text-sm">{mintError}</p>
        </Card>
      )}

      {!isConnected ? (
        <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 p-8 rounded-xl border-2 border-[#7B2CBF]/30 backdrop-blur-sm text-center">
          <Shield className="w-16 h-16 mx-auto text-white/40 mb-4" />
          <p className="text-white text-lg font-medium mb-2">Connect Your Wallet</p>
          <p className="text-white/60 text-sm">
            You need to connect your wallet to view and claim NFT badges
          </p>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-[#001F3F]/50 p-3 sm:p-6 rounded-xl border border-white/10">
              <div className="animate-pulse space-y-2 sm:space-y-4">
                <div className="w-full aspect-square bg-white/10 rounded-xl" />
                <div className="h-4 sm:h-6 bg-white/10 rounded w-3/4" />
                <div className="h-3 sm:h-4 bg-white/10 rounded w-full" />
                <div className="h-10 sm:h-14 bg-white/10 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Base Tribe Founder NFT - PREMIUM DESIGN */}
          <div className="relative overflow-hidden group">
            {/* Multi-layer purple glow effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#7B2CBF] via-[#9D4EDD] to-[#7B2CBF] rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 animate-pulse transition-opacity duration-1000 pointer-events-none"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-[#7B2CBF]/20 via-transparent to-[#9D4EDD]/20 rounded-2xl blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '3s' }}></div>
            
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            
            {/* Glass morphism card */}
            <Card className="relative bg-gradient-to-br from-[#1a0a2e]/95 via-[#0f0520]/90 to-[#000000]/95 backdrop-blur-xl p-3 sm:p-5 md:p-6 lg:p-7 rounded-xl sm:rounded-2xl border border-[#7B2CBF]/40 shadow-[0_8px_32px_0_rgba(123,44,191,0.25)]">
              {/* Floating particles effect */}
              <div className="absolute top-2 left-4 w-1 h-1 bg-[#7B2CBF] rounded-full animate-ping pointer-events-none" style={{ animationDuration: '2s' }}></div>
              <div className="absolute top-4 right-8 w-1 h-1 bg-[#9D4EDD] rounded-full animate-ping pointer-events-none" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
              <div className="absolute bottom-6 left-12 w-1 h-1 bg-[#7B2CBF] rounded-full animate-ping pointer-events-none" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7B2CBF] to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5">
                {/* NFT Image */}
                <div className="relative">
                  <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-[#7B2CBF]/50 sm:border-2 shadow-xl sm:shadow-2xl shadow-[#7B2CBF]/40">
                    {founderMetadata?.image ? (
                      <img 
                        src={founderMetadata.image} 
                        alt="Base Tribe Founder" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#7B2CBF] to-[#5A1F9A] flex items-center justify-center">
                        <Shield className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-white/40" />
                      </div>
                    )}
                  </div>
                  <Badge className="absolute top-1 right-1 sm:top-2 sm:right-2 md:top-3 md:right-3 bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white border-0 shadow-lg text-[10px] sm:text-xs md:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1">
                    Token #1
                  </Badge>
                </div>

                {/* NFT Info */}
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2">
                      <span className="truncate">{founderMetadata?.name || 'Base Tribe Founder'}</span>
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#7B2CBF] flex-shrink-0 drop-shadow-[0_0_10px_rgba(123,44,191,0.8)]" />
                    </h3>
                    <p 
                      className="text-white/70 text-[10px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed line-clamp-2 cursor-pointer hover:text-white/90 transition-colors"
                      onClick={() => {
                        setSelectedNFT({
                          name: founderMetadata?.name || 'Base Tribe Founder',
                          description: founderMetadata?.description || 'Founding member of Base Tribe'
                        });
                        setShowDescriptionModal(true);
                      }}
                    >
                      {founderMetadata?.description || 'Founding member of Base Tribe'}
                    </p>
                  </div>
                  
                  {/* Price Breakdown - Enhanced */}
                  <div className="relative overflow-hidden group/price">
                    <div className="absolute -inset-1 bg-[#7B2CBF]/20 rounded-lg blur-md pointer-events-none"></div>
                    <div className="relative bg-gradient-to-br from-[#7B2CBF]/15 via-[#9D4EDD]/10 to-[#7B2CBF]/15 border border-[#7B2CBF]/30 rounded-lg px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 space-y-1 sm:space-y-1.5 md:space-y-2 backdrop-blur-sm">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm text-white/60">
                        <span className="truncate pr-1">Price per Mint</span>
                        <span className="font-medium whitespace-nowrap">1 × {MINT_PRICE_BREAKDOWN.FOUNDER.mintPrice} ETH</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm text-white/60">
                        <span>Subtotal</span>
                        <span className="font-medium">{MINT_PRICE_BREAKDOWN.FOUNDER.mintPrice} ETH</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm text-white/60">
                        <span>Manifold Fee</span>
                        <span className="font-medium">{MINT_PRICE_BREAKDOWN.FOUNDER.manifoldFee} ETH</span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-[#7B2CBF]/40 to-transparent my-1" />
                      <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm text-white/50">
                        <span>Mint on</span>
                        <span className="font-medium text-[#7B2CBF]">Base Network</span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-[#7B2CBF]/40 to-transparent my-1" />
                      <div className="flex justify-between items-center text-xs sm:text-sm md:text-base text-white font-bold">
                        <span>Total</span>
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#7B2CBF] blur-md opacity-40 pointer-events-none"></div>
                          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] drop-shadow-[0_0_10px_rgba(123,44,191,0.6)]">{MINT_PRICE_BREAKDOWN.FOUNDER.total} ETH</span>
                        </div>
                      </div>
                      <div className="text-center text-[9px] sm:text-xs text-white/40 mt-0.5 sm:mt-1 pt-0.5 sm:pt-1">
                        (~${getUsdPrice(MINT_PRICES.FOUNDER)} + gas)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Mint Button - Integrated with Farcaster SDK */}
                <ManifoldMintButton
                  instanceId={1n}
                  priceEth="0.00617"
                  badgeName="Founder Badge"
                  badgeColor="purple"
                />
                
                {/* Failsafe: Manifold Widget Button */}
                <button
                  onClick={() => {
                    setManifoldUrl(`https://manifold.xyz/@elogiso/id/4117309680?referrer=${walletAddress}`);
                    setManifoldTokenName('Founder Badge');
                    setShowManifoldModal(true);
                  }}
                  className="w-full text-center text-[9px] sm:text-xs text-white/40 hover:text-white/70 transition-colors py-1 sm:py-2 flex items-center justify-center gap-1 sm:gap-1.5 group/alt"
                >
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-60 group-hover/alt:opacity-100" />
                  <span className="hidden sm:inline">Alternative: Mint via Manifold</span>
                  <span className="sm:hidden">Alt: Manifold</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Base Tribe Believer NFT - PREMIUM DESIGN */}
          <div className="relative overflow-hidden group">
            {/* Multi-layer cyan glow effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00D4FF] via-[#00BFFF] to-[#00D4FF] rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 animate-pulse transition-opacity duration-1000 pointer-events-none"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-[#00D4FF]/20 via-transparent to-[#00BFFF]/20 rounded-2xl blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '3s' }}></div>
            
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            
            {/* Glass morphism card */}
            <Card className="relative bg-gradient-to-br from-[#001a2e]/95 via-[#00121f]/90 to-[#000000]/95 backdrop-blur-xl p-3 sm:p-5 md:p-6 lg:p-7 rounded-xl sm:rounded-2xl border border-[#00D4FF]/40 shadow-[0_8px_32px_0_rgba(0,212,255,0.25)]">
              {/* Floating particles effect */}
              <div className="absolute top-2 left-4 w-1 h-1 bg-[#00D4FF] rounded-full animate-ping pointer-events-none" style={{ animationDuration: '2s' }}></div>
              <div className="absolute top-4 right-8 w-1 h-1 bg-[#00BFFF] rounded-full animate-ping pointer-events-none" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
              <div className="absolute bottom-6 left-12 w-1 h-1 bg-[#00D4FF] rounded-full animate-ping pointer-events-none" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5">
                {/* NFT Image */}
                <div className="relative">
                  <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-[#00D4FF]/50 sm:border-2 shadow-xl sm:shadow-2xl shadow-[#00D4FF]/40">
                    {believerMetadata?.image ? (
                      <img 
                        src={believerMetadata.image} 
                        alt="Base Tribe Believer" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#00D4FF] to-[#0099CC] flex items-center justify-center">
                        <Shield className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-white/40" />
                      </div>
                    )}
                  </div>
                  <Badge className="absolute top-1 right-1 sm:top-2 sm:right-2 md:top-3 md:right-3 bg-gradient-to-r from-[#00D4FF] to-[#00BFFF] text-[#001F3F] border-0 shadow-lg text-[10px] sm:text-xs md:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1">
                    Token #2
                  </Badge>
                </div>

                {/* NFT Info */}
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2">
                      <span className="truncate">{believerMetadata?.name || 'Base Tribe Believer'}</span>
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#00D4FF] flex-shrink-0 drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                    </h3>
                    <p 
                      className="text-white/70 text-[10px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed line-clamp-2 cursor-pointer hover:text-white/90 transition-colors"
                      onClick={() => {
                        setSelectedNFT({
                          name: believerMetadata?.name || 'Base Tribe Believer',
                          description: believerMetadata?.description || 'I believe in Base and its tribe'
                        });
                        setShowDescriptionModal(true);
                      }}
                    >
                      {believerMetadata?.description || 'I believe in Base and its tribe'}
                    </p>
                  </div>
                  
                  {/* Price Breakdown - Enhanced */}
                  <div className="relative overflow-hidden group/price">
                    <div className="absolute -inset-1 bg-[#00D4FF]/20 rounded-lg blur-md pointer-events-none"></div>
                    <div className="relative bg-gradient-to-br from-[#00D4FF]/15 via-[#00BFFF]/10 to-[#00D4FF]/15 border border-[#00D4FF]/30 rounded-lg px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 space-y-1 sm:space-y-1.5 md:space-y-2 backdrop-blur-sm">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm text-white/60">
                        <span className="truncate pr-1">Price per Mint</span>
                        <span className="font-medium whitespace-nowrap">1 × {MINT_PRICE_BREAKDOWN.BELIEVER.mintPrice} ETH</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm text-white/60">
                        <span>Subtotal</span>
                        <span className="font-medium">{MINT_PRICE_BREAKDOWN.BELIEVER.mintPrice} ETH</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm text-white/60">
                        <span>Manifold Fee</span>
                        <span className="font-medium">{MINT_PRICE_BREAKDOWN.BELIEVER.manifoldFee} ETH</span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent my-1" />
                      <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm text-white/50">
                        <span>Mint on</span>
                        <span className="font-medium text-[#00D4FF]">Base Network</span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent my-1" />
                      <div className="flex justify-between items-center text-xs sm:text-sm md:text-base text-white font-bold">
                        <span>Total</span>
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#00D4FF] blur-md opacity-40 pointer-events-none"></div>
                          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#00BFFF] drop-shadow-[0_0_10px_rgba(0,212,255,0.6)]">{MINT_PRICE_BREAKDOWN.BELIEVER.total} ETH</span>
                        </div>
                      </div>
                      <div className="text-center text-[9px] sm:text-xs text-white/40 mt-0.5 sm:mt-1 pt-0.5 sm:pt-1">
                        (~${getUsdPrice(MINT_PRICES.BELIEVER)} + gas)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Mint Button - Integrated with Farcaster SDK */}
                <ManifoldMintButton
                  instanceId={2n}
                  priceEth="0.001"
                  badgeName="Believer Badge"
                  badgeColor="cyan"
                />
                
                {/* Failsafe: Manifold Widget Button */}
                <button
                  onClick={() => {
                    setManifoldUrl(`https://manifold.xyz/@elogiso/id/4117350640?referrer=${walletAddress}`);
                    setManifoldTokenName('Believer Badge');
                    setShowManifoldModal(true);
                  }}
                  className="w-full text-center text-[9px] sm:text-xs text-white/40 hover:text-white/70 transition-colors py-1 sm:py-2 flex items-center justify-center gap-1 sm:gap-1.5 group/alt"
                >
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-60 group-hover/alt:opacity-100" />
                  <span className="hidden sm:inline">Alternative: Mint via Manifold</span>
                  <span className="sm:hidden">Alt: Manifold</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Info Footer - Coinbase/Binance style */}
      <Card className="bg-gradient-to-r from-[#39FF14]/10 via-[#39FF14]/5 to-[#39FF14]/10 border-2 border-[#39FF14]/30 p-5 rounded-xl max-w-5xl mx-auto backdrop-blur-sm">
        <div className="space-y-3">
          <p className="text-white/90 text-sm text-center font-medium">
            ⚠️ These NFTs help us keep track of our believers and founding members.
            You are allowed to mint both. Remaining supply will be burned anytime.
          </p>
          
          {/* Security Notice */}
          <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white font-medium text-sm mb-1">
                  🛡️ Security & Payment Notice
                </p>
                <p className="text-white/70 text-xs leading-relaxed">
                  Direct minting from contract on <span className="text-[#00D4FF] font-semibold">Base Network</span>. <span className="text-[#39FF14] font-semibold">100% secure</span>. If main mint fails due to any reason, mint directly on the verified contract via Manifold with the alternative link below. ✅
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-white/60 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-white/40">Contract:</span>
              <code className="text-[#39FF14] font-mono">{NFT_CONFIG.CONTRACT_ADDRESS.slice(0, 6)}...{NFT_CONFIG.CONTRACT_ADDRESS.slice(-4)}</code>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/40">Chain:</span>
              <span className="text-[#00D4FF]">Base Network</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/40">Standard:</span>
              <span className="text-[#7B2CBF]">ERC-1155</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Description Modal */}
      <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
        <DialogContent className="bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#001F3F] border-2 border-[#39FF14]/40 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {selectedNFT?.name}
              <Sparkles className="w-5 h-5 text-[#39FF14]" />
            </DialogTitle>
            <DialogDescription className="text-base text-white/80 pt-4 leading-relaxed whitespace-pre-wrap">
              {selectedNFT?.description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      {/* Manifold Widget Modal */}
      <Dialog open={showManifoldModal} onOpenChange={setShowManifoldModal}>
        <DialogContent className="bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#001F3F] border-2 border-[#00D4FF]/40 max-w-[95vw] md:max-w-4xl w-full max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4 border-b border-white/10">
            <DialogTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#00D4FF]" />
              Mint {manifoldTokenName}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-white/70 pt-2">
              Powered by Manifold - Your wallet will be automatically detected. Make sure you're on Base Network!
            </DialogDescription>
          </DialogHeader>
          
          {/* Iframe Container - Increased height and made scrollable */}
          <div className="w-full h-[70vh] md:h-[75vh] bg-white overflow-auto">
            <iframe
              src={manifoldUrl}
              className="w-full h-full min-h-[600px] border-0"
              title={`Mint ${manifoldTokenName}`}
              allow="payment; web3; clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
            />
          </div>
          
          {/* Footer */}
          <div className="p-3 md:p-4 border-t border-white/10 bg-[#001F3F]/50">
            <p className="text-xs text-white/50 text-center">
              🔒 Secure minting via Manifold's official interface • Base Network
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}