import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Shield, Sparkles, ExternalLink } from 'lucide-react';
import { ManifoldMintButton } from './ManifoldMintButton';
import bannerImage from '../assets/nftmint.png';

// 1. STATIC DATA (Prevents "Loading..." stuck state)
const MINT_PRICES = {
  FOUNDER: '0.00617',
  BELIEVER: '0.001'
};

const MINT_PRICE_BREAKDOWN = {
  FOUNDER: { mintPrice: '0.00567', manifoldFee: '0.0005', total: '0.00617' },
  BELIEVER: { mintPrice: '0.0005', manifoldFee: '0.0005', total: '0.001' }
};

const NFT_DATA = {
  FOUNDER: {
    name: 'Base Tribe Founder',
    description: 'Founding member of Base Tribe. Exclusive benefits for holders.',
    image: null // Set to a URL string if you have a static image, else uses Icon fallback
  },
  BELIEVER: {
    name: 'Base Tribe Believer',
    description: 'I believe in Base and its tribe. Future benefits await holders.',
    image: null
  }
};

interface ManifoldNFTClaimProps {
  isConnected: boolean;
  walletAddress: string | null;
  userFid?: string | null;
}

export function ManifoldNFTClaim({ isConnected, walletAddress }: ManifoldNFTClaimProps) {
  const [showManifoldModal, setShowManifoldModal] = useState(false);
  const [manifoldUrl, setManifoldUrl] = useState('');
  const [manifoldTokenName, setManifoldTokenName] = useState('');
  
  // Modal state for description
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<{ name: string; description: string } | null>(null);

  const getUsdPrice = (ethPrice: string) => (parseFloat(ethPrice) * 3600).toFixed(2); 

  return (
    <div className="space-y-6">
      {/* Banner - Premium Animated Style */}
      <Card className="relative overflow-hidden rounded-2xl border-2 border-transparent p-0">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7B2CBF] via-[#00D4FF] to-[#7B2CBF] opacity-50 blur-sm animate-border-flow" />
        <div className="relative m-[2px] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7B2CBF]/0 via-[#00D4FF]/20 to-[#7B2CBF]/0 animate-shimmer pointer-events-none z-10" />
          <img 
            src={bannerImage} 
            alt="Base Tribe Banner" 
            className="w-full h-auto block"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </Card>

      {/* Header Text */}
      <div className="text-center space-y-4 px-4">
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl relative leading-relaxed">
          <span className="relative font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#7B2CBF] to-[#00D4FF] animate-pulse">
            Claim your exclusive membership badges on Base Network
          </span>
        </p>
        
        <div className="flex items-center justify-center">
          <Badge className="bg-gradient-to-r from-[#00D4FF] via-[#7B2CBF] to-[#FF8C00] text-white border-0 px-3 sm:px-4 py-1.5 shadow-2xl font-bold">
            <Sparkles className="w-3 h-3 mr-1 inline" /> Limited Edition
          </Badge>
        </div>
      </div>

      {!isConnected ? (
        <Card className="bg-gradient-to-br from-[#001F3F]/80 to-[#003366]/80 p-8 rounded-xl border-2 border-[#7B2CBF]/30 backdrop-blur-sm text-center">
          <Shield className="w-16 h-16 mx-auto text-white/40 mb-4" />
          <p className="text-white text-lg font-medium mb-2">Connect Your Wallet</p>
          <p className="text-white/60 text-sm">You need to connect your wallet to view and claim NFT badges</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* ================= FOUNDER CARD ================= */}
          <div className="relative overflow-hidden group">
            {/* Glow Effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#7B2CBF] via-[#9D4EDD] to-[#7B2CBF] rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none"></div>
            
            <Card className="relative bg-gradient-to-br from-[#1a0a2e]/95 to-[#000000]/95 backdrop-blur-xl p-5 rounded-2xl border border-[#7B2CBF]/40 h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Image / Icon Placeholder */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-[#7B2CBF]/50 shadow-2xl shadow-[#7B2CBF]/20 bg-gradient-to-br from-[#7B2CBF] to-[#5A1F9A] flex items-center justify-center">
                   {NFT_DATA.FOUNDER.image ? (
                     <img src={NFT_DATA.FOUNDER.image} alt="Founder" className="w-full h-full object-cover" />
                   ) : (
                     <Shield className="w-20 h-20 text-white/40" />
                   )}
                   <Badge className="absolute top-2 right-2 bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] border-0 text-white">Token #1</Badge>
                </div>

                {/* Title & Desc */}
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     {NFT_DATA.FOUNDER.name} <Sparkles className="w-4 h-4 text-[#7B2CBF]" />
                   </h3>
                   <p className="text-xs text-white/70 line-clamp-2 cursor-pointer hover:text-white"
                      onClick={() => {
                        setSelectedNFT(NFT_DATA.FOUNDER);
                        setShowDescriptionModal(true);
                      }}>
                     {NFT_DATA.FOUNDER.description}
                   </p>
                </div>

                {/* Price Box */}
                <div className="bg-[#7B2CBF]/10 border border-[#7B2CBF]/30 rounded-lg p-3 space-y-1.5 backdrop-blur-sm">
                   <div className="flex justify-between text-xs text-white/60">
                      <span>Mint</span> <span>{MINT_PRICE_BREAKDOWN.FOUNDER.mintPrice} ETH</span>
                   </div>
                   <div className="flex justify-between text-xs text-white/60">
                      <span>Fee</span> <span>{MINT_PRICE_BREAKDOWN.FOUNDER.manifoldFee} ETH</span>
                   </div>
                   <div className="h-px bg-[#7B2CBF]/30 my-1" />
                   <div className="flex justify-between text-sm font-bold text-white">
                      <span>Total</span> <span className="text-[#9D4EDD]">{MINT_PRICE_BREAKDOWN.FOUNDER.total} ETH</span>
                   </div>
                   <div className="text-center text-[10px] text-white/40">(~${getUsdPrice(MINT_PRICES.FOUNDER)})</div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 mt-4">
                <ManifoldMintButton
                  instanceId={4117309680n}
                  priceEth="0.00617"
                  badgeName="Founder Badge"
                  badgeColor="purple"
                />
                <button
                  onClick={() => {
                    setManifoldUrl(`https://manifold.xyz/@elogiso/id/4117309680?referrer=${walletAddress}`);
                    setManifoldTokenName('Founder Badge');
                    setShowManifoldModal(true);
                  }}
                  className="w-full text-center text-xs text-white/40 hover:text-white flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Mint via Manifold
                </button>
              </div>
            </Card>
          </div>

          {/* ================= BELIEVER CARD ================= */}
          <div className="relative overflow-hidden group">
            {/* Glow Effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00D4FF] via-[#00BFFF] to-[#00D4FF] rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none"></div>
            
            <Card className="relative bg-gradient-to-br from-[#001a2e]/95 to-[#000000]/95 backdrop-blur-xl p-5 rounded-2xl border border-[#00D4FF]/40 h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Image / Icon Placeholder */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-[#00D4FF]/50 shadow-2xl shadow-[#00D4FF]/20 bg-gradient-to-br from-[#00D4FF] to-[#0099CC] flex items-center justify-center">
                   {NFT_DATA.BELIEVER.image ? (
                     <img src={NFT_DATA.BELIEVER.image} alt="Believer" className="w-full h-full object-cover" />
                   ) : (
                     <Shield className="w-20 h-20 text-white/40" />
                   )}
                   <Badge className="absolute top-2 right-2 bg-gradient-to-r from-[#00D4FF] to-[#00BFFF] border-0 text-[#001F3F]">Token #2</Badge>
                </div>

                {/* Title & Desc */}
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     {NFT_DATA.BELIEVER.name} <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                   </h3>
                   <p className="text-xs text-white/70 line-clamp-2 cursor-pointer hover:text-white"
                      onClick={() => {
                        setSelectedNFT(NFT_DATA.BELIEVER);
                        setShowDescriptionModal(true);
                      }}>
                     {NFT_DATA.BELIEVER.description}
                   </p>
                </div>

                {/* Price Box */}
                <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg p-3 space-y-1.5 backdrop-blur-sm">
                   <div className="flex justify-between text-xs text-white/60">
                      <span>Mint</span> <span>{MINT_PRICE_BREAKDOWN.BELIEVER.mintPrice} ETH</span>
                   </div>
                   <div className="flex justify-between text-xs text-white/60">
                      <span>Fee</span> <span>{MINT_PRICE_BREAKDOWN.BELIEVER.manifoldFee} ETH</span>
                   </div>
                   <div className="h-px bg-[#00D4FF]/30 my-1" />
                   <div className="flex justify-between text-sm font-bold text-white">
                      <span>Total</span> <span className="text-[#00BFFF]">{MINT_PRICE_BREAKDOWN.BELIEVER.total} ETH</span>
                   </div>
                   <div className="text-center text-[10px] text-white/40">(~${getUsdPrice(MINT_PRICES.BELIEVER)})</div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 mt-4">
                <ManifoldMintButton
                  instanceId={4117350640n}
                  priceEth="0.001"
                  badgeName="Believer Badge"
                  badgeColor="cyan"
                />
                <button
                  onClick={() => {
                    setManifoldUrl(`https://manifold.xyz/@elogiso/id/4117350640?referrer=${walletAddress}`);
                    setManifoldTokenName('Believer Badge');
                    setShowManifoldModal(true);
                  }}
                  className="w-full text-center text-xs text-white/40 hover:text-white flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Mint via Manifold
                </button>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* Info Footer */}
      <Card className="bg-gradient-to-r from-[#39FF14]/10 via-[#39FF14]/5 to-[#39FF14]/10 border-2 border-[#39FF14]/30 p-5 rounded-xl max-w-5xl mx-auto backdrop-blur-sm">
        <div className="space-y-3">
          <p className="text-white/90 text-sm text-center font-medium">
            ⚠️ Remaining supply will be burned anytime. Mint both to secure your status.
          </p>
          <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg p-3 flex items-start gap-2">
             <Shield className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-0.5" />
             <div className="flex-1">
                <p className="text-white font-medium text-sm mb-1">🛡️ Security Notice</p>
                <p className="text-white/70 text-xs">Direct minting from contract on <span className="text-[#00D4FF]">Base</span>. 100% secure.</p>
             </div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
        <DialogContent className="bg-[#001F3F] border-2 border-[#39FF14]/40 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedNFT?.name}</DialogTitle>
            <DialogDescription className="text-white/80 mt-2">{selectedNFT?.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showManifoldModal} onOpenChange={setShowManifoldModal}>
        <DialogContent className="bg-[#001F3F] border-white/10 max-w-4xl h-[80vh] p-0 overflow-hidden">
           <DialogHeader className="p-4 border-b border-white/10">
             <DialogTitle className="text-white">Mint {manifoldTokenName}</DialogTitle>
             <DialogDescription className="text-white/60">Secure mint via Manifold</DialogDescription>
           </DialogHeader>
           <div className="flex-1 bg-white h-full w-full">
             <iframe src={manifoldUrl} className="w-full h-full border-0" title="Manifold Mint" />
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}