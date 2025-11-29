// lib/api.ts - API functions for fetching data from Google Sheets and external APIs

import { CONFIG } from './constants';
import type { UserData, LeaderboardEntry, EngagementData } from './types';

// ============================================
// GOOGLE SHEETS DATA FETCHING
// ============================================

/**
 * Fetches user data from Google Sheets by matching Farcaster FID
 * This is the PRIMARY function for loading user-specific data
 */
export async function fetchUserDataByFID(fid: number | string): Promise<UserData | null> {
  try {
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Users`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
        },
        mode: 'cors',
        cache: 'no-cache'
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const jsonText = text.substring(47, text.length - 2);
    const data = JSON.parse(jsonText);

    // Column mapping based on your production setup
    const rows = data.table.rows;
    
    // Find the user row where Column D (index 3) matches the FID
    const userRow = rows.find((row: any) => {
      const rowFid = row.c[3]?.v; // Column D: Farcaster_fid (index 3)
      return String(rowFid) === String(fid);
    });

    if (!userRow) {
      console.log(`No user found in Google Sheets for FID: ${fid}`);
      return null;
    }

    // Extract user data from the matched row
    const userData: UserData = {
      telegram_username: userRow.c[0]?.v || '', // Column A
      telegram_id: userRow.c[1]?.v || '', // Column B
      farcaster_username: userRow.c[2]?.v || '', // Column C
      farcaster_fid: String(userRow.c[3]?.v || fid), // Column D
      session_streak: parseInt(userRow.c[4]?.v) || 0, // Column E
      last_engaged_date: userRow.c[5]?.v || '', // Column F
      fail_count: parseInt(userRow.c[6]?.v) || 0, // Column G
      ban_status: userRow.c[7]?.v || 'none', // Column H
      stars: parseInt(userRow.c[8]?.v) || 0, // Column I
      defaults: parseInt(userRow.c[9]?.v) || 0, // Column J
      btribe_balance: parseFloat(userRow.c[10]?.v) || 0, // Column K - $BTRIBE
      base_username: userRow.c[11]?.v || '', // Column L
      email: userRow.c[12]?.v || '', // Column M
      status: userRow.c[13]?.v || 'unknown', // Column N - Membership status
      probation_count: parseInt(userRow.c[14]?.v) || 0, // Column O
      invite_link: userRow.c[15]?.v || '', // Column P
      invites_count: parseInt(userRow.c[16]?.v) || 0, // Column Q
      usdc_claims: parseFloat(userRow.c[17]?.v) || 0, // Column R
      premium: userRow.c[18]?.v === 'true' || false, // Column S
      shoutouts_left: parseInt(userRow.c[19]?.v) || 0, // Column T
      followers: parseInt(userRow.c[20]?.v) || 0, // Column U
      jesse_balance: parseFloat(userRow.c[21]?.v) || 0, // Column V - $JESSE
      membership_nft: userRow.c[22]?.v || '', // Column W - NFT ownership
      completed_tasks: userRow.c[23]?.v || '', // Column X - Completed tasks
      booster: parseFloat(userRow.c[24]?.v) || 0, // Column Y - Booster balance
    };

    console.log('✅ User data loaded from Google Sheets:', {
      fid: userData.farcaster_fid,
      username: userData.farcaster_username,
      btribe: userData.btribe_balance,
      jesse: userData.jesse_balance,
      usdc: userData.usdc_claims,
      booster: userData.booster,
      status: userData.status,
    });

    return userData;
  } catch (error) {
    console.warn('⚠️ User data temporarily unavailable');
    console.log('Note: This may be due to network issues or Google Sheets access. The app will continue with limited functionality.');
    return null;
  }
}

/**
 * Fetch leaderboard data from Google Sheets
 * Returns all users sorted by ranking criteria with Farcaster profile data
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    console.log('📊 Loading leaderboard data...');
    
    // Use Google Visualization API (gviz) - works with public sheets without API key
    let retries = 3;
    let lastError;
    let rows = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Users&timestamp=${Date.now()}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/plain, */*',
            },
            mode: 'cors',
            cache: 'no-cache',
            signal: controller.signal,
          }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        const jsonText = text.substring(47, text.length - 2);
        const data = JSON.parse(jsonText);

        rows = data.table.rows;
        
        if (!rows || rows.length < 2) {
          throw new Error('No data returned from Google Sheets');
        }
        
        console.log('✅ Fetched leaderboard data successfully');
        break; // Success! Exit retry loop
      } catch (fetchError) {
        lastError = fetchError;
        console.warn(`⚠️ Leaderboard attempt ${i + 1}/${retries} failed:`, fetchError);
        
        if (i < retries - 1) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    if (!rows) {
      throw lastError || new Error('Failed to load leaderboard after multiple attempts');
    }

    const leaderboardData: LeaderboardEntry[] = [];

    for (let i = 1; i < rows.length; i++) { // Skip header row
      const row = rows[i];
      const fid = row.c[3]?.v; // Column D
      if (!fid) continue; // Skip rows without FID

      const entry: LeaderboardEntry = {
        farcaster_fid: String(fid),
        farcaster_username: row.c[2]?.v || 'Unknown', // Column C
        stars: parseInt(row.c[8]?.v) || 0, // Column I
        defaults: parseInt(row.c[9]?.v) || 0, // Column J
        btribe_balance: parseFloat(row.c[10]?.v) || 0, // Column K
        invites_count: parseInt(row.c[16]?.v) || 0, // Column Q
        usdc_claims: parseFloat(row.c[17]?.v) || 0, // Column R
      };

      leaderboardData.push(entry);
    }

    // Sort by stars (descending), then by btribe_balance
    leaderboardData.sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return b.btribe_balance - a.btribe_balance;
    });

    console.log(`✅ Leaderboard loaded: ${leaderboardData.length} users`);
    
    // Fetch Farcaster profile data for all users (batch request via serverless API)
    if (leaderboardData.length > 0) {
      try {
        console.log(`🔄 Fetching profile data for ${leaderboardData.length} users...`);
        
        // Collect all FIDs (Neynar supports up to 100 FIDs per request)
        // Filter out invalid/empty FIDs
        const fids = leaderboardData
          .map(entry => entry.farcaster_fid)
          .filter(fid => fid && fid !== '0' && fid !== '')
          .slice(0, 100);
        
        if (fids.length === 0) {
          console.log('ℹ️ No valid FIDs to fetch profiles for');
          return leaderboardData;
        }
        
        const fidsParam = fids.join(',');
        
        // Use serverless API route to fetch profiles (keeps API key secure)
        const profileResponse = await fetch(
          `/api/neynar?action=getUserProfiles&fids=${fidsParam}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(`📡 Profile endpoint response status: ${profileResponse.status}`);

        if (profileResponse.ok) {
          const contentType = profileResponse.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.warn(`⚠️ Profile endpoint returned non-JSON response (${contentType}) - API route may not be deployed`);
            console.log('ℹ️ Continuing without profile images. Deploy to Vercel for profile image support.');
            return leaderboardData;
          }
          
          const profileData = await profileResponse.json();
          const users = profileData.users || [];
          
          console.log(`✅ Received profile data for ${users.length} users from Neynar`);
          
          // Map profile data to leaderboard entries
          const profileMap = new Map(
            users.map((user: any) => [
              String(user.fid),
              {
                pfp_url: user.pfp_url || '',
                display_name: user.display_name || user.username || '',
              }
            ])
          );
          
          // Update leaderboard entries with profile data
          leaderboardData.forEach(entry => {
            const profile = profileMap.get(entry.farcaster_fid);
            if (profile) {
              entry.profile_image = profile.pfp_url;
              entry.display_name = profile.display_name;
              console.log(`✅ Updated profile for @${entry.farcaster_username}: ${entry.display_name}`);
            }
          });
          
          console.log(`✅ Updated ${users.length} leaderboard entries with profile images`);
        } else {
          console.warn(`⚠️ Profile fetch returned status ${profileResponse.status} - API route may not be available`);
          console.log('ℹ️ Continuing without profile images. Deploy to Vercel for profile image support.');
        }
      } catch (profileError) {
        console.log('ℹ️ Profile images unavailable - this is normal in local dev. Deploy to Vercel for full functionality.');
      }
    }
    
    return leaderboardData;
  } catch (error) {
    console.error('❌ Leaderboard data error:', error);
    console.warn('⚠️ Leaderboard data temporarily unavailable');
    return [];
  }
}

