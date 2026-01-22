// Meme Coin Simulator Store - "Pump or Dump"
import type { MemeToken, MemeGameState, MemeGameStats, SocialPost, MemeEventType, MarketCapTier } from '../../types/meme';
import {
  generateTokenName,
  getRandomAuthor,
  getRandomMessage,
  getRandomPriceImpact,
  EVENT_CONFIGS,
  type EventConfig
} from '../../data/meme-events';
import { portfolio, addToPortfolio, deductFromPortfolio } from './gameStore.svelte';

// ============================================
// GAME CONSTANTS
// ============================================

const MEME_CONSTANTS = {
  TICK_INTERVAL_MS: 500,           // Price updates every 500ms
  EVENT_CHECK_INTERVAL_MS: 2500,   // Check for events every 2.5s
  MAX_POSTS_DISPLAYED: 15,         // Max posts in feed (more for scrolling)
  MOON_THRESHOLD: 10,              // 10x = moon
  MIN_BUY_AMOUNT: 100,             // Minimum buy in $
  SLIPPAGE: 0.02,                  // 2% slippage on buys
  NUM_TOKENS: 7,                   // Number of tokens to generate
};

// ============================================
// MARKET CAP TIER SYSTEM
// ============================================
// Micro caps: Ultra volatile, high rug risk, can 10x or -99% fast
// Small caps: Very volatile, moderate rug risk, good pump potential
// Mid caps: Moderate volatility, lower rug risk, steadier growth
// Large caps: Low volatility, rare rugs, slower but safer

interface TierConfig {
  // Market cap range
  minMarketCap: number;
  maxMarketCap: number;
  // Supply range
  supplyOptions: number[];
  // Volatility (multiplier on base)
  volatility: number;
  // Bias - positive = more likely to pump, negative = more likely to dump
  bias: number;
  // Rug probability multiplier
  rugMultiplier: number;
  // Min price gain before rug is possible (%)
  rugThreshold: number;
  // Event impact multiplier (how much events affect price)
  eventImpact: number;
  // Color for UI
  color: string;
  label: string;
}

const TIER_CONFIGS: Record<MarketCapTier, TierConfig> = {
  micro: {
    minMarketCap: 1_000,           // $1K
    maxMarketCap: 50_000,          // $50K
    supplyOptions: [100_000_000, 420_690_000, 1_000_000_000],
    volatility: 0.06,              // 6% swings per tick - WILD
    bias: 0.48,                    // Slightly more dumps than pumps
    rugMultiplier: 3.0,            // 3x more likely to rug
    rugThreshold: 50,              // Can rug after 50% gain
    eventImpact: 2.5,              // Events hit HARD
    color: '#ef4444',              // Red - danger
    label: 'MICRO',
  },
  small: {
    minMarketCap: 50_000,          // $50K
    maxMarketCap: 500_000,         // $500K
    supplyOptions: [420_690_000, 1_000_000_000, 6_900_000_000],
    volatility: 0.04,              // 4% swings - still spicy
    bias: 0.50,                    // Neutral
    rugMultiplier: 1.5,            // 1.5x rug chance
    rugThreshold: 100,             // Need 2x before rug possible
    eventImpact: 1.5,              // Events have good impact
    color: '#f59e0b',              // Orange - caution
    label: 'SMALL',
  },
  mid: {
    minMarketCap: 500_000,         // $500K
    maxMarketCap: 5_000_000,       // $5M
    supplyOptions: [1_000_000_000, 6_900_000_000, 10_000_000_000],
    volatility: 0.025,             // 2.5% - moderate
    bias: 0.52,                    // Slight upward trend
    rugMultiplier: 0.5,            // Half rug chance
    rugThreshold: 200,             // Need 3x before rug possible
    eventImpact: 1.0,              // Normal event impact
    color: '#3b82f6',              // Blue - moderate risk
    label: 'MID',
  },
  large: {
    minMarketCap: 5_000_000,       // $5M
    maxMarketCap: 100_000_000,     // $100M
    supplyOptions: [6_900_000_000, 10_000_000_000, 69_000_000_000],
    volatility: 0.012,             // 1.2% - more stable
    bias: 0.54,                    // More reliable upward
    rugMultiplier: 0.15,           // Very rare rugs
    rugThreshold: 300,             // Need 4x before rug
    eventImpact: 0.6,              // Events have muted impact
    color: '#22c55e',              // Green - "safer"
    label: 'LARGE',
  },
};

