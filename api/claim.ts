/**
 * Vercel Serverless Function - Token Claiming
 * Securely handles token transfers using treasury wallet
 * CRITICAL: Treasury private key stays server-side only
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

// ERC20 ABI for token transfers
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'claimBTRIBE':
        return await claimBTRIBE(req, res);
      case 'claimJESSE':
        return await claimJESSE(req, res);
      case 'claimUSDC':
        return await claimUSDC(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action', received: action });
    }
  } catch (error) {
    console.error('[Claim API] Unhandled Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function claimBTRIBE(req: VercelRequest, res: VercelResponse) {
  const { userAddress, amount } = req.body;

  console.log('[claimBTRIBE] Request:', { userAddress, amount });

  if (!userAddress || !amount) {
    return res.status(400).json({ error: 'Missing required fields: userAddress, amount' });
  }

  const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
  
  if (!TREASURY_PRIVATE_KEY) {
    console.error('[claimBTRIBE] TREASURY_PRIVATE_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error: Treasury wallet not configured' });
  }

  try {
    // Connect to Base network
    const RPC_URL = process.env.RPC_PROVIDER_URL || 'https://base-mainnet.g.alchemy.com/v2/ZvCVwfVXrHA4UtKHlg8uchxYB2OBoiOe';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
    
    console.log('[claimBTRIBE] Treasury wallet:', treasuryWallet.address);

    // Connect to $BTRIBE token contract
    const BTRIBE_ADDRESS = '0xa58d90ec74c4978a161ffaba582f159b32b2d6d6';
    const tokenContract = new ethers.Contract(BTRIBE_ADDRESS, ERC20_ABI, treasuryWallet);

    // Convert amount to token units (18 decimals)
    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    
    console.log('[claimBTRIBE] Sending', amount, '$BTRIBE to', userAddress);

    // Check treasury balance
    const treasuryBalance = await tokenContract.balanceOf(treasuryWallet.address);
    console.log('[claimBTRIBE] Treasury balance:', ethers.formatUnits(treasuryBalance, 18));

    if (treasuryBalance < amountInWei) {
      return res.status(400).json({ 
        error: 'Insufficient treasury balance',
        treasuryBalance: ethers.formatUnits(treasuryBalance, 18),
        requested: amount
      });
    }

    // Send the transaction
    const tx = await tokenContract.transfer(userAddress, amountInWei);
    console.log('[claimBTRIBE] Transaction sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('[claimBTRIBE] ✅ Transaction confirmed:', receipt?.hash);

    return res.status(200).json({
      success: true,
      transactionHash: receipt?.hash,
      amount: amount,
      token: 'BTRIBE',
    });

  } catch (error) {
    console.error('[claimBTRIBE] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process claim',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function claimJESSE(req: VercelRequest, res: VercelResponse) {
  const { userAddress, amount } = req.body;

  console.log('[claimJESSE] Request:', { userAddress, amount });

  if (!userAddress || !amount) {
    return res.status(400).json({ error: 'Missing required fields: userAddress, amount' });
  }

  const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
  
  if (!TREASURY_PRIVATE_KEY) {
    console.error('[claimJESSE] TREASURY_PRIVATE_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error: Treasury wallet not configured' });
  }

  try {
    const RPC_URL = process.env.RPC_PROVIDER_URL || 'https://base-mainnet.g.alchemy.com/v2/ZvCVwfVXrHA4UtKHlg8uchxYB2OBoiOe';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
    
    console.log('[claimJESSE] Treasury wallet:', treasuryWallet.address);

    // Connect to $JESSE token contract
    const JESSE_ADDRESS = '0x50f88fe97f72cd3e75b9eb4f747f59bceba80d59';
    const tokenContract = new ethers.Contract(JESSE_ADDRESS, ERC20_ABI, treasuryWallet);

    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    
    console.log('[claimJESSE] Sending', amount, '$JESSE to', userAddress);

    const treasuryBalance = await tokenContract.balanceOf(treasuryWallet.address);
    console.log('[claimJESSE] Treasury balance:', ethers.formatUnits(treasuryBalance, 18));

    if (treasuryBalance < amountInWei) {
      return res.status(400).json({ 
        error: 'Insufficient treasury balance',
        treasuryBalance: ethers.formatUnits(treasuryBalance, 18),
        requested: amount
      });
    }

    const tx = await tokenContract.transfer(userAddress, amountInWei);
    console.log('[claimJESSE] Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('[claimJESSE] ✅ Transaction confirmed:', receipt?.hash);

    return res.status(200).json({
      success: true,
      transactionHash: receipt?.hash,
      amount: amount,
      token: 'JESSE',
    });

  } catch (error) {
    console.error('[claimJESSE] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process claim',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function claimUSDC(req: VercelRequest, res: VercelResponse) {
  const { userAddress, amount } = req.body;

  console.log('[claimUSDC] Request:', { userAddress, amount });

  if (!userAddress || !amount) {
    return res.status(400).json({ error: 'Missing required fields: userAddress, amount' });
  }

  const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
  
  if (!TREASURY_PRIVATE_KEY) {
    console.error('[claimUSDC] TREASURY_PRIVATE_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error: Treasury wallet not configured' });
  }

  try {
    const RPC_URL = process.env.RPC_PROVIDER_URL || 'https://base-mainnet.g.alchemy.com/v2/ZvCVwfVXrHA4UtKHlg8uchxYB2OBoiOe';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
    
    console.log('[claimUSDC] Treasury wallet:', treasuryWallet.address);

    // USDC on Base - 6 decimals
    const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const tokenContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, treasuryWallet);

    const amountInWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    
    console.log('[claimUSDC] Sending', amount, 'USDC to', userAddress);

    const treasuryBalance = await tokenContract.balanceOf(treasuryWallet.address);
    console.log('[claimUSDC] Treasury balance:', ethers.formatUnits(treasuryBalance, 6));

    if (treasuryBalance < amountInWei) {
      return res.status(400).json({ 
        error: 'Insufficient treasury balance',
        treasuryBalance: ethers.formatUnits(treasuryBalance, 6),
        requested: amount
      });
    }

    const tx = await tokenContract.transfer(userAddress, amountInWei);
    console.log('[claimUSDC] Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('[claimUSDC] ✅ Transaction confirmed:', receipt?.hash);

    return res.status(200).json({
      success: true,
      transactionHash: receipt?.hash,
      amount: amount,
      token: 'USDC',
    });

  } catch (error) {
    console.error('[claimUSDC] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process claim',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