// Fetch Farcaster profile data
export async function fetchFarcasterProfile(fid: string): Promise<{
  pfpUrl: string;
  displayName: string;
  username: string;
} | null> {
  try {
    // Use our serverless API route instead of direct Neynar call
    const response = await fetch(
      `${CONFIG.API.NEYNAR}?action=getUserProfile&fid=${fid}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.pfpUrl) return null;

    return {
      pfpUrl: data.pfpUrl || '',
      displayName: data.displayName || data.username || '',
      username: data.username || '',
    };
  } catch (error) {
    console.error('Error fetching Farcaster profile:', error);
    return null;
  }
}

// Check if user is a member of the community
export async function checkMembership(fid: string): Promise<boolean> {
  const userData = await fetchUserDataByFID(fid);
  return userData !== null && userData.status === 'full_member';
}

// Get current session info
export function getCurrentSession(): { time: string; rule: string } | null {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Lagos',
  });

  const sessions = ['08:00', '12:00', '16:00', '20:00', '00:00', '04:00'];
  const rules = {
    '08:00': 'LIKE & RECAST',
    '12:00': 'LIKE ONLY',
    '16:00': 'FULL ENGAGEMENT',
    '20:00': 'RECAST & COMMENT',
    '00:00': 'LIKE & QUOTE',
    '04:00': 'FULL ENGAGEMENT',
  } as const;

  for (let i = 0; i < sessions.length; i++) {
    const sessionTime = sessions[i];
    const nextSession = sessions[(i + 1) % sessions.length];
    
    if (currentTime >= sessionTime && currentTime < nextSession) {
      return {
        time: sessionTime,
        rule: rules[sessionTime as keyof typeof rules],
      };
    }
  }

  return null;
}

// Fetch raid data from BASERAID tab
export async function fetchRaidData(): Promise<{
  raidTitle: string;
  raidDescription: string;
  raidLink: string;
  raidDate: string;
  raidTime: string;
  raidReward: string;
  raidStatus: string;
} | null> {
  try {
    // Try Raid Master Google Apps Script first (with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const raidMasterResponse = await fetch(
        `${CONFIG.RAID_MASTER_URL}?action=getLatestRaid&timestamp=${Date.now()}`,
        {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
          cache: 'no-cache',
        }
      );

      clearTimeout(timeoutId);

      if (raidMasterResponse.ok) {
        const raidData = await raidMasterResponse.json();
        if (raidData && raidData.success && raidData.data) {
          console.log('✅ Raid data fetched from Raid Master');
          return raidData.data;
        }
      }
    } catch (raidMasterError) {
      console.log('Raid Master unavailable, trying fallback');
      clearTimeout(timeoutId);
    }

    // Fallback: Use direct fetch with public Google Sheets API
    const publicSheetUrl = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=BASERAID`;
    
    const publicResponse = await fetch(publicSheetUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!publicResponse.ok) {
      console.warn('⚠️ No raid data available - BASERAID sheet may be empty or inaccessible');
      return null;
    }

    const text = await publicResponse.text();
    
    // Google Visualization API returns JSONP, need to parse it
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) {
      console.warn('⚠️ Failed to parse raid data');
      return null;
    }

    const data = JSON.parse(jsonMatch[1]);
    const rows = data.table.rows;
    
    if (!rows || rows.length === 0) {
      console.warn('⚠️ No raids found in BASERAID sheet');
      return null;
    }

    // Get the last row (most recent raid)
    const latestRaid = rows[rows.length - 1];
    const cells = latestRaid.c;

    return {
      raidTitle: cells[0]?.v || 'New Raid Available',
      raidDescription: cells[1]?.v || 'Check Telegram for details',
      raidLink: cells[2]?.v || '',
      raidDate: cells[3]?.v || new Date().toLocaleDateString(),
      raidTime: cells[4]?.v || '08:00 WAT',
      raidReward: cells[5]?.v || '100 $JESSE',
      raidStatus: cells[6]?.v || 'active',
    };
  } catch (error) {
    console.error('❌ Error fetching raid data:', error);
    return null;
  }
}

