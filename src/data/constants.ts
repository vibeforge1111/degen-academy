// Game balance constants for DEGEN ACADEMY
// Competitive Economy v2.0 - Multiple viable strategies

export const GAME_CONSTANTS = {
  // Starting conditions
  STARTING_PORTFOLIO: 10_000,
  WIN_PORTFOLIO: 1_000_000,

  // Yield speed multiplier - compresses a year into ~10 minutes of gameplay
  YIELD_SPEED_MULTIPLIER: 1000,

  // Halving
  HALVING_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes

  // RNG timing
  RNG_CHECK_INTERVAL_MS: 45_000, // Check every 45 seconds
  RNG_VARIANCE_MS: 15_000, // +/- 15 seconds randomness

  // Event probabilities (must sum to 100)
  EVENT_WEIGHTS: {
    rug: 15,
    exploit: 20,
    whale: 25,
    gas: 25,
    pump: 15,
  } as const,

  // Event effects
  EXPLOIT_DAMAGE: 0.5, // 50% of pool
  WHALE_YIELD_REDUCTION: 0.3, // -30% yields
  WHALE_DURATION_MS: 60_000,
  GAS_MULTIPLIER: 3,
  GAS_DURATION_MS: 30_000,
  PUMP_MULTIPLIER: 2,
  PUMP_DURATION_MS: 30_000,

  // ===========================================
  // COMPETITIVE ECONOMY v2.0
  // ===========================================

  // AUDIT SHIELD - Pool-specific protection
  // Cost: 10% of the pool's current value
  AUDIT_COST_PERCENT: 0.10, // 10% of pool value
  // Effect: Blocks next rug/exploit on that pool

  // INSURANCE POLICY - Global temporary protection
  // Cost: 5% of total portfolio
  INSURANCE_COST_PERCENT: 0.05, // 5% of portfolio
  INSURANCE_DURATION_MS: 60_000, // 60 seconds active
  INSURANCE_COOLDOWN_MS: 90_000, // 90 seconds before can buy again
  INSURANCE_DAMAGE_REDUCTION: 0.5, // Reduces ALL damage by 50%

  // HEDGE MODE - Toggle for safety
  // Cost: 2% of portfolio per tick while active
  HEDGE_COST_PERCENT_PER_TICK: 0.02, // 2% per second drain
  HEDGE_YIELD_REDUCTION: 0.5, // -50% yields while hedging
  // Effect: Immune to rug pulls while active

  // LEVERAGE - Double or nothing on one pool
  // Cost: Free, but 2x loss if rugged
  LEVERAGE_MULTIPLIER: 2, // 2x yields AND 2x loss
  // Limit: Only ONE pool can be leveraged at a time

  // ===========================================
  // PASSIVE BONUSES
  // ===========================================

  // Diversification Bonus - Rewards spreading risk
  DIVERSIFICATION_BONUS: {
    1: 1.0,   // 1 pool: no bonus
    2: 1.0,   // 2 pools: no bonus
    3: 1.1,   // 3 pools: +10%
    4: 1.15,  // 4 pools: +15%
    5: 1.2,   // 5 pools: +20%
    6: 1.25,  // 6 pools: +25%
  } as const,

  // Concentration Risk - Punishes all-in strategies
  CONCENTRATION_THRESHOLD_1: 0.5,  // >50% in one pool
  CONCENTRATION_PENALTY_1: 0.25,   // +25% rug chance on that pool
  CONCENTRATION_THRESHOLD_2: 0.75, // >75% in one pool
  CONCENTRATION_PENALTY_2: 0.5,    // +50% rug chance on that pool

  // ===========================================
  // DEPOSIT & UI
  // ===========================================

  MIN_DEPOSIT: 100,
  DEPOSIT_INCREMENT: 100,
  YIELD_TICK_MS: 1000, // Update yields every second
} as const;

// Colors for UI
export const COLORS = {
  primary: 0x8B5CF6,
  secondary: 0xF59E0B,
  accent: 0x06B6D4,
  success: 0x10B981,
  danger: 0xEF4444,
  warning: 0xF59E0B,
  bgPrimary: 0x0F0F1A,
  bgSecondary: 0x1A1A2E,
  surface: 0x1E1E32,
  textPrimary: 0xFFFFFF,
  textSecondary: 0xA1A1AA,
} as const;
