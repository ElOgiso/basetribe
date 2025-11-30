import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, ArrowDownUp, CheckCircle2 } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther } from 'viem';

interface Props {
  amountEth: string;
  walletAddress: string | null;
  isConnected: boolean;
  onSuccess?: () => void;
}

// ✅ UNISWAP V3 ROUTER (Correct for Zora Creator Coins on Base)
const ROUTER_ADDRESS = '0x2626664c2603336E57B271c5C0b26F421741e481';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const BTRIBE_ADDRESS = '0xa58d90ec74c4978a161ffaba582f159b32b2d6d6';

export function UniswapSwapButton({ amountEth, walletAddress, isConnected, onSuccess }: Props) {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const [swapped, setSwapped] = useState(false);

  const handleSwap = () => {
    if (!walletAddress || !amountEth || amountEth === '0') return;

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    
    // ✅ Zora Creator Coins typically use the 1% (10000) Fee Tier
    const feeTier = 10000; 

    // ExactInputSingleParams struct
    const params = {
      tokenIn: WETH_ADDRESS,
      tokenOut: BTRIBE_ADDRESS,
      fee: feeTier,
      recipient: walletAddress as `0x${string}`,
      deadline: BigInt(deadline),
      amountIn: parseEther(amountEth),
      amountOutMinimum: 0n, // 0 = accept market price (avoids reversion)
      sqrtPriceLimitX96: 0n
    };

    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: [{
        "inputs": [
          {
            "components": [
              { "internalType": "address", "name": "tokenIn", "type": "address" },
              { "internalType": "address", "name": "tokenOut", "type": "address" },
              { "internalType": "uint24", "name": "fee", "type": "uint24" },
              { "internalType": "address", "name": "recipient", "type": "address" },
              { "internalType": "uint256", "name": "deadline", "type": "uint256" },
              { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
              { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
              { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
            ],
            "internalType": "struct ISwapRouter.ExactInputSingleParams",
            "name": "params",
            "type": "tuple"
          }
        ],
        "name": "exactInputSingle",
        "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
        "stateMutability": "payable",
        "type": "function"
      }],
      functionName: 'exactInputSingle',
      args: [params],
      value: parseEther(amountEth), // Send ETH with the transaction
      chainId: base.id,
      gas: 500000n // ✅ Gas Buffer to prevent "Transaction Generation Error"
    });
  };

  if (isConfirmed && !swapped) {
    setSwapped(true);
    if (onSuccess) setTimeout(() => onSuccess(), 1000);
  }

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
        className="w-full bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold py-4 rounded-lg shadow-lg"
      >
        <CheckCircle2 className="w-4 h-4 mr-2" /> Swap Successful!
      </Button>
    );
  }

  const isLoading = isPending || isConfirming;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSwap}
        disabled={isLoading || !amountEth || parseFloat(amountEth) <= 0}
        className="w-full bg-gradient-to-r from-[#39FF14] to-[#00FF41] hover:opacity-90 text-[#001F3F] font-bold py-4 rounded-lg transition-all relative overflow-hidden"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {isPending ? 'Confirm in Wallet...' : 'Swapping...'}
          </>
        ) : (
          <>
            <ArrowDownUp className="w-4 h-4 mr-2" />
            Swap ETH for $BTRIBE
          </>
        )}
      </Button>
      {writeError && (
        <p className="text-red-400 text-xs text-center">
          {writeError.message.includes('User rejected') ? 'Transaction rejected' : 'Swap failed. Check console.'}
        </p>
      )}
    </div>
  );
}