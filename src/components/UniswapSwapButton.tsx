import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, ArrowDownUp, CheckCircle2 } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther } from 'viem';

interface Props {
  amountEth: string;
  onSuccess?: () => void;
}

// Uniswap V3 Router on Base
const ROUTER_ADDRESS = '0x2626664c2603336E57B271c5C0b26F421741e481';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const BTRIBE_ADDRESS = '0xa58d90ec74c4978a161ffaba582f159b32b2d6d6'; // Your Token

export function UniswapSwapButton({ amountEth, onSuccess }: Props) {
  const { isConnected, address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const [swapped, setSwapped] = useState(false);

  const handleSwap = () => {
    if (!address || !amountEth || amountEth === '0') return;

    // Uniswap V3 ExactInputSingle Params
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    const feeTier = 10000; // 1% Fee (Standard for Creator Coins)

    const params = {
      tokenIn: WETH_ADDRESS,
      tokenOut: BTRIBE_ADDRESS,
      fee: feeTier,
      recipient: address,
      deadline: BigInt(deadline),
      amountIn: parseEther(amountEth),
      amountOutMinimum: 0n, // 0 = accept market price (prevents "Output too low" errors)
      sqrtPriceLimitX96: 0n
    };

    writeContract({
      address: ROUTER_ADDRESS,
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
      value: parseEther(amountEth), // Sending ETH value directly
      chainId: base.id,
      gas: 500000n // ⚡ CRITICAL: Buffer to prevent "Error generating transaction"
    });
  };

  // Check for confirmed transaction
  if (isConfirmed && !swapped) {
    setSwapped(true);
    if (onSuccess) {
      setTimeout(() => onSuccess(), 1000);
    }
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
        className="w-full bg-[#39FF14] hover:bg-[#2ECC11] text-[#001F3F] font-bold py-4 rounded-lg shadow-lg shadow-[#39FF14]/40"
      >
        <CheckCircle2 className="w-4 h-4 mr-2" /> Swap Successful! Do another?
      </Button>
    );
  }

  const isLoading = isPending || isConfirming;
  const loadingText = isPending 
    ? 'Confirm in Wallet...' 
    : isConfirming 
    ? 'Swapping...' 
    : 'Swap Now';

  return (
    <Button
      onClick={handleSwap}
      disabled={isLoading || !amountEth || parseFloat(amountEth) <= 0}
      className="w-full bg-gradient-to-r from-[#39FF14] to-[#00FF41] hover:from-[#00FF41] hover:to-[#39FF14] text-[#001F3F] font-bold py-4 rounded-lg shadow-lg shadow-[#39FF14]/40 hover:shadow-[#39FF14]/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none relative overflow-hidden group text-sm"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText}
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
