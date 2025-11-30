import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2, ArrowDownUp, CheckCircle2 } from 'lucide-react';
import { useWalletClient, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther, type Address, type Hex } from 'viem';
import { toast } from 'sonner@2.0.3';

interface Props {
  amountEth: string;
  walletAddress: string | null;
  isConnected: boolean;
  onSuccess?: () => void;
}

const BTRIBE_ADDRESS = '0xa58d90ec74c4978a161ffaba582f159b32b2d6d6' as Address;

export function ZoraSwapButton({ amountEth, walletAddress, isConnected, onSuccess }: Props) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [txHash, setTxHash] = useState<Hex | undefined>();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && !swapped) {
      setSwapped(true);
      toast.success('🎉 Swap Successful!', {
        description: `Successfully swapped ${amountEth} ETH for $BTRIBE`,
        duration: 5000,
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    }
  }, [isConfirmed, swapped, amountEth, onSuccess]);

  const handleSwap = async () => {
    if (!walletAddress || !amountEth || parseFloat(amountEth) <= 0) {
      toast.error('Please enter a valid ETH amount');
      return;
    }

    if (!walletClient) {
      toast.error('Wallet not ready. Please try again.');
      return;
    }

    console.log('💱 Starting Zora Creator Coin swap:', {
      amountEth,
      walletAddress,
      coin: BTRIBE_ADDRESS,
    });

    setHasError(false);
    setIsSwapping(true);
    toast.info('Preparing swap with Zora API...');

    try {
      // Step 1: Call our API route to create trade call with API key (server-side)
      console.log('📡 Calling Zora swap API...');
      const response = await fetch('/api/zora-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountEth,
          walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prepare swap');
      }

      const { tradeCall } = await response.json();
      console.log('✅ Trade call received:', tradeCall);

      if (!tradeCall?.call) {
        throw new Error('Invalid trade call response');
      }

      // Step 2: Execute transaction with user's wallet (client-side)
      toast.info('Please confirm the swap in your wallet...');
      
      const hash = await walletClient.sendTransaction({
        to: tradeCall.call.target as Address,
        data: tradeCall.call.data as Hex,
        value: BigInt(tradeCall.call.value || '0'),
        account: walletClient.account!,
        chain: base,
      });

      console.log('✅ Transaction sent! Hash:', hash);
      setTxHash(hash);
      
      toast.info('Swap pending...', {
        description: 'Waiting for transaction confirmation',
      });

    } catch (error: any) {
      console.error('❌ Swap error:', error);
      
      // Parse error message
      let errorMessage = 'Failed to swap. Please try again.';
      if (error?.message) {
        if (error.message.includes('User rejected') || error.message.includes('rejected')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient ETH balance';
        } else if (error.message.includes('slippage')) {
          errorMessage = 'Price moved too much. Try increasing slippage.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error('Swap Failed', {
        description: errorMessage,
      });
      setHasError(true);
      setIsSwapping(false);
    }
  };

  // Reset swapping state when transaction is confirmed or failed
  useEffect(() => {
    if (isConfirmed || hasError) {
      setIsSwapping(false);
    }
  }, [isConfirmed, hasError]);

  if (!isConnected) {
    return (
      <Button disabled className="w-full bg-[#001F3F]/50 border border-white/10 text-white/50 py-4 rounded-lg">
        Connect Wallet to Swap
      </Button>
    );
  }

  if (swapped) {
    return (
      <Button 
        onClick={() => setSwapped(false)} 
        className="w-full bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold py-4 rounded-lg shadow-lg shadow-[#39FF14]/40"
      >
        <CheckCircle2 className="w-4 h-4 mr-2" /> Swap Successful! Do another?
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSwap}
      disabled={isSwapping || !amountEth || parseFloat(amountEth) <= 0 || hasError}
      className="w-full bg-gradient-to-r from-[#39FF14] to-[#00FF41] hover:from-[#00FF41] hover:to-[#39FF14] text-[#001F3F] font-bold py-4 rounded-lg shadow-lg shadow-[#39FF14]/40 hover:shadow-[#39FF14]/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none relative overflow-hidden group text-sm"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isSwapping ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Swapping...
          </>
        ) : (
          <>
            <ArrowDownUp className="w-4 h-4" />
            Swap Now
          </>
        )}
      </span>
    </Button>
  );
}