// Distribution of tiers for the 7 tokens
// 2 micro, 2 small, 2 mid, 1 large (always have one "safer" option)
const TIER_DISTRIBUTION: MarketCapTier[] = ['micro', 'micro', 'small', 'small', 'mid', 'mid', 'large'];

// ============================================
// STATE
// ============================================

interface MemeStore {
  tokens: MemeToken[];
  selectedIndex: number;
  posts: SocialPost[];
  playerPosition: number;
  playerCostBasis: number;
  playerEntryPrice: number;
  playerPnL: number;
  tradingTokenIndex: number | null; // Which token the player has a position in
  isPlaying: boolean;
  stats: MemeGameStats;
}

const initialStats: MemeGameStats = {
  gamesPlayed: 0,
  totalProfit: 0,
  totalLoss: 0,
  bestTrade: 0,
  worstTrade: 0,
  rugsEscaped: 0,
  gotRugged: 0,
  moonshots: 0,
};

function createToken(tier: MarketCapTier): MemeToken {
  const { name, ticker, emoji } = generateTokenName();
  const config = TIER_CONFIGS[tier];

  // Get supply from tier-appropriate options
  const totalSupply = config.supplyOptions[Math.floor(Math.random() * config.supplyOptions.length)];

  // Calculate starting price based on market cap target
  // Market cap = price * supply, so price = market cap / supply
  const targetMarketCap = config.minMarketCap + Math.random() * (config.maxMarketCap - config.minMarketCap);
  const startPrice = targetMarketCap / totalSupply;

  return {
    name,
    ticker,
    emoji,
    startPrice,
    currentPrice: startPrice,
    priceHistory: [startPrice],
    launchTime: Date.now() - Math.floor(Math.random() * 60000), // Random launch time in past minute
    totalSupply,
    tier,
  };
}

function createInitialTokens(): MemeToken[] {
  // Shuffle the tier distribution for variety
  const shuffledTiers = [...TIER_DISTRIBUTION].sort(() => Math.random() - 0.5);
  return shuffledTiers.map(tier => createToken(tier));
}

// Export tier config for UI use
export function getTierConfig(tier: MarketCapTier): TierConfig {
  return TIER_CONFIGS[tier];
}

let store = $state<MemeStore>({
  tokens: createInitialTokens(),
  selectedIndex: 0,
  posts: [],
  playerPosition: 0,
  playerCostBasis: 0,
  playerEntryPrice: 0,
  playerPnL: 0,
  tradingTokenIndex: null,
  isPlaying: false,
  stats: initialStats,
});

// ============================================
// INTERVALS
// ============================================

let priceInterval: number | null = null;
let eventInterval: number | null = null;

// ============================================
// EXPORTED REACTIVE STATE
// ============================================

export const allTokens = {
  get value() { return store.tokens; }
};

export const selectedTokenIndex = {
  get value() { return store.selectedIndex; }
};

export const currentToken = {
  get value() { return store.tokens[store.selectedIndex]; }
};

export const socialPosts = {
  get value() { return store.posts; }
};

export const playerPosition = {
  get value() { return store.playerPosition; }
};

export const playerPnL = {
  get value() { return store.playerPnL; }
};

export const tradingTokenIndex = {
  get value() { return store.tradingTokenIndex; }
};

export const isMemePlaying = {
  get value() { return store.isPlaying; }
};

export const memeStats = {
  get value() { return store.stats; }
};

// Derived from selected token
export const priceHistory = {
  get value() { return store.tokens[store.selectedIndex]?.priceHistory || []; }
};

export const currentPrice = {
  get value() { return store.tokens[store.selectedIndex]?.currentPrice || 0; }
};

export const priceChange = {
  get value() {
    const token = store.tokens[store.selectedIndex];
    if (!token) return 0;
    return ((token.currentPrice - token.startPrice) / token.startPrice) * 100;
  }
};

