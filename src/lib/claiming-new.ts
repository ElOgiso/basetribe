/**
 * Token Claiming Functions - SECURE VERSION
 * All claiming operations use serverless API endpoints
 * ✅ Private keys stay secure on the server
 * ✅ Never exposed to client-side code
 */

import { ethers } from 'ethers';

export interface ClaimResult {
  success: boolean;
  error?: string;
  txHash?: string;
  newBalance?: number;
}

/**
 * Claim $BTRIBE tokens - calls serverless API endpoint
 * ✅ SECURE: Private key stays on server, never exposed to client
 */
export async function claimTokens(
  userAddress: string,
  claimAmount: number,
  farcasterFid: string
): Promise<ClaimResult> {
  console.log('\n=== CLAIM $BTRIBE TOKENS ===');
  console.log('📍 User Address:', userAddress);
  console.log('📍 Farcaster FID:', farcasterFid || 'Not provided');
  console.log('📍 Claim Amount:', claimAmount);
  
  try {
    // Validate inputs
    if (!userAddress || !ethers.isAddress(userAddress)) {
      console.error('❌ Invalid wallet address:', userAddress);
      return { success: false, error: 'Invalid wallet address format' };
    }
    console.log('✅ User address is valid');

    if (claimAmount <= 0) {
      console.error('❌ Invalid claim amount:', claimAmount);
      return { success: false, error: 'No balance available to claim' };
    }
    console.log('✅ Claim amount is valid:', claimAmount);

    // Call serverless API endpoint (keeps private key secure on server)
    console.log('🔄 Calling serverless API to process claim...');
    
    const response = await fetch('/api/claim?action=claimBTRIBE', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress,
        amount: claimAmount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Claim API error:', data);
      return {
        success: false,
        error: data.error || 'Failed to process claim',
      };
    }

    console.log('✅ Claim successful!');
    console.log('   TX Hash:', data.transactionHash);
    console.log('   View on BaseScan: https://basescan.org/tx/' + data.transactionHash);

    return {
      success: true,
      txHash: data.transactionHash,
      newBalance: 0, // Balance is 0 after claim
    };
  } catch (error: any) {
    console.error('❌ Claim failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to process claim',
    };
  }
}

/**
 * Claim $JESSE tokens (Raid Bounty) - calls serverless API endpoint
 * ✅ SECURE: Private key stays on server, never exposed to client
 */
export async function claimJesseTokens(
  userAddress: string,
  claimAmount: number,
  userData: any
): Promise<ClaimResult> {
  console.log('\n=== CLAIM $JESSE TOKENS ===');
  console.log('📍 User Address:', userAddress);
  console.log('📍 Claim Amount:', claimAmount);

  try {
    // Validate inputs
    if (!userAddress || !ethers.isAddress(userAddress)) {
      console.error('❌ Invalid wallet address:', userAddress);
      return { success: false, error: 'Invalid wallet address format' };
    }

    if (claimAmount <= 0) {
      console.error('❌ Invalid claim amount:', claimAmount);
      return { success: false, error: 'No balance available to claim' };
    }

    // Call serverless API endpoint
    console.log('🔄 Calling serverless API to process claim...');
    
    const response = await fetch('/api/claim?action=claimJESSE', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress,
        amount: claimAmount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Claim API error:', data);
      return {
        success: false,
        error: data.error || 'Failed to process claim',
      };
    }

    console.log('✅ Claim successful!');
    console.log('   TX Hash:', data.transactionHash);
    console.log('   View on BaseScan: https://basescan.org/tx/' + data.transactionHash);

    return {
      success: true,
      txHash: data.transactionHash,
      newBalance: 0,
    };
  } catch (error: any) {
    console.error('❌ Claim failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to process claim',
    };
  }
}

/**
 * Claim USDC (USDC Drops) - calls serverless API endpoint
 * ✅ SECURE: Private key stays on server, never exposed to client
 */
export async function claimUSDC(
  userAddress: string,
  claimAmount: number,
  userData: any
): Promise<ClaimResult> {
  console.log('\n=== CLAIM USDC ===');
  console.log('📍 User Address:', userAddress);
  console.log('📍 Claim Amount:', claimAmount);

  try {
    // Validate inputs
    if (!userAddress || !ethers.isAddress(userAddress)) {
      console.error('❌ Invalid wallet address:', userAddress);
      return { success: false, error: 'Invalid wallet address format' };
    }

    if (claimAmount <= 0) {
      console.error('❌ Invalid claim amount:', claimAmount);
      return { success: false, error: 'No balance available to claim' };
    }

    // Call serverless API endpoint
    console.log('🔄 Calling serverless API to process claim...');
    
    const response = await fetch('/api/claim?action=claimUSDC', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress,
        amount: claimAmount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Claim API error:', data);
      return {
        success: false,
        error: data.error || 'Failed to process claim',
      };
    }

    console.log('✅ Claim successful!');
    console.log('   TX Hash:', data.transactionHash);
    console.log('   View on BaseScan: https://basescan.org/tx/' + data.transactionHash);

    return {
      success: true,
      txHash: data.transactionHash,
      newBalance: 0,
    };
  } catch (error: any) {
    console.error('❌ Claim failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to process claim',
    };
  }
}

/**
 * Get user's FID from their connected wallet address
 * Uses serverless Neynar API endpoint
 */
export async function fetchFidFromWallet(walletAddress: string, maxRetries: number = 3): Promise<string | null> {
  if (!walletAddress) {
    console.log('ℹ️ No wallet address provided for FID lookup');
    return null;
  }

  const normalizedAddress = walletAddress.toLowerCase();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      console.log(`🔍 Fetching FID for wallet (attempt ${attempt}/${maxRetries})...`);
      
      const response = await fetch(
        `/api/neynar?action=getFidFromWallet&wallet=${normalizedAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ No Farcaster account linked to this wallet');
          return null;
        }
        
        if (attempt < maxRetries) {
          console.log(`⚠️ API request failed (${response.status}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        console.log('⚠️ Could not fetch FID from API');
        return null;
      }

      const data = await response.json();
      
      if (data.fid) {
        console.log('✅ FID found:', data.fid);
        return data.fid;
      }

      console.log('ℹ️ No Farcaster account linked to this wallet');
      return null;
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (attempt < maxRetries) {
            console.log(`⚠️ Request timeout (attempt ${attempt}/${maxRetries}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
          console.log('⚠️ FID lookup timed out - continuing without FID');
        } else {
          if (attempt < maxRetries) {
            console.log(`⚠️ Network error (attempt ${attempt}/${maxRetries}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          console.log('⚠️ Could not connect to Farcaster network');
        }
      }
      
      if (attempt === maxRetries) {
        return null;
      }
    }
  }
  
  return null;
}

/**
 * Check if user has claimable balance
 * This should query from backend/Google Sheets
 */
export async function getClaimableBalance(farcasterFid: string): Promise<number> {
  // TODO: Implement proper balance check from backend
  console.log('ℹ️ getClaimableBalance called for FID:', farcasterFid);
  return 0;
}
