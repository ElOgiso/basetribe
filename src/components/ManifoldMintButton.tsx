// src/components/ManifoldMintButton.tsx
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2, Sparkles, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'wagmi/chains'; // Import Base chain

interface Props {
  instanceId: bigint;
  priceEth: string;
  badgeName: string;
  badgeColor: 'purple' | 'cyan';
  isConnected: boolean;
  userAddress: string | null;
}

// Fixed contract addresses for Base Network
const MANIFOLD_CLAIM_CONTRACT = '0x26BBEA7803DcAc346D5F5f135b57Cf2c752A02bE';
const CREATOR_CONTRACT = '0x6d70517b4bb4921b6fe0b131d62415332db1b831';

export function ManifoldMintButton({ 
  instanceId, 
  priceEth, 
  badgeName, 
  badgeColor,
  isConnected,
  userAddress
}: Props) {
  
  const { 
    data: hash, 
    writeContract, 
    isPending: isWritePending, 
    error: writeError 
  } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ hash });

  const [isSuccess, setIsSuccess] = useState(false);

  // Debugging: Log errors to console so you can see them (F12)
  useEffect(() => {
    if (writeError) {
      console.error("Mint Error Details:", writeError);
    }
  }, [writeError]);

  useEffect(() => {
    if (isConfirmed) {
      setIsSuccess(true);
      const timer = setTimeout(() => setIsSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed]);

  const mint = () => {
    if (!userAddress) return;

    // 1. Force switch to Base Network by passing chainId
    // 2. Use the exact ABI Manifold expects
    writeContract({
      address: MANIFOLD_CLAIM_CONTRACT, 
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
        CREATOR_CONTRACT,
        instanceId,
        0,  // mintIndex
        [], // merkleProof
        userAddress
      ],
      value: parseEther(priceEth),
      chainId: base.id, // <--- CRITICAL FIX: Force Base Chain
    });
  };

  const isProcessing = isWritePending || isConfirming;

  if (!isConnected) {
    return (
        <Button disabled className="w-full py-4 sm:py-6 rounded-xl bg-[#001F3F]/50 border border-white/10 text-white/50">
           Connect to Mint
        </Button>
    );
  }

  if (isSuccess) {
    return (
      <Button disabled className="w-full bg-[#39FF14] text-[#001F3F] font-bold py-4 sm:py-6 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
        <CheckCircle2 className="w-5 h-5 mr-2 relative z-10" />
        <span className="relative z-10">Minted Successfully!</span>
      </Button>
    );
  }

  return (
    <div className="space-y-2 w-full">
      <Button
        onClick={mint}
        disabled={isProcessing}
        className={`w-full font-bold py-4 sm:py-6 rounded-xl shadow-lg transition-all relative overflow-hidden group ${
          badgeColor === 'purple'
            ? 'bg-gradient-to-r from-[#7B2CBF] to-[#5A1F9A] hover:opacity-90 text-white shadow-[#7B2CBF]/20'
            : 'bg-gradient-to-r from-[#00D4FF] to-[#0099CC] hover:opacity-90 text-white shadow-[#00D4FF]/20'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {isConfirming ? 'Confirming...' : 'Check Wallet...'}
          </>
        ) : (
          <>
            {badgeColor === 'purple' ? <Sparkles className="w-5 h-5 mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
            Mint {badgeName}
          </>
        )}
      </Button>
      
      {/* IMPROVED ERROR DISPLAY */}
      {writeError && (
        <div className="flex items-center justify-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-center">
            {writeError.message.includes('insufficient funds') 
              ? 'Insufficient ETH for gas + price'
              : writeError.message.includes('User rejected')
                ? 'Transaction rejected in wallet'
                : 'Transaction failed. Check console for details.'}
          </span>
        </div>
      )}
    </div>
  );
}