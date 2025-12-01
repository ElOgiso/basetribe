import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const BACKEND_URL = process.env.ASSESSMENT_BOT_URL;

  if (!BACKEND_URL) {
    console.error('❌ ASSESSMENT_BOT_URL not configured');
    return res.status(500).json({ error: 'Backend not configured' });
  }

  try {
    console.log('🔍 Verifying Farcaster username:', username);

    // Call Google Apps Script backend
    const response = await fetch(`${BACKEND_URL}?action=verifyFarcaster`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ Verification response:', data);

    if (data.success && data.fid) {
      return res.status(200).json({
        success: true,
        fid: data.fid,
        followers: data.followers || 0,
        status: data.status || 'New Member',
        username: data.username || username,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Username not found',
      });
    }
  } catch (error: any) {
    console.error('❌ Verification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Verification failed',
    });
  }
}

export const config = {
  runtime: 'nodejs',
};
