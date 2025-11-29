// Type definitions for BaseTribe app

/**
 * User Data Structure - matches Google Sheets "Users" tab columns
 */
export interface UserData {
  // Column A - Telegram Username
  telegram_username: string;
  
  // Column B - Telegram ID
  telegram_id: string;
  
  // Column C - Farcaster Username
  farcaster_username: string;
  
  // Column D - Farcaster FID (PRIMARY KEY)
  farcaster_fid: string;
  
  // Column E - Session Streak
  session_streak: number;
  
  // Column F - Last Engaged Date
  last_engaged_date: string;
  
  // Column G - Fail Count
  fail_count: number;
  
  // Column H - Ban Status
  ban_status: string;
  
  // Column I - Stars
  stars: number;
  
  // Column J - Defaults
  defaults: number;
  
  // Column K - $BTRIBE Balance (MAIN BALANCE)
  btribe_balance: number;
  
  // Column L - Base Username
  base_username: string;
  
  // Column M - Email
  email: string;
  
  // Column N - Status (Membership Status)
  status: string;
  
  // Column O - Probation Count
  probation_count: number;
  
  // Column P - Invite Link
  invite_link: string;
  
  // Column Q - Invites Count
  invites_count: number;
  
  // Column R - USDC Claims
  usdc_claims: number;
  
  // Column S - Premium Status
  premium: boolean;
  
  // Column T - Shoutouts Left
  shoutouts_left: number;
  
  // Column U - Followers
  followers: number;
  
  // Column V - $JESSE Balance (SECONDARY BALANCE)
  jesse_balance: number;
  
  // Column W - Membership NFT
  membership_nft: string;
  
  // Column X - Completed Tasks (comma-separated task IDs)
  completed_tasks: string;
  
  // Column Y - Booster Balance
  booster: number;
  
  // Additional computed fields
  wallet_address?: string;
  profile_image?: string;
}

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
  farcaster_fid: string;
  farcaster_username: string;
  stars: number;
  defaults: number;
  btribe_balance: number;
  invites_count: number;
  usdc_claims: number;
  profile_image?: string;
  display_name?: string;
  rank?: number;
}

/**
 * Engagement Data from Engagements sheet
 * Matches the column structure: session_date | timestamp | session_time | session_index | 
 * telegram_id | telegram_username | farcaster_username | cast_hash | link | status | checked_at
 */
export interface EngagementData {
  session_date: string;      // Column A
  timestamp: string;          // Column B
  session_time: string;       // Column C
  session_index: string;      // Column D
  telegram_id: string;        // Column E
  telegram_username: string;  // Column F
  farcaster_username: string; // Column G
  cast_hash: string;          // Column H
  link: string;               // Column I
  status: string;             // Column J
  checked_at: string;         // Column K
}

/**
 * Raid Data from BASERAID sheet
 */
export interface RaidData {
  raidTitle: string;
  raidDescription: string;
  raidLink: string;
  raidDate: string;
  raidTime: string;
  raidReward: string;
  raidStatus: string;
}

/**
 * Farcaster Profile from Neynar API
 */
export interface FarcasterProfile {
  pfpUrl: string;
  displayName: string;
  username: string;
  fid: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
}

/**
 * Session Information
 */
export interface SessionInfo {
  time: string;
  rule: string;
  isActive: boolean;
  nextSession: string;
  timeRemaining: string;
}

/**
 * NFT Claim Status
 */
export interface NFTClaimStatus {
  believer: boolean;
  founder: boolean;
  believer_tx?: string;
  founder_tx?: string;
}

/**
 * Transaction Result
 */
export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  message?: string;
}

/**
 * Balance Update Payload
 */
export interface BalanceUpdatePayload {
  fid: string;
  walletAddress: string;
  btribe_balance?: number;
  jesse_balance?: number;
  timestamp: string;
}