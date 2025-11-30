import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from './ui/button';
import { Loader2, Sparkles, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3'';
import { updateMembershipNFT } from '../lib/api';
import type { NFTPrice } from '../lib/nft';

// ✅ MANIFOLD CONTRACTS on Base
const CORE_CONTRACT_ADDRESS = '0x6d70517b4bb4921b6fe0b131d62415332db1b831';
// Manifold Lazy Claim contract on Base - CORRECT ADDRESS from console
const CLAIM_CONTRACT_ADDRESS = '0x26BBEA7803DcAc346D5F5f135b57Cf2c752A02bE';
const CHAIN_ID = 8453; // Base Mainnet
const RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/mUXD-chbg1kxeE-kxt0Fr';

// ✅ Manifold Claim Page ABI
const CLAIM_ABI = [
  {
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
    outputs: [],
  },
  {
    name: 'getClaim',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'creatorContractAddress', type: 'address' },
      { name: 'instanceId', type: 'uint256' }
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'total', type: 'uint32' },
          { name: 'totalMax', type: 'uint32' },
          { name: 'walletMax', type: 'uint32' },
          { name: 'startDate', type: 'uint48' },
          { name: 'endDate', type: 'uint48' },
          { name: 'storageProtocol', type: 'uint8' },
          { name: 'identical', type: 'bool' },
          { name: 'merkleRoot', type: 'bytes32' },
          { name: 'location', type: 'string' },
          { name: 'cost', type: 'uint256' },
          { name: 'paymentReceiver', type: 'address' }
        ]
      }
    ]
  },
  {
    name: 'getTotalPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'creatorContractAddress', type: 'address' },
      { name: 'instanceId', type: 'uint256' },
      { name: 'mintCount', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  },
  {
    name: 'MINT_FEE',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  }
];

// Token configuration with Claim Page Instance IDs
const BADGE_CONFIG: { [key: number]: { tokenId: number; instanceId: number; price: string; name: string; claimUrl: string } } = {
  1: {
    tokenId: 2, // Founder badge is token ID 2
    instanceId: 4117309680, // Founder claim page instance
    price: '0.00617', // Price in ETH (0.00567 + 0.0005 Manifold fee)
    name: 'Founder',
    claimUrl: 'https://claim.manifold.xyz/base/0x6d70517b4bb4921b6fe0b131d62415332db1b831/4117309680'
  },
  2: {
    tokenId: 1, // Believer badge is token ID 1
    instanceId: 4117350640, // Believer claim page instance
    price: '0.00118', // Price in ETH (0.00068 + 0.0005 Manifold fee)
    name: 'Believer',
    claimUrl: 'https://claim.manifold.xyz/base/0x6d70517b4bb4921b6fe0b131d62415332db1b831/4117350640'
  }
};

interface MintButtonProps {
  tokenId: number; // Our internal ID (1 = Founder, 2 = Believer)
  badgeName: string;
  badgeColor: string;
  walletAddress: string | null;
  isConnected: boolean;
  price?: NFTPrice | null;
}

