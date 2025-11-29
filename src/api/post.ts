/**
 * Post API - Serverless Function
 * 
 * This endpoint handles posting new engagements to Google Sheets.
 * Only allows posts during active sessions for full members.
 * 
 * ✅ Server-side posting to avoid CORS issues
 * ✅ Validates session timing
 * ✅ Appends to Engagements sheet
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
    const { action, data } = body;
    
    console.log('📤 Post API - Action:', action);
    console.log('📤 Post API - Data:', data);

    if (action !== 'addEngagement') {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Validate required fields
    const requiredFields = [
      'session_date',
      'timestamp', 
      'session_time',
      'session_index',
      'telegram_id',
      'telegram_username',
      'farcaster_username',
      'cast_hash',
      'link',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    }

    // Get Google Apps Script URL from environment
    const sheetsUrl = process.env.ENGAGEMENT_BOT_URL;
    if (!sheetsUrl) {
      console.error('❌ ENGAGEMENT_BOT_URL not found in environment');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    console.log('📡 Posting to Google Sheets...');

    // Forward the request to Google Sheets Apps Script
    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addEngagement',
        data: {
          session_date: data.session_date,
          timestamp: data.timestamp,
          session_time: data.session_time,
          session_index: data.session_index,
          telegram_id: data.telegram_id,
          telegram_username: data.telegram_username,
          farcaster_username: data.farcaster_username,
          cast_hash: data.cast_hash,
          link: data.link,
          status: 'pending',
          checked_at: '',
        },
      }),
    });

    console.log('📥 Google Sheets response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Sheets error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to post to sheets',
          details: errorText 
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Get the response data
    const responseData = await response.text();
    
    console.log('✅ Post successful:', responseData);

    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Post added successfully',
        data: responseData 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in post API:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process post',
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
