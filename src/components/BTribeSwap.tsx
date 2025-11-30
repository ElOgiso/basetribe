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

  useEffect(() => {
    const fetchPrice = async () => {
      if (!amountEth || parseFloat(amountEth) <= 0) {
        setEstimatedBTribe('0');
        return;
      }
      
      setLoading(true);
      try {
        // Fetch from DexScreener
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${BTRIBE_ADDRESS}`);
        const data = await res.json();
        
        let ethPrice = 0;
        let usdPrice = 0;

        if (data.pairs && data.pairs.length > 0) {
          // Look for a Base pair
          const pair = data.pairs.find((p: any) => p.chainId === 'base') || data.pairs[0];
          usdPrice = parseFloat(pair.priceUsd);
          ethPrice = parseFloat(pair.priceNative);
        }

        if (ethPrice > 0) {
          setPriceUsd(usdPrice);
          const estOutput = parseFloat(amountEth) / ethPrice;
          setEstimatedBTribe(estOutput.toLocaleString(undefined, { maximumFractionDigits: 0 }));
        } else {
          // Fallback: If price API fails, just show "?" but let them swap
          setEstimatedBTribe('?');
        }
      } catch (e) {
        console.error("Price fetch failed", e);
        setEstimatedBTribe('?');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPrice, 800);
    return () => clearTimeout(timer);
  }, [amountEth]);

  return (
    <Card className="bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#001F3F] border-2 border-[#39FF14]/30 p-4 rounded-xl relative overflow-hidden shadow-lg">
      <div className="relative z-10">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-lg mb-1">Buy $BTRIBE</h3>
          <p className="text-white/60 text-xs">ZORA Creator Coin on Base</p>
          {priceUsd > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
              <p className="text-[#39FF14] text-[10px] font-medium">${priceUsd.toFixed(6)}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {/* ETH Input */}
          <div className="bg-[#001F3F]/50 rounded-lg p-3 border border-[#7B2CBF]/30 hover:border-[#7B2CBF]/50 transition-colors">
            <div className="flex justify-between text-white/60 text-xs mb-2">
              <span>You Pay</span>
              <span className="text-white font-bold text-xs">ETH</span>
            </div>
            <Input
              type="number"
              value={amountEth}
              onChange={(e) => setAmountEth(e.target.value)}
              className="bg-transparent border-0 text-white text-2xl font-bold p-0 focus-visible:ring-0 placeholder:text-white/20"
              placeholder="0.0"
            />
          </div>

          {/* Arrow */}
          <div className="flex justify-center -my-3 relative z-10">
            <div className="bg-[#001F3F] p-1 rounded-full border border-[#39FF14]/30">
              <ArrowDownUp className="w-4 h-4 text-[#39FF14]" />
            </div>
          </div>

          {/* BTRIBE Output */}
          <div className="bg-[#001F3F]/50 rounded-lg p-3 border border-[#39FF14]/30 hover:border-[#39FF14]/50 transition-colors">
            <div className="flex justify-between text-white/60 text-xs mb-2">
              <span>You Receive (Est)</span>
              <span className="text-[#39FF14] font-bold text-xs">$BTRIBE</span>
            </div>
            <div className="text-white text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#39FF14]" /> : estimatedBTribe}
            </div>
          </div>

          {/* Action Button */}
          <UniswapSwapButton 
            amountEth={amountEth}
            walletAddress={walletAddress}
            isConnected={isConnected}
            onSuccess={() => {
              console.log('✅ Swap completed');
              setAmountEth(''); // Reset after success
            }}
          />

          <div className="text-center pt-2">
            <a 
              href={`https://dexscreener.com/base/${BTRIBE_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-white flex items-center justify-center gap-1"
            >
              Chart <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}