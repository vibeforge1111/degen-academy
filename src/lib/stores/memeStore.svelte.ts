// Meme Coin Simulator Store - "Pump or Dump"
import type { MemeToken, MemeGameState, MemeGameStats, SocialPost, MemeEventType } from '../../types/meme';
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
  MAX_POSTS_DISPLAYED: 5,          // Max posts in feed (compact)
  STARTING_PRICE: 0.000001,        // Starting price for new tokens
  BASE_VOLATILITY: 0.025,          // Base price volatility per tick
  RUG_BASE_PROBABILITY: 0.015,     // Base rug chance per check
  RUG_PROBABILITY_INCREASE: 0.003, // Rug chance increases over time
  MOON_THRESHOLD: 10,              // 10x = moon
  MIN_BUY_AMOUNT: 100,             // Minimum buy in $
  SLIPPAGE: 0.02,                  // 2% slippage on buys
  NUM_TOKENS: 5,                   // Number of tokens to generate
};

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

function createToken(): MemeToken {
  const { name, ticker, emoji } = generateTokenName();
  const supplyOptions = [100_000_000, 420_690_000, 1_000_000_000, 6_900_000_000, 10_000_000_000];
  const totalSupply = supplyOptions[Math.floor(Math.random() * supplyOptions.length)];
  // Randomize starting price a bit
  const priceMultiplier = 0.5 + Math.random() * 2;
  const startPrice = MEME_CONSTANTS.STARTING_PRICE * priceMultiplier;
  return {
    name,
    ticker,
    emoji,
    startPrice,
    currentPrice: startPrice,
    priceHistory: [startPrice],
    launchTime: Date.now() - Math.floor(Math.random() * 60000), // Random launch time in past minute
    totalSupply,
  };
}

function createInitialTokens(): MemeToken[] {
  return Array.from({ length: MEME_CONSTANTS.NUM_TOKENS }, () => createToken());
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
// PRICE SIMULATION - ALL TOKENS
// ============================================

function tickAllPrices() {
  if (!store.isPlaying) return;

  store.tokens.forEach((token, index) => {
    // Each token has its own volatility based on age and randomness
    const age = (Date.now() - token.launchTime) / 1000;
    const volatility = MEME_CONSTANTS.BASE_VOLATILITY * (1 + Math.random() * 0.5);

    // Random walk with slight bias
    const bias = Math.random() < 0.52 ? 1 : -1; // Slight upward bias
    const randomChange = (Math.random() * volatility) * bias;
    const newPrice = token.currentPrice * (1 + randomChange);

    // Clamp price
    token.currentPrice = Math.max(newPrice, token.startPrice * 0.01);

    // Add to history (keep last 60 points for smoother chart)
    token.priceHistory.push(token.currentPrice);
    if (token.priceHistory.length > 60) {
      token.priceHistory.shift();
    }

    // Check for rug (random chance increases with age)
    const rugChance = MEME_CONSTANTS.RUG_BASE_PROBABILITY + (age / 1000) * MEME_CONSTANTS.RUG_PROBABILITY_INCREASE;
    if (Math.random() < rugChance * 0.1) { // Much lower chance per tick
      // Only rug if price went up significantly
      const change = ((token.currentPrice - token.startPrice) / token.startPrice) * 100;
      if (change > 100 && Math.random() < 0.3) {
        executeRug(index);
      }
    }
  });

  // Update player PnL
  updatePlayerPnL();
}

function executeRug(tokenIndex: number) {
  const token = store.tokens[tokenIndex];

  // Massive price crash
  token.currentPrice = token.startPrice * 0.02;
  token.priceHistory.push(token.currentPrice);

  // Add rug post
  addPost('rug_pull', `🚨 ${token.ticker} RUGGED! Dev dumped everything! 💀`);

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
  setTimeout(() => {
    if (store.isPlaying) {
      store.tokens[tokenIndex] = createToken();
      addPost('organic_pump', `New token ${store.tokens[tokenIndex].ticker} just launched! ${store.tokens[tokenIndex].emoji}`);
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
  const multiplier = 1 + (impact / 100);
  token.currentPrice = Math.max(token.currentPrice * multiplier, token.startPrice * 0.001);
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
