import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ArrowDownUp, ExternalLink, Loader2 } from 'lucide-react';
import { UniswapSwapButton } from './UniswapSwapButton';

const BTRIBE_ADDRESS = '0xa58d90ec74c4978a161ffaba582f159b32b2d6d6';

interface BTribeSwapProps {
  walletAddress: string | null;
  isConnected: boolean;
}

export function BTribeSwap({ walletAddress, isConnected }: BTribeSwapProps) {
  const [amountEth, setAmountEth] = useState('0.01');
  const [estimatedBTribe, setEstimatedBTribe] = useState<string>('0');
  const [priceUsd, setPriceUsd] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Fetch Live Price from DexScreener (Reliable & Free)
  useEffect(() => {
    const fetchPrice = async () => {
      if (!amountEth || parseFloat(amountEth) <= 0) {
        setEstimatedBTribe('0');
        return;
      }
      
      setLoading(true);
      try {
        // Fetch BTRIBE price pair data
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${BTRIBE_ADDRESS}`);
        const data = await res.json();
        
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          const price = parseFloat(pair.priceUsd);
          const ethPrice = parseFloat(pair.priceNative); // Price in ETH
          
          setPriceUsd(price);
          
          // Calculate Output: Input / Price per Token in ETH
          const estOutput = parseFloat(amountEth) / ethPrice;
          setEstimatedBTribe(estOutput.toLocaleString(undefined, { maximumFractionDigits: 0 }));
        } else {
          // Fallback if no pairs found
          setEstimatedBTribe('...');
        }
      } catch (e) {
        console.error("Price fetch failed", e);
        setEstimatedBTribe('...');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPrice, 500); // Debounce
    return () => clearTimeout(timer);
  }, [amountEth]);

  return (
    <Card className="bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#001F3F] border-2 border-[#39FF14]/30 p-4 rounded-xl relative overflow-hidden shadow-lg shadow-[#39FF14]/20">
      {/* Decorative neon green corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#39FF14] opacity-20 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#39FF14] opacity-20 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#39FF14] opacity-20 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#39FF14] opacity-20 rounded-br-xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-lg mb-1">
            Let's Pump Community Value
          </h3>
          <p className="text-white/60 text-xs">
            Buy $BTRIBE with ETH on Base
          </p>
          {priceUsd > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
              <p className="text-[#39FF14] text-[10px] font-medium">
                ${priceUsd.toFixed(6)} USD
              </p>
            </div>
          )}
        </div>

        {/* Swap Interface */}
        <div className="space-y-2">
          {/* From (ETH) */}
          <div className="bg-[#001F3F]/50 backdrop-blur-sm rounded-lg p-3 border border-[#7B2CBF]/30 hover:border-[#7B2CBF]/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs">From</span>
              <div className="flex items-center gap-1.5 bg-[#7B2CBF]/10 px-2 py-0.5 rounded border border-[#7B2CBF]/30">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">Ξ</span>
                </div>
                <span className="text-white text-xs font-bold">ETH</span>
              </div>
            </div>
            <Input
              type="number"
              value={amountEth}
              onChange={(e) => setAmountEth(e.target.value)}
              min="0"
              step="0.0001"
              placeholder="0.01"
              className="bg-transparent border-0 text-white text-2xl font-bold p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/20"
            />
            <p className="text-white/40 text-[10px] mt-1">Base Network</p>
          </div>

          {/* Arrow indicator with glow */}
          <div className="flex justify-center -my-1 relative z-10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0099CC] flex items-center justify-center shadow-md shadow-[#00D4FF]/50 animate-pulse border border-[#00D4FF]/30">
              <ArrowDownUp className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* To (BTRIBE) */}
          <div className="bg-[#001F3F]/50 backdrop-blur-sm rounded-lg p-3 border border-[#39FF14]/30 hover:border-[#39FF14]/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs">To (estimated)</span>
              <div className="flex items-center gap-1.5 bg-[#39FF14]/10 px-2 py-0.5 rounded border border-[#39FF14]/30">
                <div className="w-4 h-4 rounded-full bg-[#39FF14] flex items-center justify-center">
                  <span className="text-[#001F3F] text-[10px] font-bold">B</span>
                </div>
                <span className="text-[#39FF14] text-xs font-bold">$BTRIBE</span>
              </div>
            </div>
            <div className="text-white text-2xl font-bold flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#00D4FF]" />
                  <span className="text-white/50 text-lg">Loading...</span>
                </>
              ) : (
                <>
                  <span className="text-[#39FF14]">~</span>
                  {estimatedBTribe}
                </>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <UniswapSwapButton 
            amountEth={amountEth}
            walletAddress={walletAddress}
            isConnected={isConnected}
            onSuccess={() => {
              console.log('✅ Swap completed successfully!');
              // Optionally reset amount
              // setAmountEth('0.01');
            }} 
          />

          {/* Info Section */}
          <div className="bg-[#001F3F]/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60">Token Type</span>
                <span className="text-white">ZORA Creator Coin</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60">Contract</span>
                <a 
                  href={`https://basescan.org/token/${BTRIBE_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#39FF14] font-mono hover:text-[#39FF14]/80 transition-colors flex items-center gap-1"
                >
                  {BTRIBE_ADDRESS.slice(0, 6)}...{BTRIBE_ADDRESS.slice(-4)}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60">Network</span>
                <span className="text-white">Base Mainnet</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60">DEX</span>
                <span className="text-white">Uniswap V3</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">Powered By</span>
                <span className="text-[#39FF14]">ZORA + Uniswap</span>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <a 
              href={`https://dexscreener.com/base/${BTRIBE_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-white/70 flex items-center justify-center gap-1 transition-colors"
            >
              View Chart on DexScreener <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}