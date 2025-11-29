// api/cast.ts - Serverless endpoint to fetch Farcaster cast data via Neynar API
// This endpoint proxies requests to Neynar to keep API keys secure

export const config = {
  runtime: 'edge',
};

interface NeynarCastResponse {
  cast: {
    hash: string;
    author: {
      fid: number;
      username: string;
      display_name: string;
      pfp_url: string;
      profile: {
        bio: {
          text: string;
        };
      };
    };
    text: string;
    embeds: Array<{
      url?: string;
      metadata?: any;
    }>;
    reactions: {
      likes_count: number;
      recasts_count: number;
    };
    replies: {
      count: number;
    };
    timestamp: string;
    parent_hash?: string;
  };
}

export default async function handler(request: Request) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const castIdentifier = searchParams.get('identifier');
    const type = searchParams.get('type') || 'hash'; // 'hash' or 'url'

    // Get Neynar API key from environment
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    if (!NEYNAR_API_KEY) {
      console.error('❌ NEYNAR_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle different actions
    if (action === 'getCast') {
      if (!castIdentifier) {
        return new Response(
          JSON.stringify({ error: 'Cast identifier required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(`📡 Fetching cast data: ${castIdentifier} (type: ${type})`);

      // Neynar API endpoint
      const neynarUrl = `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(castIdentifier)}&type=${type}`;

      const response = await fetch(neynarUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-key': NEYNAR_API_KEY,
        },
      });

      if (!response.ok) {
        console.error(`❌ Neynar API error: ${response.status}`);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch cast data',
            status: response.status,
            details: errorText 
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const data: NeynarCastResponse = await response.json();
      
      // Extract and return relevant cast data
      const castData = {
        hash: data.cast.hash,
        author: {
          fid: data.cast.author.fid,
          username: data.cast.author.username,
          displayName: data.cast.author.display_name,
          pfpUrl: data.cast.author.pfp_url,
          bio: data.cast.author.profile?.bio?.text || '',
        },
        text: data.cast.text,
        embeds: data.cast.embeds || [],
        reactions: {
          likes: data.cast.reactions.likes_count,
          recasts: data.cast.reactions.recasts_count,
          quotes: 0, // Neynar v2 doesn't separate quotes from recasts
          replies: data.cast.replies.count,
        },
        timestamp: data.cast.timestamp,
        parentHash: data.cast.parent_hash,
      };

      console.log(`✅ Cast data fetched for ${data.cast.author.username}:`, {
        likes: castData.reactions.likes,
        recasts: castData.reactions.recasts,
        replies: castData.reactions.replies,
      });

      return new Response(
        JSON.stringify(castData),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', // Cache for 30s
          },
        }
      );
    }

    // Handle getUserProfile action (reuse existing logic)
    if (action === 'getUserProfile') {
      const fid = searchParams.get('fid');
      if (!fid) {
        return new Response(
          JSON.stringify({ error: 'FID required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const neynarUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;

      const response = await fetch(neynarUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-key': NEYNAR_API_KEY,
        },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch profile' }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const data = await response.json();
      const user = data.users?.[0];

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          pfpUrl: user.pfp_url,
          displayName: user.display_name,
          username: user.username,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=300', // Cache profiles for 5 min
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Cast API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
