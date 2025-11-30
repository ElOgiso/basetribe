import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTradeCall } from '@zoralabs/coins-sdk';
import { type Address } from 'viem';

// Set Zora API key globally for the SDK
// This needs to be done before any SDK calls
if (process.env.ZORA_KEY) {
  process.env.ZORA_API_KEY = process.env.ZORA_KEY;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { amountEth, walletAddress } = req.body;

    if (!amountEth || !walletAddress) {
      return res.status(400).json({ 
        error: 'Missing required parameters: amountEth, walletAddress' 
      });
    }

    const ZORA_API_KEY = process.env.ZORA_KEY;
    if (!ZORA_API_KEY) {
      console.error('❌ ZORA_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error: ZORA_KEY not set' 
      });
    }

    console.log('💱 Creating Zora trade call with API key');
    console.log('📦 Parameters:', { amountEth, walletAddress });

    const BTRIBE_ADDRESS = '0xa58d90ec74c4978a161ffaba582f159b32b2d6d6' as Address;

    // Convert ETH string to Wei BigInt
    const amountInWei = BigInt(Math.floor(parseFloat(amountEth) * 1e18));

    // Create trade parameters
    const tradeParameters = {
      sell: { type: 'eth' as const },
      buy: {
        type: 'erc20' as const,
        address: BTRIBE_ADDRESS,
      },
      amountIn: amountInWei,
      slippage: 0.05, // 5% slippage tolerance
      sender: walletAddress as Address,
    };

    console.log('🔧 Creating trade call with parameters...');

    // Use Zora SDK to create trade call
    // The SDK will use the ZORA_API_KEY from environment
    const tradeCall = await createTradeCall(tradeParameters);

    console.log('✅ Trade call created successfully');

    // Serialize BigInt values for JSON response
    const serializedTradeCall = {
      ...tradeCall,
      call: {
        ...tradeCall.call,
        value: tradeCall.call.value.toString(),
      },
    };

    return res.status(200).json({
      success: true,
      tradeCall: serializedTradeCall,
    });

  } catch (error: any) {
    console.error('❌ Zora swap API error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create trade call',
      details: error.toString(),
    });
  }
}

export const config = {
  runtime: 'nodejs',
};