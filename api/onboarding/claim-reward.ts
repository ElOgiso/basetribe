import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { farcasterFid, amount, token } = req.body;

  if (!farcasterFid || !amount || !token) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const BACKEND_URL = process.env.ASSESSMENT_BOT_URL;

  if (!BACKEND_URL) {
    console.error('❌ ASSESSMENT_BOT_URL not configured');
    return res.status(500).json({ error: 'Backend not configured' });
  }

  try {
    console.log('🎁 Claiming reward for FID:', farcasterFid, { amount, token });

    // Call backend to update user balance
    const response = await fetch(`${BACKEND_URL}?action=claimNewUserBonus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fid: farcasterFid,
        amount,
        token,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ Reward claimed:', data);

    return res.status(200).json({
      success: true,
      message: `Claimed ${amount} $${token}`,
      newBalance: data.newBalance,
    });
  } catch (error: any) {
    console.error('❌ Claim error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to claim reward',
    });
  }
}

export const config = {
  runtime: 'nodejs',
};
