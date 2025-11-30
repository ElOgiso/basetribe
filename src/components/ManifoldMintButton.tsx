// src/components/ManifoldMintButton.tsx
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2, Sparkles, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther } from 'viem';
import { updateMembershipNFT } from '../lib/api';
import { fetchFidFromWallet } from '../lib/claiming';
import { toast } from 'sonner@2.0.3';

interface Props {
  instanceId: bigint;
  priceEth: string;
  badgeName: string;
  badgeColor: 'purple' | 'cyan';
  userFid?: string | null;
  walletAddress: string | null;
  isConnected: boolean;
}

export function ManifoldMintButton({ instanceId, priceEth, badgeName, badgeColor, userFid, walletAddress, isConnected }: Props) {
  const { writeContract, data: hash, isPending, isSuccess: isWriteSuccess, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });
  
  const [minted, setMinted] = useState(false);
  const [updatingSheets, setUpdatingSheets] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error('❌ Write contract error:', writeError);
      toast.error('Transaction failed: ' + (writeError.message || 'Unknown error'));
      setHasError(true);
    }
  }, [writeError]);

  // Handle confirmation errors
  useEffect(() => {
    if (confirmError) {
      console.error('❌ Transaction confirmation error:', confirmError);
      toast.error('Confirmation failed: ' + (confirmError.message || 'Unknown error'));
      setHasError(true);
    }
  }, [confirmError]);

  const mint = async () => {
    if (!walletAddress) {
      toast.error('No wallet address found');
      return;
    }

    console.log('🎨 Starting NFT mint:', {
      badgeName,
      instanceId: instanceId.toString(),
      priceEth,
      walletAddress,
    });

    setHasError(false);

    try {
      writeContract({
        address: '0x26BBEA7803DcAc346D5F5f135b57Cf2c752A02bE', // Manifold Claim Contract
        abi: [{
          name: 'mint',
          type: 'function',
          stateMutability: 'payable',
          inputs: [
            { name: 'creatorContractAddress', type: 'address' },
            { name: 'instanceId', type: 'uint256' },
            { name: 'mintIndex', type: 'uint32' },
            { name: 'merkleProof', type: 'bytes32[]' },
            { name: 'mintFor', type: 'address' }
          ],
          outputs: []
        }],
        functionName: 'mint',
        args: [
          '0x6d70517b4bb4921b6fe0b131d62415332db1b831', // Your Creator Contract
          instanceId,
          0,
          [],
          walletAddress as `0x${string}`
        ],
        value: parseEther(priceEth),
        chainId: base.id,
      });
      
      toast.info('Please confirm the transaction in your wallet...');
    } catch (error) {
      console.error('❌ Error initiating mint:', error);
      toast.error('Failed to initiate mint: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setHasError(true);
    }
  };

  // Update Google Sheets when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash && !minted && walletAddress) {
      toast.success('🎉 NFT Minted Successfully!', {
        description: `Your ${badgeName} has been minted!`,
        duration: 5000,
      });

      const updateSheets = async () => {
        setUpdatingSheets(true);
        try {
          // Get FID - either from prop or fetch from wallet
          let fid = userFid;
          if (!fid) {
            console.log('No FID provided, fetching from wallet...');
            fid = await fetchFidFromWallet(walletAddress);
          }
          
          if (fid) {
            const nftType = badgeName.includes('Founder') ? 'FOUNDER' : 'BELIEVER';
            console.log(`📝 Updating membershipNFT in Google Sheets for FID ${fid}...`);
            
            const updated = await updateMembershipNFT(
              fid,
              walletAddress,
              hash,
              nftType
            );
            
            if (updated) {
              console.log('✅ Membership NFT updated in Google Sheets successfully');
              toast.success('Membership updated in records!');
            } else {
              console.warn('⚠️ Failed to update Google Sheets (mint still succeeded)');
            }
          } else {
            console.warn('⚠️ No FID found for wallet, skipping Google Sheets update');
          }
        } catch (error) {
          console.error('⚠️ Error updating Google Sheets (mint still succeeded):', error);
        } finally {
          setUpdatingSheets(false);
          setMinted(true);
        }
      };
      
      updateSheets();
    }
  }, [isConfirmed, hash, minted, walletAddress, badgeName, userFid]);

  if (!isConnected) {
    return (
      <Button disabled className="w-full py-6 rounded-xl bg-[#001F3F]/50 border border-white/10 text-white/50">
        Connect Wallet to Mint
      </Button>
    );
  }

  if (minted || (isConfirmed && !updatingSheets)) {
    return (
      <Button disabled className="w-full bg-[#39FF14] text-[#001F3F] font-bold py-6 rounded-xl shadow-[0_6px_40px_0_rgba(57,255,20,0.6)]">
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Minted Successfully!
      </Button>
    );
  }

  const isLoading = isPending || isConfirming || updatingSheets;
  const loadingText = isPending 
    ? 'Confirm in Wallet...' 
    : isConfirming 
    ? 'Confirming...' 
    : updatingSheets 
    ? 'Updating Records...' 
    : 'Mint';

  return (
    <Button
      onClick={mint}
      disabled={isLoading || hasError}
      className={`w-full font-bold py-6 rounded-xl shadow-lg transition-all hover:scale-105 disabled:hover:scale-100 ${
        badgeColor === 'purple'
          ? 'bg-gradient-to-r from-[#7B2CBF] to-[#5A1F9A] hover:from-[#5A1F9A] hover:to-[#7B2CBF] text-white shadow-[0_4px_30px_0_rgba(123,44,191,0.4)] hover:shadow-[0_6px_40px_0_rgba(123,44,191,0.6)]'
          : 'bg-gradient-to-r from-[#00D4FF] to-[#0099CC] hover:from-[#0099CC] hover:to-[#00D4FF] text-white shadow-[0_4px_30px_0_rgba(0,212,255,0.4)] hover:shadow-[0_6px_40px_0_rgba(0,212,255,0.6)]'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {badgeColor === 'purple' ? <Sparkles className="w-5 h-5 mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
          Mint {badgeName}
        </>
      )}
    </Button>
  );
}