// Update user's membershipNFT status in Google Sheets
export async function updateMembershipNFT(
  fid: string,
  walletAddress: string,
  txHash: string,
  nftType: 'BELIEVER' | 'FOUNDER'
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    
    console.log('📝 Updating membershipNFT in Google Sheets...');
    console.log('   FID:', fid);
    console.log('   Wallet:', walletAddress);
    console.log('   NFT Type:', nftType);
    console.log('   TX Hash:', txHash);
    
    // Use serverless API endpoint to avoid CORS issues
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateMembershipNFT',
        fid,
        walletAddress,
        txHash,
        nftType,
        timestamp,
        status: 'claimed',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to update membership NFT status:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('✅ Membership NFT updated in Google Sheets:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating membership NFT:', error);
    return false;
  }
}

// Update user's $BTRIBE balance in Google Sheets after claim
export async function updateBTribeBalance(
  fid: string,
  newBalance: number,
  claimedAmount: number,
  txHash: string
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const payload = {
      action: 'updateBalance',
      fid,
      balanceType: 'btribe',
      newBalance,
      claimedAmount,
      txHash,
      timestamp,
    };
    
    console.log('📤 Sending $BTRIBE balance update to serverless API:', payload);
    
    // Use serverless API endpoint to avoid CORS issues
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update Google Sheets');
    }

    const result = await response.json();
    console.log('✅ $BTRIBE balance updated in Google Sheets:', result);
    console.log('📊 Updated: FID', fid, '| New Balance:', newBalance, '| Claimed:', claimedAmount);
    return true;
  } catch (error) {
    console.error('❌ Error updating $BTRIBE balance:', error);
    return false;
  }
}

