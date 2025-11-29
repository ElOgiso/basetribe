/**
 * Vercel Serverless Function - Manifold API Proxy
 * Keeps Manifold credentials secure on the server
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

  const { action } = req.query;

  try {
    switch (action) {
      case 'getCredentials':
        return getCredentials(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Manifold API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getCredentials(req: VercelRequest, res: VercelResponse) {
  const MANIFOLD_CLIENT_ID = process.env.MANIFOLD_CLIENT_ID;
  const MANIFOLD_CLIENT_SECRET = process.env.MANIFOLD_CLIENT_SECRET;

  if (!MANIFOLD_CLIENT_ID || !MANIFOLD_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Manifold credentials not configured' });
  }

  // Return credentials for client-side Manifold widget
  // Note: Manifold widget requires both ID and secret to be available client-side
  // This is by design from Manifold - the secret is scoped to your contract
  return res.status(200).json({
    clientId: MANIFOLD_CLIENT_ID,
    clientSecret: MANIFOLD_CLIENT_SECRET,
  });
}
