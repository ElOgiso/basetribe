import { useState } from 'react';
import { Button } from './ui/button';
import { Shield, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { NFT_CONFIG } from '../lib/nft';
import { ManifoldMintButton } from './ManifoldMintButton';

interface NFTMintButtonsProps {
  walletAddress: string | null;
  userFid?: string | null;
  isConnected: boolean;
}

export function NFTMintButtons({ walletAddress, userFid, isConnected }: NFTMintButtonsProps) {
  // Manifold widget modal states
  const [showManifoldModal, setShowManifoldModal] = useState(false);
  const [manifoldUrl, setManifoldUrl] = useState('');
  const [manifoldTokenName, setManifoldTokenName] = useState('');

  if (!isConnected) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Standalone Mint Buttons Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
        {/* Founder Mint Button */}
        <div className="space-y-2">
          <ManifoldMintButton
            instanceId={4117309680n}
            priceEth="0.00617"
            badgeName="Founder Badge"
            badgeColor="purple"
            userFid={userFid}
            walletAddress={walletAddress}
            isConnected={isConnected}
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

        {/* Believer Mint Button */}
        <div className="space-y-2">
          <ManifoldMintButton
            instanceId={4117350640n}
            priceEth="0.001"
            badgeName="Believer Badge"
            badgeColor="cyan"
            userFid={userFid}
            walletAddress={walletAddress}
            isConnected={isConnected}
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
      </div>

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