export function MintButton({ tokenId, badgeName, badgeColor, walletAddress, isConnected, price: initialPrice }: MintButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [currentPrice, setCurrentPrice] = useState<NFTPrice | null>(initialPrice || null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  // Fetch ETH to USD conversion rate
  const getEthToUsdRate = async (): Promise<number> => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH', {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        return 3000;
      }
      
      const data = await response.json();
      return parseFloat(data.data.rates.USD) || 3000;
    } catch (error) {
      return 3000;
    }
  };

  // Fetch claim page cost from contract
  const fetchClaimCost = async (instanceId: number): Promise<string | null> => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const claimContract = new ethers.Contract(CLAIM_CONTRACT_ADDRESS, CLAIM_ABI, provider);
      
      const claimInfo = await claimContract.getClaim(
        ethers.getAddress(CORE_CONTRACT_ADDRESS),
        BigInt(instanceId)
      );
      
      if (claimInfo && claimInfo.cost !== undefined) {
        const costEth = ethers.formatEther(claimInfo.cost);
        console.log('✅ Fetched claim cost from contract:', costEth, 'ETH');
        return costEth;
      }
    } catch (error) {
      console.log('💰 Using configured price (contract query failed)');
    }
    
    return null;
  };

  // Initialize price
  useEffect(() => {
    const initPrice = async () => {
      if (initialPrice) {
        setCurrentPrice(initialPrice);
      } else {
        setIsFetchingPrice(true);
        const badgeConfig = BADGE_CONFIG[tokenId];
        
        // Try to fetch live price from claim contract
        const liveCost = await fetchClaimCost(badgeConfig.instanceId);
        const priceEth = liveCost || badgeConfig.price;
        
        const ethToUsd = await getEthToUsdRate();
        const priceUsd = (parseFloat(priceEth) * ethToUsd).toFixed(2);
        
        setCurrentPrice({
          eth: priceEth,
          usd: priceUsd,
        });
        setIsFetchingPrice(false);
      }
    };
    
    initPrice();
  }, [tokenId, initialPrice]);

  const handleRefreshPrice = async () => {
    setIsFetchingPrice(true);
    const badgeConfig = BADGE_CONFIG[tokenId];
    
    // Try to fetch live price
    const liveCost = await fetchClaimCost(badgeConfig.instanceId);
    const priceEth = liveCost || badgeConfig.price;
    
    const ethToUsd = await getEthToUsdRate();
    const priceUsd = (parseFloat(priceEth) * ethToUsd).toFixed(2);
    
    setCurrentPrice({
      eth: priceEth,
      usd: priceUsd,
    });
    setIsFetchingPrice(false);
    toast.success('Price refreshed!');
  };

  const mint = async () => {
    if (!isConnected || !walletAddress) {
      toast.error('Please connect your wallet first');
      setError('Please connect your wallet first');
      return;
    }

    if (!window.ethereum) {
      toast.error('No wallet detected. Please install MetaMask or another Web3 wallet.');
      setError('No wallet detected. Please install a Web3 wallet.');
      return;
    }

    const badgeConfig = BADGE_CONFIG[tokenId];
    if (!badgeConfig) {
      toast.error('Invalid badge configuration');
      return;
    }

    setError('');
    setIsPending(true);

    try {
      console.log('🎨 =====================================');
      console.log('🎨 MANIFOLD CLAIM PAGE MINT');
      console.log('🎨 =====================================');
      console.log('👛 Wallet:', walletAddress);
      console.log('🏷️ Badge:', badgeName);
      console.log('🆔 Token ID:', badgeConfig.tokenId);
      console.log('📄 Instance ID:', badgeConfig.instanceId);
      console.log('💰 Price:', currentPrice?.eth || badgeConfig.price, 'ETH');
      console.log('📜 Core Contract:', CORE_CONTRACT_ADDRESS);
      console.log('📜 Claim Contract:', CLAIM_CONTRACT_ADDRESS);

      // Validate wallet address
      if (!ethers.isAddress(walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      // Check and switch to Base network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      
      if (currentChainId !== CHAIN_ID) {
        toast.info('Switching to Base network...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${CHAIN_ID.toString(16)}`,
                chainName: 'Base',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ['https://basescan.org']
              }]
            });
          } else {
            throw switchError;
          }
        }
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      console.log('✅ Connected wallet:', signerAddress);

      // Create claim contract instance
      const claimContract = new ethers.Contract(
        CLAIM_CONTRACT_ADDRESS,
        CLAIM_ABI,
        signer
      );

      // First, get the claim info to verify parameters
      console.log('📊 Fetching claim info...');
      let claimInfo;
      let mintFee;
      let totalPrice;
      
      try {
        claimInfo = await claimContract.getClaim(
          CORE_CONTRACT_ADDRESS,
          BigInt(badgeConfig.instanceId)
        );
        console.log('📊 Claim Info:', claimInfo);
        console.log('   Total minted:', claimInfo.total?.toString());
        console.log('   Max supply:', claimInfo.totalMax?.toString());
        console.log('   Wallet max:', claimInfo.walletMax?.toString());
        console.log('   Cost:', claimInfo.cost ? ethers.formatEther(claimInfo.cost) : '0', 'ETH');
      } catch (claimInfoError) {
        console.warn('⚠️ Could not fetch claim info:', claimInfoError);
      }

      // Try to get the mint fee
      try {
        mintFee = await claimContract.MINT_FEE();
        console.log('💰 Mint Fee from contract:', ethers.formatEther(mintFee), 'ETH');
      } catch (feeError) {
        console.warn('⚠️ Could not fetch MINT_FEE, using default 0.0005 ETH');
        mintFee = ethers.parseEther('0.0005');
      }

      // Try to get the total price (cost + fee)
      try {
        totalPrice = await claimContract.getTotalPrice(
          CORE_CONTRACT_ADDRESS,
          BigInt(badgeConfig.instanceId),
          1 // mint count = 1
        );
        console.log('💰 Total Price from getTotalPrice():', ethers.formatEther(totalPrice), 'ETH');
      } catch (priceError) {
        console.warn('⚠️ Could not fetch total price, calculating manually');
        // Calculate manually: base cost + mint fee
        if (claimInfo && claimInfo.cost !== undefined) {
          totalPrice = claimInfo.cost + mintFee;
          console.log('💰 Calculated Total Price (cost + fee):', ethers.formatEther(totalPrice), 'ETH');
        } else {
          totalPrice = ethers.parseEther(currentPrice?.eth || badgeConfig.price);
          console.log('💰 Using configured price:', ethers.formatEther(totalPrice), 'ETH');
        }
      }

      // Use totalPrice as the mint price
      const mintPrice = totalPrice;
      
      console.log('🔧 Calling Manifold Claim Page mint() with:');
      console.log('   creatorContractAddress:', CORE_CONTRACT_ADDRESS);
      console.log('   instanceId:', badgeConfig.instanceId);
      console.log('   mintIndex:', 0, '(uint32)');
      console.log('   merkleProof:', []);
      console.log('   mintFor:', signerAddress);
      console.log('   value:', ethers.formatEther(mintPrice), 'ETH');

      // Call Manifold Claim Page mint function
      const tx = await claimContract.mint(
        CORE_CONTRACT_ADDRESS, // creator contract
        BigInt(badgeConfig.instanceId), // instance ID from claim page
        0, // mintIndex (0 for public claims without allowlist)
        [], // merkleProof (empty for public claims)
        signerAddress, // mintFor (recipient)
        {
          value: mintPrice,
          gasLimit: 500000
        }
      );
      
      console.log('✅ Transaction submitted!');
      console.log('⏳ Tx hash:', tx.hash);
      
      toast.info('Transaction submitted! Waiting for confirmation...');
      setTxHash(tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('✅ Transaction confirmed!');
      console.log('📋 Receipt:', receipt);
      console.log('🎨 =====================================');

      if (receipt.status === 1) {
        setIsSuccess(true);
        setIsPending(false);

        toast.success(
          <div>
            <p className="font-bold">🎉 Mint Successful!</p>
            <p className="text-sm">Your {badgeName} NFT is now in your wallet!</p>
          </div>,
          { duration: 8000 }
        );

        // Update Google Sheets
        try {
          const nftType = tokenId === 1 ? 'FOUNDER' : 'BELIEVER';
          await updateMembershipNFT(signerAddress, receipt.hash, nftType);
          console.log('✅ Updated Google Sheets');
        } catch (updateError) {
          console.error('⚠️ Error updating Google Sheets:', updateError);
        }
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('❌ Mint error:', err);
      
      let userMessage = 'Transaction failed. Please try again.';
      let showClaimPageOption = false;
      
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        userMessage = 'Transaction was rejected.';
      } else if (err.message?.includes('insufficient funds')) {
        userMessage = 'Insufficient ETH balance. Please add more ETH to your wallet.';
      } else if (err.message?.includes('execution reverted')) {
        userMessage = 'Transaction reverted. The NFT may be sold out or claim is paused.';
        showClaimPageOption = true;
      } else if (err.message?.includes('user rejected')) {
        userMessage = 'Transaction was cancelled.';
      } else if (err.message) {
        userMessage = err.message.slice(0, 200);
        showClaimPageOption = true;
      }
      
      setError(userMessage);
      setIsPending(false);
      
      toast.error(
        <div>
          <p className="font-bold">❌ Mint Failed</p>
          <p className="text-sm">{userMessage}</p>
          {showClaimPageOption && (
            <a 
              href={badgeConfig.claimUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs underline mt-2 block"
            >
              Try minting on Manifold claim page →
            </a>
          )}
        </div>,
        { duration: 8000 }
      );
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setError('');
    setTxHash('');
  };

  const badgeConfig = BADGE_CONFIG[tokenId];

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-3">
        <div className={`p-4 rounded-xl border-2 ${
          badgeColor === 'purple' 
            ? 'border-[#7B2CBF] bg-[#7B2CBF]/10' 
            : 'border-[#00D4FF] bg-[#00D4FF]/10'
        } backdrop-blur-sm`}>
          <div className="flex items-center justify-center gap-2 text-center">
            <CheckCircle className={`w-5 h-5 ${
              badgeColor === 'purple' ? 'text-[#7B2CBF]' : 'text-[#00D4FF]'
            }`} />
            <p className="text-white font-medium">
              Mint Successful! 🎉
            </p>
          </div>
          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1 text-center text-xs mt-2 ${
                badgeColor === 'purple' ? 'text-[#7B2CBF]' : 'text-[#00D4FF]'
              } hover:underline`}
            >
              View on BaseScan <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <Button
          onClick={handleReset}
          className={`w-full ${
            badgeColor === 'purple'
              ? 'bg-[#7B2CBF] hover:bg-[#7B2CBF]/80'
              : 'bg-[#00D4FF] hover:bg-[#00D4FF]/80'
          } text-white border-0 font-bold py-6 rounded-xl shadow-lg transition-all`}
        >
          Mint Another Badge
        </Button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl border-2 border-red-500/50 bg-red-500/10 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-red-400 text-sm break-words mb-2">
                {error}
              </p>
              <a
                href={badgeConfig.claimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                Try on Manifold Claim Page <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
        <Button
          onClick={handleReset}
          className={`w-full ${
            badgeColor === 'purple'
              ? 'bg-[#7B2CBF] hover:bg-[#7B2CBF]/80'
              : 'bg-[#00D4FF] hover:bg-[#00D4FF]/80'
          } text-white border-0 font-bold py-6 rounded-xl shadow-lg transition-all`}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Default mint button with price display
  return (
    <div className="space-y-3">
      {/* Price Display */}
      <div className={`bg-gradient-to-br ${
        badgeColor === 'purple'
          ? 'from-[#7B2CBF]/20 to-[#5A1F9A]/20 border-[#7B2CBF]/40'
          : 'from-[#00D4FF]/20 to-[#0099CC]/20 border-[#00D4FF]/40'
      } border-2 rounded-xl px-4 py-3 backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Mint Price</p>
            {currentPrice ? (
              <div className="flex items-baseline gap-2">
                <p className="text-white text-2xl font-bold">{currentPrice.eth} ETH</p>
                <p className="text-white/60 text-sm">(${currentPrice.usd})</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                <p className="text-white/60 text-sm">Loading...</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleRefreshPrice}
            disabled={isFetchingPrice}
            className={`p-2 rounded-lg transition-all ${
              badgeColor === 'purple'
                ? 'bg-[#7B2CBF]/30 hover:bg-[#7B2CBF]/50'
                : 'bg-[#00D4FF]/30 hover:bg-[#00D4FF]/50'
            } disabled:opacity-50`}
            title="Refresh price"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isFetchingPrice ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mint Button */}
      <Button
        onClick={mint}
        disabled={isPending || !isConnected || !currentPrice}
        className={`w-full ${
          badgeColor === 'purple'
            ? 'bg-gradient-to-r from-[#7B2CBF] to-[#5A1F9A] hover:from-[#7B2CBF]/80 hover:to-[#5A1F9A]/80'
            : 'bg-gradient-to-r from-[#00D4FF] to-[#0099CC] hover:from-[#00D4FF]/80 hover:to-[#0099CC]/80'
        } text-white border-0 font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
        
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Minting...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Mint {badgeName} Badge</span>
            </>
          )}
        </span>
      </Button>

      {/* Fallback link to Manifold claim page */}
      <p className="text-center text-xs text-white/40">
        Or{' '}
        <a
          href={badgeConfig.claimUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          mint on Manifold
        </a>
      </p>
    </div>
  );
}