import { ethers } from 'ethers';

// Helper to handle CORS
const allowCors = (fn: any) => async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { userAddress, amount, tokenType } = req.body;
  
  // 1. THIS WORKS HERE (Server Side)
  const PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: Treasury Key missing' });
  }

  try {
    // 2. Setup Provider & Wallet
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // 3. Determine Token Address
    let tokenAddress = '';
    // You can hardcode these or read from env vars
    if (tokenType === 'BTRIBE') tokenAddress = '0xYourBTribeContractAddress'; 
    else if (tokenType === 'JESSE') tokenAddress = '0xYourJesseContractAddress'; 
    else if (tokenType === 'USDC') tokenAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

    // 4. Connect to Contract
    const abi = ['function transfer(address to, uint256 amount) returns (bool)', 'function decimals() view returns (uint8)'];
    const contract = new ethers.Contract(tokenAddress, abi, wallet);

    // 5. Calculate Amount
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);

    // 6. Send Transaction
    console.log(`Sending ${amount} ${tokenType} to ${userAddress}`);
    const tx = await contract.transfer(userAddress, amountInWei);
    
    // 7. Wait for hash (optional, usually we return hash immediately for speed)
    return res.status(200).json({ success: true, txHash: tx.hash });

  } catch (error: any) {
    console.error("Claim Error:", error);
    return res.status(500).json({ error: error.message || 'Transaction failed' });
  }
}

export default allowCors(handler);