// Core game types for DEGEN ACADEMY
// Competitive Economy v2.0

export type RiskLevel = 'safe' | 'medium' | 'degen';

export interface Pool {
  id: string;
  name: string;
  emoji: string;
  logo: string;
  apy: number;
  riskLevel: RiskLevel;
  deposited: number;
  isRugged: boolean;
  hasAudit: boolean;      // Pool-specific audit shield
  isLeveraged: boolean;   // 2x yields AND 2x loss
  isPumping: boolean;
  pumpEndTime: number | null;
}

export interface Items {
  // Insurance is now time-based with cooldown
  insuranceActive: boolean;
  insuranceEndTime: number | null;
  insuranceCooldownEnd: number | null;

  // Hedge mode is a toggle
  hedgeMode: boolean;
}

export interface GameStats {
  rugsEaten: number;
  highestPortfolio: number;
  gamesPlayed: number;
  totalTimePlayed: number;
  fastestWin: number | null;
  // New competitive stats
  auditsUsed: number;
  insurancesUsed: number;
  leveragedWins: number;
}

export interface CurrentRun {
  startTime: number;
  elapsed: number;
  halvingCount: number;
}

export interface GameState {
  portfolio: number;
  pools: Pool[];
  items: Items;
  halvingMultiplier: number;
  gasMultiplier: number;
  gasEndTime: number | null;
  whaleEndTime: number | null;
  isGameOver: boolean;
  isVictory: boolean;
  currentRun: CurrentRun;
  stats: GameStats;
}

export type EventType = 'rug' | 'exploit' | 'whale' | 'gas' | 'pump';

export interface GameEvent {
  id: string;
  type: EventType;
  targetPoolId: string | null;
  magnitude: number;
  timestamp: number;
  blocked: boolean;
  message: string;
}

export interface SaveData {
  version: number;
  portfolio: number;
  pools: Pool[];
  items: Items;
  stats: GameStats;
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface PoolConfig {
  id: string;
  name: string;
  emoji: string;
  logo: string;
  apy: number;
  riskLevel: RiskLevel;
}
