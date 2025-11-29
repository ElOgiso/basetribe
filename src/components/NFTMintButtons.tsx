import { useState } from 'react';
import { Button } from './ui/button';
import { Shield, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { NFT_CONFIG } from '../lib/nft';
import { mintNFT, waitForTransaction } from '../lib/nftMinting';
import { updateMembershipNFT } from '../lib/api';
import { fetchFidFromWallet } from '../lib/claiming';

interface NFTMintButtonsProps {
  walletAddress: string | null;
  userFid?: string | null;
  isConnected: boolean;
}

export function NFTMintButtons({ walletAddress, userFid, isConnected }: NFTMintButtonsProps) {
  // Minting states
  const [isMintingFounder, setIsMintingFounder] = useState(false);
  const [isMintingBeliever, setIsMintingBeliever] = useState(false);
  const [mintSuccess, setMintSuccess] = useState<{ founder: boolean; believer: boolean }>({ founder: false, believer: false });
  const [mintError, setMintError] = useState<string | null>(null);
  
  // Manifold widget modal states
  const [showManifoldModal, setShowManifoldModal] = useState(false);
  const [manifoldUrl, setManifoldUrl] = useState('');
  const [manifoldTokenName, setManifoldTokenName] = useState('');

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

  if (!isConnected) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Error notification */}
      {mintError && (
        <div className="bg-red-500/20 border-2 border-red-500 p-4 rounded-xl max-w-5xl mx-auto">
          <p className="text-white text-center text-sm">{mintError}</p>
        </div>
      )}

      {/* Standalone Mint Buttons Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
        {/* Founder Mint Button */}
        <div className="space-y-2">
          <Button
            onClick={() => handleMint(NFT_CONFIG.TOKENS.FOUNDER.id, 'founder')}
            disabled={isMintingFounder || mintSuccess.founder}
            className={`w-full relative overflow-hidden min-h-[40px] sm:min-h-[48px] md:min-h-[52px] ${
              mintSuccess.founder
                ? 'bg-gradient-to-r from-[#39FF14] to-[#00FF41]'
                : 'bg-gradient-to-r from-[#7B2CBF] to-[#5A1F9A] hover:from-[#5A1F9A] hover:to-[#7B2CBF]'
            } text-white font-bold py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all shadow-[0_4px_30px_0_rgba(123,44,191,0.4)] hover:shadow-[0_6px_40px_0_rgba(123,44,191,0.6)] hover:scale-105 disabled:hover:scale-100 ${
              mintSuccess.founder ? 'shadow-[0_6px_40px_0_rgba(57,255,20,0.6)]' : ''
            } text-xs sm:text-sm md:text-base`}
          >
            {isMintingFounder ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                Minting...
              </>
            ) : mintSuccess.founder ? (
              <>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Minted!
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Mint Founder
              </>
            )}
          </Button>
          
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
          <Button
            onClick={() => handleMint(NFT_CONFIG.TOKENS.BELIEVER.id, 'believer')}
            disabled={isMintingBeliever || mintSuccess.believer}
            className={`w-full relative overflow-hidden min-h-[40px] sm:min-h-[48px] md:min-h-[52px] ${
              mintSuccess.believer
                ? 'bg-gradient-to-r from-[#39FF14] to-[#00FF41]'
                : 'bg-gradient-to-r from-[#00D4FF] to-[#0099CC] hover:from-[#0099CC] hover:to-[#00D4FF]'
            } text-white font-bold py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all shadow-[0_4px_30px_0_rgba(0,212,255,0.4)] hover:shadow-[0_6px_40px_0_rgba(0,212,255,0.6)] hover:scale-105 disabled:hover:scale-100 ${
              mintSuccess.believer ? 'shadow-[0_6px_40px_0_rgba(57,255,20,0.6)]' : ''
            } text-xs sm:text-sm md:text-base`}
          >
            {isMintingBeliever ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                Minting...
              </>
            ) : mintSuccess.believer ? (
              <>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Minted!
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Mint Believer
              </>
            )}
          </Button>
          
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
