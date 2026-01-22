// Types for Pump or Dump meme coin simulator

export interface MemeToken {
  name: string;
  ticker: string;
  emoji: string;
  startPrice: number;
  currentPrice: number;
  priceHistory: number[];
  launchTime: number;
}

export interface SocialPost {
  id: string;
  author: SocialAuthor;
  content: string;
  timestamp: number;
  eventType: MemeEventType;
  priceImpact: number; // -1 to 1, how much it affects price
}

export interface SocialAuthor {
  name: string;
  handle: string;
  avatar: string;
  type: AuthorType;
  followers: string; // "1.2M", "50K", etc.
  verified: boolean;
}

export type AuthorType =
  | 'kol'           // Crypto influencer
  | 'whale'         // Big money player
  | 'dev'           // Project developer
  | 'anon'          // Anonymous trader
  | 'newbie'        // New to crypto
  | 'bot'           // Trading bot
  | 'news'          // News outlet
  | 'celebrity'     // Famous person
  | 'exchange'      // CEX/DEX
  | 'analyst'       // Chart analyst
  | 'fudder'        // Professional FUD spreader
  | 'scammer';      // Scam account

export type MemeEventType =
  | 'whale_buy'
  | 'whale_dump'
  | 'kol_shill'
  | 'kol_fud'
  | 'dev_update'
  | 'dev_rug_signal'
  | 'exchange_listing'
  | 'exchange_delisting'
  | 'celebrity_mention'
  | 'celebrity_dump'
  | 'hack_rumor'
  | 'partnership'
  | 'airdrop_rumor'
  | 'liquidity_add'
  | 'liquidity_remove'
  | 'team_doxx'
  | 'competitor_fud'
  | 'regulatory_fud'
  | 'organic_pump'
  | 'organic_dump'
  | 'bot_activity'
  | 'newbie_fomo'
  | 'diamond_hands'
  | 'paper_hands'
  | 'black_swan'
  | 'rug_pull';

export interface MemeGameState {
  token: MemeToken;
  posts: SocialPost[];
  playerPosition: number;      // $ amount invested
  playerEntryPrice: number;    // Average entry price
  playerPnL: number;           // Current profit/loss
  gamePhase: 'pregame' | 'live' | 'rugged' | 'mooned' | 'exited';
  timeRemaining: number;       // Seconds until potential rug
  rugProbability: number;      // 0-100, increases over time
  volatility: number;          // Current market volatility
}

export interface MemeGameStats {
  gamesPlayed: number;
  totalProfit: number;
  totalLoss: number;
  bestTrade: number;
  worstTrade: number;
  rugsEscaped: number;
  gotRugged: number;
  moonshots: number;
}