// Update user's $JESSE balance in Google Sheets after claim
export async function updateJesseBalance(
  fid: string,
  newBalance: number,
  claimedAmount: number,
  txHash: string
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const payload = {
      action: 'updateBalance',
      fid,
      balanceType: 'jesse',
      newBalance,
      claimedAmount,
      txHash,
      timestamp,
    };
    
    console.log('📤 Sending $JESSE balance update to serverless API:', payload);
    
    // Use serverless API endpoint to avoid CORS issues
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update Google Sheets');
    }

    const result = await response.json();
    console.log('✅ $JESSE balance updated in Google Sheets:', result);
    console.log('📊 Updated: FID', fid, '| New Balance:', newBalance, '| Claimed:', claimedAmount);
    return true;
  } catch (error) {
    console.error('❌ Error updating $JESSE balance:', error);
    return false;
  }
}

// Update user's USDC balance in Google Sheets after claim
export async function updateUSDCBalance(
  fid: string,
  newBalance: number,
  claimedAmount: number,
  txHash: string
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const payload = {
      action: 'updateBalance',
      fid,
      balanceType: 'usdc',
      newBalance,
      claimedAmount,
      txHash,
      timestamp,
    };
    
    console.log('📤 Sending USDC balance update to serverless API:', payload);
    
    // Use serverless API endpoint to avoid CORS issues
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update Google Sheets');
    }

    const result = await response.json();
    console.log('✅ USDC balance updated in Google Sheets:', result);
    console.log('📊 Updated: FID', fid, '| New Balance:', newBalance, '| Claimed:', claimedAmount);
    return true;
  } catch (error) {
    console.error('❌ Error updating USDC balance:', error);
    return false;
  }
}

