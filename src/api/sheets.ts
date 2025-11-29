/**
 * Google Sheets API Proxy - Serverless Function
 * 
 * This endpoint proxies requests to Google Sheets Apps Script to avoid CORS issues.
 * All Google Sheets operations go through this server-side endpoint.
 * 
 * ✅ Avoids CORS errors (server-to-server communication)
 * ✅ Keeps Google Sheets URL in environment variables
 * ✅ Handles all balance updates after claims
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }

  try {
    const body = await req.json();
    
    console.log('📤 Proxying request to Google Sheets:', body);

    // Get Google Sheets URL from environment or use default
    const sheetsUrl = process.env.ENGAGEMENT_BOT_URL || 
      'https://script.google.com/macros/s/AKfycbxZPexekalZaea1hH-l0DzKGG4e3Kxcjio2I9lUVImXE0NWET1YCc2Hdd61-X8UrpqhZg/exec';

    // Forward the request to Google Sheets
    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📥 Google Sheets response status:', response.status);

    // Get the response data
    const data = await response.text();
    
    console.log('✅ Google Sheets response:', data);

    // Return the response from Google Sheets
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: any) {
    console.error('❌ Error proxying to Google Sheets:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update Google Sheets',
        details: error.message 
      }), 
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}
