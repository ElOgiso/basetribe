/**
 * Vercel Serverless Function - Neynar API Proxy
 * Keeps API keys secure on the server
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log all incoming requests for debugging
  console.log('[Neynar API] Request:', {
    method: req.method,
    action: req.query.action,
    params: req.query,
    hasNeynarKey: !!(process.env.NEYNAR_API_KEY || process.env.NEYNAR_CLIENT_ID),
  });

  const { action } = req.query;

  try {
    switch (action) {
      case 'getFidFromWallet':
        return await getFidFromWallet(req, res);
      case 'getUserProfile':
        return await getUserProfile(req, res);
      case 'getUserProfiles':
        return await getUserProfiles(req, res);
      default:
        console.error('[Neynar API] Invalid action:', action);
        return res.status(400).json({ error: 'Invalid action', received: action });
    }
  } catch (error) {
    console.error('[Neynar API] Unhandled Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getFidFromWallet(req: VercelRequest, res: VercelResponse) {
  const { wallet } = req.query;

  console.log('[getFidFromWallet] Called with wallet:', wallet);

  if (!wallet) {
    console.error('[getFidFromWallet] No wallet address provided');
    return res.status(400).json({ error: 'Wallet address required' });
  }

  // Support both NEYNAR_API_KEY and NEYNAR_CLIENT_ID (they're the same thing)
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || process.env.NEYNAR_CLIENT_ID;

  if (!NEYNAR_API_KEY) {
    console.error('[getFidFromWallet] NEYNAR_API_KEY or NEYNAR_CLIENT_ID not configured in environment');
    return res.status(500).json({ error: 'Neynar API key not configured' });
  }

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${wallet}`;
    console.log('[getFidFromWallet] Calling Neynar API:', url);
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-api-key': NEYNAR_API_KEY,
      },
    });

    console.log('[getFidFromWallet] Neynar API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[getFidFromWallet] Neynar API error:', response.status, errorText);
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[getFidFromWallet] Neynar API data:', JSON.stringify(data).substring(0, 200));
    
    if (data && Object.keys(data).length > 0) {
      const walletLower = (wallet as string).toLowerCase();
      const walletData = data[walletLower];
      console.log('[getFidFromWallet] Wallet data for', walletLower, ':', walletData);
      
      if (walletData && walletData.length > 0) {
        const fid = walletData[0].fid.toString();
        console.log('[getFidFromWallet] ✅ FID found:', fid);
        return res.status(200).json({ fid });
      }
    }

    console.log('[getFidFromWallet] No FID found for wallet');
    return res.status(404).json({ error: 'FID not found for wallet' });
  } catch (error) {
    console.error('[getFidFromWallet] Exception:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch FID',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getUserProfile(req: VercelRequest, res: VercelResponse) {
  const { fid } = req.query;

  console.log('[getUserProfile] Called with FID:', fid);

  if (!fid) {
    console.error('[getUserProfile] No FID provided');
    return res.status(400).json({ error: 'FID required' });
  }

  // Support both NEYNAR_API_KEY and NEYNAR_CLIENT_ID (they're the same thing)
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || process.env.NEYNAR_CLIENT_ID;

  if (!NEYNAR_API_KEY) {
    console.error('[getUserProfile] NEYNAR_API_KEY or NEYNAR_CLIENT_ID not configured in environment');
    return res.status(500).json({ error: 'Neynar API key not configured' });
  }

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
    console.log('[getUserProfile] Calling Neynar API:', url);
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-api-key': NEYNAR_API_KEY,
      },
    });

    console.log('[getUserProfile] Neynar API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[getUserProfile] Neynar API error:', response.status, errorText);
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[getUserProfile] Neynar API data received for FID:', fid);
    
    if (data.users && data.users.length > 0) {
      const user = data.users[0];
      const profile = {
        pfpUrl: user.pfp_url,
        displayName: user.display_name,
        username: user.username,
      };
      console.log('[getUserProfile] ✅ Profile found:', profile.username);
      return res.status(200).json(profile);
    }

    console.log('[getUserProfile] No user found for FID');
    return res.status(404).json({ error: 'User not found' });
  } catch (error) {
    console.error('[getUserProfile] Exception:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getUserProfiles(req: VercelRequest, res: VercelResponse) {
  const { fids } = req.query;

  console.log('[getUserProfiles] Called with FIDs:', fids);

  if (!fids) {
    console.error('[getUserProfiles] No FIDs provided');
    return res.status(400).json({ error: 'FIDs required (comma-separated)' });
  }

  // Support both NEYNAR_API_KEY and NEYNAR_CLIENT_ID (they're the same thing)
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || process.env.NEYNAR_CLIENT_ID;

  if (!NEYNAR_API_KEY) {
    console.error('[getUserProfiles] NEYNAR_API_KEY or NEYNAR_CLIENT_ID not configured in environment');
    return res.status(500).json({ error: 'Neynar API key not configured' });
  }

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids}`;
    console.log('[getUserProfiles] Calling Neynar API:', url);
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-api-key': NEYNAR_API_KEY,
      },
    });

    console.log('[getUserProfiles] Neynar API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[getUserProfiles] Neynar API error:', response.status, errorText);
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[getUserProfiles] Neynar API returned data for', data.users?.length || 0, 'users');
    
    // Return the full response (contains users array)
    return res.status(200).json(data);
  } catch (error) {
    console.error('[getUserProfiles] Exception:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user profiles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
