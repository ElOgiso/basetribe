/**
 * Vercel Serverless Function - Environment Variable Test
 * This endpoint helps diagnose environment variable issues
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check which environment variables are set (without exposing values)
  const envStatus = {
    // Neynar API (Farcaster integration) - Support both variable names
    NEYNAR_API_KEY: !!process.env.NEYNAR_API_KEY,
    NEYNAR_CLIENT_ID: !!process.env.NEYNAR_CLIENT_ID,
    NEYNAR_FID: !!process.env.NEYNAR_FID,
    NEYNAR_SIGNER_UUID: !!process.env.NEYNAR_SIGNER_UUID,
    
    // Manifold (NFT minting)
    MANIFOLD_CLIENT_ID: !!process.env.MANIFOLD_CLIENT_ID,
    MANIFOLD_CLIENT_SECRET: !!process.env.MANIFOLD_CLIENT_SECRET,
    
    // Treasury (Token claims) - CRITICAL
    TREASURY_PRIVATE_KEY: !!process.env.TREASURY_PRIVATE_KEY,
    
    // Google Apps Script URLs
    RAID_MASTER_URL: !!process.env.RAID_MASTER_URL,
    ENGAGEMENT_BOT_URL: !!process.env.ENGAGEMENT_BOT_URL,
    
    // Telegram Bot (optional)
    TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: !!process.env.TELEGRAM_CHAT_ID,
    
    // RPC Provider
    RPC_PROVIDER_URL: !!process.env.RPC_PROVIDER_URL,
    
    // Google Sheets Webhooks (optional)
    SHEETS_WEBHOOK_URL: !!process.env.SHEETS_WEBHOOK_URL,
    SHEETS_WEBHOOK_SECRET: !!process.env.SHEETS_WEBHOOK_SECRET,
  };

  // Check if Neynar API key is valid by testing a simple call
  // Support both NEYNAR_API_KEY and NEYNAR_CLIENT_ID
  const NEYNAR_KEY = process.env.NEYNAR_API_KEY || process.env.NEYNAR_CLIENT_ID;
  let neynarApiTest = 'not_tested';
  if (NEYNAR_KEY) {
    try {
      const testResponse = await fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=3', {
        headers: {
          'accept': 'application/json',
          'x-api-key': NEYNAR_KEY,
        },
      });
      
      if (testResponse.ok) {
        neynarApiTest = 'valid';
      } else {
        neynarApiTest = `invalid_status_${testResponse.status}`;
      }
    } catch (error) {
      neynarApiTest = 'error';
    }
  }

  return res.status(200).json({
    message: 'Environment Variable Status Check',
    timestamp: new Date().toISOString(),
    environment_variables: envStatus,
    neynar_api_test: neynarApiTest,
    all_variables_present: Object.values(envStatus).every(v => v),
  });
}
