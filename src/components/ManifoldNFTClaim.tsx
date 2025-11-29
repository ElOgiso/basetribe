// src/components/ManifoldNFTClaim.tsx
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Sparkles } from 'lucide-react';
import bannerImage from '../assets/nftmint.png'; // Make sure this path is correct
import { ManifoldMintButton } from './ManifoldMintButton';

interface ManifoldNFTClaimProps {
  isConnected: boolean;
  walletAddress: string | null;
  userFid?: string | null;
}

export function ManifoldNFTClaim({ isConnected }: ManifoldNFTClaimProps) {
  return (
    <div className="space-y-8 pb-12">
      <Card className="relative overflow-hidden rounded-2xl border-2 border-[#39FF14]/30 p-0 shadow-lg">
        {/* If the banner image fails, this div acts as a fallback */}
        <div className="bg-gradient-to-r from-[#001F3F] to-[#003366] min-h-[100px]">
           <img src={bannerImage} alt="Base Tribe Banner" className="w-full h-auto block" />
        </div>
      </Card>

      <div className="text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Official Tribe Badges</h2>
        <Badge className="bg-[#39FF14] text-[#001F3F]">Minting Live on Base</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        
        {/* FOUNDER BADGE - 0.00617 ETH */}
        <Card className="bg-[#001F3F]/50 border-[#7B2CBF]/30 p-6 flex flex-col gap-4 rounded-xl backdrop-blur-sm">
          <div className="text-center space-y-2">
            <h3 className="text-[#7B2CBF] font-bold text-xl flex items-center justify-center gap-2">
              Founder Badge <Sparkles className="w-4 h-4" />
            </h3>
            <p className="text-white/60 text-sm">Join the inner circle.</p>
            <p className="text-white font-mono bg-white/5 py-1 px-2 rounded inline-block text-xs">
              0.00617 ETH
            </p>
          </div>
          
          <ManifoldMintButton
            instanceId={4117309680n}
            priceEth="0.00617" // Correct Price (0.00567 + 0.0005)
            badgeName="Founder Badge"
            badgeColor="purple"
          />
        </Card>

        {/* BELIEVER BADGE - 0.001 ETH */}
        <Card className="bg-[#001F3F]/50 border-[#00D4FF]/30 p-6 flex flex-col gap-4 rounded-xl backdrop-blur-sm">
          <div className="text-center space-y-2">
            <h3 className="text-[#00D4FF] font-bold text-xl flex items-center justify-center gap-2">
              Believer Badge <Shield className="w-4 h-4" />
            </h3>
            <p className="text-white/60 text-sm">Show support for the tribe.</p>
            <p className="text-white font-mono bg-white/5 py-1 px-2 rounded inline-block text-xs">
              0.001 ETH
            </p>
          </div>

          <ManifoldMintButton
            instanceId={4117350640n}
            priceEth="0.001" // Correct Price (0.0005 + 0.0005)
            badgeName="Believer Badge"
            badgeColor="cyan"
          />
        </Card>

      </div>
    </div>
  );
}