// ============================================
// TOKEN SELECTION
// ============================================

export function selectToken(index: number) {
  if (index >= 0 && index < store.tokens.length) {
    store.selectedIndex = index;
  }
}

// ============================================
// GAME ACTIONS
// ============================================

export function startMemeGame() {
  if (store.isPlaying) return;

  // Generate fresh tokens
  store.tokens = createInitialTokens();
  store.selectedIndex = 0;
  store.posts = [];
  store.playerPosition = 0;
  store.playerCostBasis = 0;
  store.playerEntryPrice = 0;
  store.playerPnL = 0;
  store.tradingTokenIndex = null;
  store.isPlaying = true;

  // Add initial posts
  store.tokens.forEach((token, i) => {
    setTimeout(() => {
      addPost('organic_pump', `${token.ticker} just launched! ${token.emoji} LFG!`);
    }, i * 300);
  });

  startIntervals();
}

export function stopMemeGame() {
  stopIntervals();

  // If player has position, sell it first
  if (store.playerPosition > 0 && store.tradingTokenIndex !== null) {
    sellAll();
  }

  store.isPlaying = false;
}

function startIntervals() {
  // Price tick - update ALL tokens
  priceInterval = setInterval(() => {
    tickAllPrices();
  }, MEME_CONSTANTS.TICK_INTERVAL_MS) as unknown as number;

  // Event check
  eventInterval = setInterval(() => {
    checkForEvents();
  }, MEME_CONSTANTS.EVENT_CHECK_INTERVAL_MS) as unknown as number;
}

function stopIntervals() {
  if (priceInterval) clearInterval(priceInterval);
  if (eventInterval) clearInterval(eventInterval);
  priceInterval = null;
  eventInterval = null;
}

// ============================================
// PRICE SIMULATION - ALL TOKENS (TIER-BASED)
// ============================================

const BASE_RUG_CHANCE = 0.008; // 0.8% base chance per tick check

function tickAllPrices() {
  if (!store.isPlaying) return;

  store.tokens.forEach((token, index) => {
    const config = TIER_CONFIGS[token.tier];
    const age = (Date.now() - token.launchTime) / 1000;

    // Tier-based volatility with some randomness
    const volatility = config.volatility * (0.8 + Math.random() * 0.4);

    // Tier-based bias (micro caps dump more, large caps pump more)
    const direction = Math.random() < config.bias ? 1 : -1;

    // Random walk
    const randomChange = (Math.random() * volatility) * direction;
    let newPrice = token.currentPrice * (1 + randomChange);

    // Occasional momentum spikes for micro/small caps
    if ((token.tier === 'micro' || token.tier === 'small') && Math.random() < 0.03) {
      const spikeDir = Math.random() < 0.5 ? 1 : -1;
      const spikeMagnitude = token.tier === 'micro' ? 0.15 : 0.08; // 15% or 8% spike
      newPrice *= (1 + spikeMagnitude * spikeDir);
    }

    // Clamp price (micro can go lower before floor)
    const floorMultiplier = token.tier === 'micro' ? 0.001 : token.tier === 'small' ? 0.005 : 0.01;
    token.currentPrice = Math.max(newPrice, token.startPrice * floorMultiplier);

    // Add to history (keep last 60 points for smoother chart)
    token.priceHistory.push(token.currentPrice);
    if (token.priceHistory.length > 60) {
      token.priceHistory.shift();
    }

    // TIER-BASED RUG LOGIC
    // Micro caps rug fast and often, large caps rarely rug
    const priceChange = ((token.currentPrice - token.startPrice) / token.startPrice) * 100;

    // Only check for rug if above tier's threshold
    if (priceChange > config.rugThreshold) {
      // Base chance * tier multiplier * age factor
      const ageFactor = 1 + (age / 300); // Increases over 5 minutes
      const rugChance = BASE_RUG_CHANCE * config.rugMultiplier * ageFactor;

      if (Math.random() < rugChance) {
        // Higher price = more likely to actually rug (devs take profit)
        const profitFactor = Math.min(priceChange / 200, 1); // Max at 200% gain
        if (Math.random() < 0.3 + profitFactor * 0.5) {
          executeRug(index);
        }
      }
    }
  });

  // Update player PnL
  updatePlayerPnL();
}

