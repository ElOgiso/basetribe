import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { farcasterUsername, farcasterFid, baseUsername, followers } = req.body;

  if (!farcasterUsername || !farcasterFid || !baseUsername) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const BACKEND_URL = process.env.ASSESSMENT_BOT_URL;

  if (!BACKEND_URL) {
    console.error('❌ ASSESSMENT_BOT_URL not configured');
    return res.status(500).json({ error: 'Backend not configured' });
  }

  try {
    console.log('💾 Completing onboarding for:', { farcasterUsername, farcasterFid, baseUsername });

    // Step 1: Save Base username
    const saveBaseResponse = await fetch(`${BACKEND_URL}?action=saveBaseUsername`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fid: farcasterFid,
        baseUsername,
      }),
    });

    if (!saveBaseResponse.ok) {
      throw new Error('Failed to save Base username');
    }

    // Step 2: Complete onboarding
    const completeResponse = await fetch(`${BACKEND_URL}?action=completeOnboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        farcasterUsername,
        fid: farcasterFid,
        baseUsername,
        followers,
      }),
    });

    if (!completeResponse.ok) {
      throw new Error('Failed to complete onboarding');
    }

    const data = await completeResponse.json();

    console.log('✅ Onboarding completed:', data);

    // Check if user gets a reward
    let reward = null;

    // If user hasn't received Newuserbonus yet, generate random reward
    if (data.newUser || !data.hasReceivedBonus) {
      // Random reward: either JESSE (1-20) or BTRIBE (50-200)
      const isJesse = Math.random() < 0.5;
      
      if (isJesse) {
        reward = {
          token: 'JESSE',
          amount: Math.floor(Math.random() * 20) + 1, // 1-20
        };
      } else {
        reward = {
          token: 'BTRIBE',
          amount: Math.floor(Math.random() * 151) + 50, // 50-200
        };
      }

      console.log('🎁 Generated reward:', reward);
    }

    return res.status(200).json({
      success: true,
      reward,
      message: 'Onboarding completed successfully',
    });
  } catch (error: any) {
    console.error('❌ Completion error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Onboarding failed',
    });
  }
}

export const config = {
  runtime: 'nodejs',
};
