// src/components/ManifoldMintButton.tsx
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface Props {
  instanceId: bigint;
  priceEth: string;
  badgeName: string;
  badgeColor: 'purple' | 'cyan';
}

// Fixed contract addresses for Base Network
const MANIFOLD_CLAIM_CONTRACT = '0x26BBEA7803DcAc346D5F5f135b57Cf2c752A02bE';
const CREATOR_CONTRACT = '0x6d70517b4bb4921b6fe0b131d62415332db1b831';

export function ManifoldMintButton({ instanceId, priceEth, badgeName, badgeColor }: Props) {
  const { isConnected } = useAccount();
  const { address } = useAccount();
  
  // Wagmi hooks for writing to contract
  const { data: hash, writeContract, isPending: isWritePending, error: writeError } = useWriteContract();
  
  // Wagmi hook to wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      setIsSuccess(true);
      // Reset success state after 5 seconds to allow another mint
      const timer = setTimeout(() => setIsSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed]);

  const mint = () => {
    if (!address) return;

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
        address
      ],
      value: parseEther(priceEth),
    });
  };

  const isProcessing = isWritePending || isConfirming;

  if (!isConnected) return null; // Logic handled by parent component usually

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
        {/* Shimmer effect */}
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
      
      {writeError && (
        <p className="text-center text-red-400 text-xs">
          {writeError.message.includes('User rejected') ? 'Transaction rejected' : 'Mint failed'}
        </p>
      )}
    </div>
  );
}