function executeRug(tokenIndex: number) {
  const token = store.tokens[tokenIndex];
  const config = TIER_CONFIGS[token.tier];

  // Massive price crash - micro caps go to near zero, larger caps retain some value
  const crashMultiplier = token.tier === 'micro' ? 0.005 : token.tier === 'small' ? 0.02 : 0.05;
  token.currentPrice = token.startPrice * crashMultiplier;
  token.priceHistory.push(token.currentPrice);

  // Tier-appropriate rug message
  const rugMessages: Record<MarketCapTier, string> = {
    micro: `🚨 ${token.ticker} RUGGED! Dev vanished with the liquidity! 💀`,
    small: `🚨 ${token.ticker} got rugged! Team dumped their bags! 📉💀`,
    mid: `🚨 ${token.ticker} massive dump! Insider selling detected! 🚨`,
    large: `⚠️ ${token.ticker} whale exit! Price crashing hard! 📉`,
  };
  addPost('rug_pull', rugMessages[token.tier]);

  // If player was in this token, they got rugged
  if (store.tradingTokenIndex === tokenIndex && store.playerPosition > 0) {
    store.stats.gotRugged++;
    const loss = store.playerCostBasis;
    store.stats.totalLoss += loss;
    store.playerPnL = -loss;
    store.playerPosition = 0;
    store.playerCostBasis = 0;
    store.playerEntryPrice = 0;
    store.tradingTokenIndex = null;
  }

  // Replace the rugged token with a new one after a delay
  // Keep the same tier slot for balance
  setTimeout(() => {
    if (store.isPlaying) {
      store.tokens[tokenIndex] = createToken(token.tier);
      const newToken = store.tokens[tokenIndex];
      const tierLabel = TIER_CONFIGS[newToken.tier].label;
      addPost('organic_pump', `New ${tierLabel} cap ${newToken.ticker} just launched! ${newToken.emoji} LFG!`);
    }
  }, 3000);
}

function updatePlayerPnL() {
  if (store.playerPosition <= 0 || store.tradingTokenIndex === null) {
    store.playerPnL = 0;
    return;
  }

  const token = store.tokens[store.tradingTokenIndex];
  if (!token) return;

  const currentValue = (store.playerPosition / store.playerEntryPrice) * token.currentPrice;
  store.playerPnL = currentValue - store.playerCostBasis;
}

// ============================================
// EVENT SYSTEM
// ============================================

function checkForEvents() {
  if (!store.isPlaying) return;

  // Pick a random token for the event
  const tokenIndex = Math.floor(Math.random() * store.tokens.length);
  const token = store.tokens[tokenIndex];

  // Pick a random event
  const eventConfigs = EVENT_CONFIGS.filter(c => c.type !== 'rug_pull');
  const config = eventConfigs[Math.floor(Math.random() * eventConfigs.length)];

  if (Math.random() < config.probability * 2) {
    triggerEvent(config, tokenIndex);
  }
}

function triggerEvent(config: EventConfig, tokenIndex: number) {
  const token = store.tokens[tokenIndex];
  const { type, authorTypes } = config;

  // Get random author
  const authorType = authorTypes[Math.floor(Math.random() * authorTypes.length)];
  const author = getRandomAuthor(authorType);

  // Get message
  const message = getRandomMessage(type, token.ticker);

  // Add post
  addPostWithAuthor(type, message, author);

  // Apply price impact to this specific token
  const impact = getRandomPriceImpact(config);
  applyPriceImpact(tokenIndex, impact);
}

function applyPriceImpact(tokenIndex: number, impact: number) {
  const token = store.tokens[tokenIndex];
  const config = TIER_CONFIGS[token.tier];

  // Apply tier-based event impact multiplier
  // Micro caps swing wildly on news, large caps barely budge
  const adjustedImpact = impact * config.eventImpact;
  const multiplier = 1 + (adjustedImpact / 100);

  const floorMultiplier = token.tier === 'micro' ? 0.001 : token.tier === 'small' ? 0.005 : 0.01;
  token.currentPrice = Math.max(token.currentPrice * multiplier, token.startPrice * floorMultiplier);
  token.priceHistory.push(token.currentPrice);

  updatePlayerPnL();
}