// Get user by wallet address
export async function getUserByWallet(walletAddress: string): Promise<UserData | null> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/Users!A:W`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    const rows = data.values;
    
    if (!rows || rows.length < 2) return null;

    // Find user by wallet address (Column L = index 11)
    const userRow = rows.find((row: string[]) => 
      row[11]?.toLowerCase() === walletAddress.toLowerCase()
    );
    
    if (!userRow) return null;

    return {
      telegram_id: userRow[1] || '',
      telegram_username: userRow[0] || '',
      farcaster_username: userRow[2] || '',
      farcaster_fid: userRow[3] || '',
      base_username: userRow[11] || '',
      stars: parseInt(userRow[8] || '0'),
      defaults: parseInt(userRow[9] || '0'),
      btribe_balance: parseInt(userRow[10] || '0'),
      jesse_balance: parseInt(userRow[21] || '0'),
      status: userRow[13] || '',
      session_streak: parseInt(userRow[4] || '0'),
      followers: parseInt(userRow[20] || '0'),
      profile_image: '',
      wallet_address: userRow[11] || '',
    };
  } catch (error) {
    console.error('Error fetching user by wallet:', error);
    return null;
  }
}

// ============================================
// ACTIVITY FEED DATA FETCHING
// ============================================

export interface ActivityFeedItem {
  // Engagement data from Engagements sheet
  session_date: string;
  timestamp: string;
  session_time: string;
  session_index: string;
  telegram_id: string;
  telegram_username: string;
  farcaster_username: string;
  cast_hash: string;
  link: string;
  status: string;
  checked_at: string;
  
  // User metadata from Members sheet
  farcaster_fid: string;
  stars: number;
  defaults: number;
  streak_count: number;
  btribe_balance: number;
  ban_status: string;
  probation_count: number;
  pfp_url?: string;
}

/**
 * Fetch all activity feed items from Engagements sheet
 * Joins with user data from Users sheet for full metadata
 */
export async function fetchActivityFeed(limit: number = 50): Promise<ActivityFeedItem[]> {
  try {
    console.log('📥 Fetching activity feed data...');
    
    // Fetch engagements data
    const engagementsResponse = await fetch(
      `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Engagements`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
        },
        mode: 'cors',
        cache: 'no-cache'
      }
    );

    if (!engagementsResponse.ok) {
      throw new Error(`HTTP error! status: ${engagementsResponse.status}`);
    }

    const engagementsText = await engagementsResponse.text();
    const engagementsJsonText = engagementsText.substring(47, engagementsText.length - 2);
    const engagementsData = JSON.parse(engagementsJsonText);

    // Fetch users data for joining
    const usersResponse = await fetch(
      `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Users`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
        },
        mode: 'cors',
        cache: 'no-cache'
      }
    );

    const usersText = await usersResponse.text();
    const usersJsonText = usersText.substring(47, usersText.length - 2);
    const usersData = JSON.parse(usersJsonText);

    // Create a map of farcaster_username -> user data for quick lookup
    const usersMap = new Map<string, any>();
    usersData.table.rows.forEach((row: any) => {
      const username = row.c[2]?.v; // Column C: farcaster_username
      if (username) {
        usersMap.set(username, row);
      }
    });

    // Process engagement rows and join with user data
    const activityItems: ActivityFeedItem[] = [];
    const rows = engagementsData.table.rows || [];

    for (const row of rows.slice(-limit).reverse()) { // Get last N items, newest first
      const farcasterUsername = row.c[6]?.v || ''; // Column G: farcaster_username
      
      // Skip if username is empty or is the header row
      if (!farcasterUsername || farcasterUsername === 'farcaster_username') {
        continue;
      }
      
      const userRow = usersMap.get(farcasterUsername);

      if (!userRow) {
        console.warn(`⚠️ User not found for username: ${farcasterUsername}`);
        continue;
      }

      const activityItem: ActivityFeedItem = {
        // Engagement data
        session_date: row.c[0]?.v || '', // Column A
        timestamp: row.c[1]?.v || '', // Column B
        session_time: row.c[2]?.v || '', // Column C
        session_index: row.c[3]?.v || '', // Column D
        telegram_id: row.c[4]?.v || '', // Column E
        telegram_username: row.c[5]?.v || '', // Column F
        farcaster_username: farcasterUsername, // Column G
        cast_hash: row.c[7]?.v || '', // Column H
        link: row.c[8]?.v || '', // Column I
        status: row.c[9]?.v || '', // Column J
        checked_at: row.c[10]?.v || '', // Column K
        
        // User metadata
        farcaster_fid: String(userRow.c[3]?.v || ''), // Column D in Users
        stars: parseInt(userRow.c[8]?.v) || 0, // Column I in Users
        defaults: parseInt(userRow.c[9]?.v) || 0, // Column J in Users
        streak_count: parseInt(userRow.c[4]?.v) || 0, // Column E in Users (session_streak)
        btribe_balance: parseFloat(userRow.c[10]?.v) || 0, // Column K in Users
        ban_status: userRow.c[7]?.v || 'none', // Column H in Users
        probation_count: parseInt(userRow.c[14]?.v) || 0, // Column O in Users
      };

      activityItems.push(activityItem);
    }

    console.log(`✅ Fetched ${activityItems.length} activity feed items`);
    return activityItems;
  } catch (error) {
    console.error('❌ Error fetching activity feed:', error);
    return [];
  }
}