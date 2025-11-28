// Token claiming via Secure Vercel API
// ✅ SECURE: Private keys are hidden in /api/claim
// This file runs in the browser and sends requests to the server

import { ethers } from 'ethers';
import { CONFIG } from './constants';

// Interface for claim results
interface ClaimResult {
  success: boolean;
  txHash?: string;
  error?: string;
  newBalance?: number;
}

// ------------------------------------------------------------------
// 1. GENERIC API HANDLER (Calls your hidden /api/claim)
// ------------------------------------------------------------------
async function callClaimApi(
  userAddress: string,
  amount: number,
  tokenType: 'BTRIBE' | 'JESSE' | 'USDC',
  fid?: string
): Promise<ClaimResult> {
  try {
    console.log(`📡 Calling API to claim ${amount} ${tokenType}...`);
    
    // Validate address before sending to server
    if (!userAddress || !ethers.isAddress(userAddress)) {
      return { success: false, error: 'Invalid wallet address format' };
    }

    const response = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress,
        amount,
        tokenType,
        fid // Optional: Pass FID for server-side logging
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Claim request failed at server');
    }

    console.log(`✅ API Success! TX Hash: ${data.txHash}`);
    return {
      success: true,
      txHash: data.txHash,
      newBalance: 0 // Frontend will update this from sheets/balance fetch
    };

  } catch (error: any) {
    console.error('❌ API Call Failed:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred',
    };
  }
}

// ------------------------------------------------------------------
// 2. MAIN CLAIM FUNCTIONS
// ------------------------------------------------------------------

/**
 * Claim $BTRIBE tokens
 */
export async function claimTokens(
  userAddress: string,
  claimAmount: number,
  farcasterFid: string
): Promise<ClaimResult> {
  // 1. Call Secure API
  const result = await callClaimApi(userAddress, claimAmount, 'BTRIBE', farcasterFid);

  // 2. If successful, update Google Sheets (Optimistic UI update)
  if (result.success && result.txHash) {
    try {
      const currentBalance = await getUserBalanceFromSheets(farcasterFid);
      if (currentBalance !== null) {
        const newBalance = Math.max(0, currentBalance - claimAmount);
        // Fire and forget sheet update
        updateUserBalanceInSheets(farcasterFid, newBalance, claimAmount, result.txHash);
      }
    } catch (e) {
      console.warn('⚠️ Sheet update failed (but tokens were sent):', e);
    }
  }

  return result;
}

/**
 * Claim $JESSE tokens (Raid Bounty)
 */
export async function claimJesseTokens(
  userAddress: string,
  claimAmount: number,
  userData: any
): Promise<ClaimResult> {
  const fid = userData?.farcaster_fid || '';
  const result = await callClaimApi(userAddress, claimAmount, 'JESSE', fid);
  
  // Optional: Add sheet update logic for Jesse here if needed
  
  return result;
}

/**
 * Claim USDC (USDC Drops)
 */
export async function claimUSDC(
  userAddress: string,
  claimAmount: number,
  userData: any
): Promise<ClaimResult> {
  const fid = userData?.farcaster_fid || '';
  const result = await callClaimApi(userAddress, claimAmount, 'USDC', fid);
  
  // Optional: Add sheet update logic for USDC here if needed
  
  return result;
}

// ------------------------------------------------------------------
// 3. HELPER FUNCTIONS
// ------------------------------------------------------------------

/**
 * Get user's $BTRIBE balance from Google Sheets
 */
async function getUserBalanceFromSheets(farcasterFid: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/Users!A:W`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const rows = data.values;
    if (!rows || rows.length < 2) return null;

    // Find user by FID (Column D = index 3)
    const userRow = rows.find((row: string[]) => row[3] === farcasterFid);
    if (!userRow) return null;

    // Column K (index 10) = BTribe_Balance
    const balance = parseInt(userRow[10] || '0');
    return isNaN(balance) ? 0 : balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}

/**
 * Update user's balance in Google Sheets after claim
 */
async function updateUserBalanceInSheets(
  farcasterFid: string,
  newBalance: number,
  claimedAmount: number = 0,
  txHash: string = ''
): Promise<boolean> {
  // Use Vite env var for this specific webhook as it's a client-side call
  const SHEETS_WEBHOOK_URL = import.meta.env.VITE_SHEETS_WEBHOOK_URL;
  
  if (!SHEETS_WEBHOOK_URL) {
    console.warn('⚠️ Sheets webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farcasterFid, newBalance, claimedAmount, txHash }),
    });
    return response.ok;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
}

/**
 * Get FID from Wallet (Neynar)
 */
export async function fetchFidFromWallet(walletAddress: string): Promise<string | null> {
  try {
    if (!walletAddress || !CONFIG.NEYNAR_API_KEY) return null;
    
    // Neynar API Call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${walletAddress}`,
      { 
        headers: { 'accept': 'application/json', 'api_key': CONFIG.NEYNAR_API_KEY },
        signal: controller.signal 
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();
    
    if (data[walletAddress]?.length > 0) {
      return data[walletAddress][0].fid.toString();
    }
    return null;
  } catch (error) {
    console.error('Error fetching FID:', error);
    return null;
  }
}

/**
 * Check if user has claimable balance
 */
export async function getClaimableBalance(farcasterFid: string): Promise<number> {
  return (await getUserBalanceFromSheets(farcasterFid)) || 0;
}