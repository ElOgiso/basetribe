import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther } from 'viem';

interface Props {
  instanceId: bigint;
  priceEth: string;
  badgeName: string;
  badgeColor: 'purple' | 'cyan';
}

export function ManifoldMintButton({ instanceId, priceEth, badgeName, badgeColor }: Props) {
  const { isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const [minted, setMinted] = useState(false);
  const { address } = useAccount();

  const mint = () => {
    if (!address) return;
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
      args: ['0x6d70517b4bb4921b6fe0b131d62415332db1b831', instanceId, 0, [], address],
      value: parseEther(priceEth),
      chainId: base.id,
    });
  };

  if (hash && !minted && !isPending) setTimeout(() => setMinted(true), 2000);

  if (!isConnected) return <Button disabled className="w-full py-6 rounded-xl bg-[#001F3F]/50 border border-white/10 text-white/50">Connect Wallet</Button>;
  
  if (minted) return (
    <Button disabled className="w-full bg-[#39FF14] text-[#001F3F] font-bold py-6 rounded-xl">
      <CheckCircle2 className="w-5 h-5 mr-2" /> Minted Successfully!
    </Button>
  );

  return (
    <Button 
      onClick={mint} 
      disabled={isPending} 
      className={`w-full font-bold py-6 rounded-xl shadow-lg transition-all ${
        badgeColor === 'purple' 
          ? 'bg-gradient-to-r from-[#7B2CBF] to-[#5A1F9A] hover:opacity-90 text-white' 
          : 'bg-gradient-to-r from-[#00D4FF] to-[#0099CC] hover:opacity-90 text-white'
      }`}
    >
      {isPending ? (
        <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Confirming... </>
      ) : (
        <> 
          {badgeColor === 'purple' ? <Sparkles className="w-5 h-5 mr-2" /> : <Shield className="w-5 h-5 mr-2" />} 
          Mint {badgeName} 
        </>
      )}
    </Button>
  );
}