function addPost(eventType: MemeEventType, content: string) {
  const authorType = EVENT_CONFIGS.find(c => c.type === eventType)?.authorTypes[0] || 'anon';
  const author = getRandomAuthor(authorType);
  addPostWithAuthor(eventType, content, author);
}

function addPostWithAuthor(eventType: MemeEventType, content: string, author: ReturnType<typeof getRandomAuthor>) {
  const post: SocialPost = {
    id: Math.random().toString(36).slice(2),
    author,
    content,
    timestamp: Date.now(),
    eventType,
    priceImpact: 0,
  };

  store.posts.unshift(post);

  if (store.posts.length > MEME_CONSTANTS.MAX_POSTS_DISPLAYED) {
    store.posts.pop();
  }
}

// ============================================
// PLAYER ACTIONS
// ============================================

export function buyToken(amount: number) {
  if (!store.isPlaying) return;
  if (amount < MEME_CONSTANTS.MIN_BUY_AMOUNT) return;

  const mainPortfolio = portfolio.value;
  if (mainPortfolio < amount) return;

  // Can only hold one token at a time for simplicity
  if (store.tradingTokenIndex !== null && store.tradingTokenIndex !== store.selectedIndex) {
    // Already holding a different token
    return;
  }

  const token = store.tokens[store.selectedIndex];

  // Apply slippage
  const slippageAmount = amount * MEME_CONSTANTS.SLIPPAGE;
  const effectiveAmount = amount - slippageAmount;

  // Deduct from portfolio
  if (!deductFromPortfolio(amount)) return;

  // Track cost basis
  store.playerCostBasis += amount;

  // Calculate average entry price
  if (store.playerPosition > 0) {
    const totalValue = store.playerPosition + effectiveAmount;
    const oldWeight = store.playerPosition / totalValue;
    const newWeight = effectiveAmount / totalValue;
    store.playerEntryPrice = (store.playerEntryPrice * oldWeight) + (token.currentPrice * newWeight);
  } else {
    store.playerEntryPrice = token.currentPrice;
  }

  store.playerPosition += effectiveAmount;
  store.tradingTokenIndex = store.selectedIndex;
  updatePlayerPnL();

  addPost('newbie_fomo', `Someone aped $${amount.toFixed(0)} into ${token.ticker}! 🦍`);
}

export function sellAll() {
  if (store.playerPosition <= 0 || store.tradingTokenIndex === null) return;

  const token = store.tokens[store.tradingTokenIndex];
  if (!token) return;

  const exitValue = (store.playerPosition / store.playerEntryPrice) * token.currentPrice;
  const profit = exitValue - store.playerCostBasis;

  // Add back to portfolio
  addToPortfolio(exitValue);

  // Update stats
  if (profit > 0) {
    store.stats.totalProfit += profit;
    if (profit > store.stats.bestTrade) store.stats.bestTrade = profit;
  } else {
    store.stats.totalLoss += Math.abs(profit);
    if (profit < store.stats.worstTrade) store.stats.worstTrade = profit;
  }

  const ticker = token.ticker;

  // Reset position
  store.playerPnL = profit;
  store.playerPosition = 0;
  store.playerCostBasis = 0;
  store.playerEntryPrice = 0;
  store.tradingTokenIndex = null;

  if (profit > 0) {
    addPost('diamond_hands', `Profit taken on ${ticker}! +$${profit.toFixed(0)} 💰`);
  } else {
    addPost('paper_hands', `Sold ${ticker} at loss: -$${Math.abs(profit).toFixed(0)} 📉`);
  }
}

// ============================================
// UTILITIES
// ============================================

export function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
}

export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function getChangeColor(change: number): string {
  if (change > 50) return '#4ade80';
  if (change > 0) return '#22c55e';
  if (change > -20) return '#f59e0b';
  return '#ef4444';
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(2)}B`;
  if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(2)}M`;
  if (cap >= 1_000) return `$${(cap / 1_000).toFixed(1)}K`;
  return `$${cap.toFixed(0)}`;
}
