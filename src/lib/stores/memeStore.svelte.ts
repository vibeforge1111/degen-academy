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
  EVENT_CHECK_INTERVAL_MS: 1500,   // Check for events every 1.5s
  BASE_GAME_DURATION: 90,          // Base game length in seconds
  MAX_POSTS_DISPLAYED: 8,          // Max posts in feed
  STARTING_PRICE: 0.000001,        // Starting price for new tokens
  BASE_VOLATILITY: 0.02,           // Base price volatility per tick
  RUG_BASE_PROBABILITY: 0.02,      // Base rug chance per check
  RUG_PROBABILITY_INCREASE: 0.005, // Rug chance increases over time
  MOON_THRESHOLD: 10,              // 10x = moon
  MIN_BUY_AMOUNT: 100,             // Minimum buy in $
  SLIPPAGE: 0.02,                  // 2% slippage on buys
};

// ============================================
// STATE
// ============================================

interface MemeStore {
  game: MemeGameState;
  stats: MemeGameStats;
  isPlaying: boolean;
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

function createInitialToken(): MemeToken {
  const { name, ticker, emoji } = generateTokenName();
  return {
    name,
    ticker,
    emoji,
    startPrice: MEME_CONSTANTS.STARTING_PRICE,
    currentPrice: MEME_CONSTANTS.STARTING_PRICE,
    priceHistory: [MEME_CONSTANTS.STARTING_PRICE],
    launchTime: Date.now(),
  };
}

function createInitialGameState(): MemeGameState {
  return {
    token: createInitialToken(),
    posts: [],
    playerPosition: 0,
    playerCostBasis: 0,
    playerEntryPrice: 0,
    playerPnL: 0,
    gamePhase: 'pregame',
    timeRemaining: MEME_CONSTANTS.BASE_GAME_DURATION,
    rugProbability: MEME_CONSTANTS.RUG_BASE_PROBABILITY * 100,
    volatility: MEME_CONSTANTS.BASE_VOLATILITY,
  };
}

let store = $state<MemeStore>({
  game: createInitialGameState(),
  stats: initialStats,
  isPlaying: false,
});

// ============================================
// INTERVALS
// ============================================

let priceInterval: number | null = null;
let eventInterval: number | null = null;
let timerInterval: number | null = null;

// ============================================
// EXPORTED REACTIVE STATE
// ============================================

export const memeGame = {
  get value() { return store.game; }
};

export const memeStats = {
  get value() { return store.stats; }
};

export const isMemePlaying = {
  get value() { return store.isPlaying; }
};

export const currentToken = {
  get value() { return store.game.token; }
};

export const socialPosts = {
  get value() { return store.game.posts; }
};

export const playerPosition = {
  get value() { return store.game.playerPosition; }
};

export const playerPnL = {
  get value() { return store.game.playerPnL; }
};

export const priceHistory = {
  get value() { return store.game.token.priceHistory; }
};

export const currentPrice = {
  get value() { return store.game.token.currentPrice; }
};

export const priceChange = {
  get value() {
    const { startPrice, currentPrice } = store.game.token;
    return ((currentPrice - startPrice) / startPrice) * 100;
  }
};

export const gamePhase = {
  get value() { return store.game.gamePhase; }
};

export const timeRemaining = {
  get value() { return store.game.timeRemaining; }
};

export const rugProbability = {
  get value() { return store.game.rugProbability; }
};

// ============================================
// GAME ACTIONS
// ============================================

export function startMemeGame() {
  // Reset state
  store.game = createInitialGameState();
  store.game.gamePhase = 'live';
  store.isPlaying = true;

  // Add initial launch post
  addPost('organic_pump', 'New token just launched! ' + store.game.token.ticker + ' ' + store.game.token.emoji);

  // Start intervals
  startIntervals();
}

export function stopMemeGame() {
  stopIntervals();
  store.isPlaying = false;
}

function startIntervals() {
  // Price tick
  priceInterval = setInterval(() => {
    tickPrice();
  }, MEME_CONSTANTS.TICK_INTERVAL_MS) as unknown as number;

  // Event check
  eventInterval = setInterval(() => {
    checkForEvents();
  }, MEME_CONSTANTS.EVENT_CHECK_INTERVAL_MS) as unknown as number;

  // Timer - tracks how long you've been watching (no auto-end)
  timerInterval = setInterval(() => {
    store.game.timeRemaining--;

    // Increase rug probability over time - surprise rug!
    store.game.rugProbability += MEME_CONSTANTS.RUG_PROBABILITY_INCREASE;
  }, 1000) as unknown as number;
}

function stopIntervals() {
  if (priceInterval) clearInterval(priceInterval);
  if (eventInterval) clearInterval(eventInterval);
  if (timerInterval) clearInterval(timerInterval);
  priceInterval = null;
  eventInterval = null;
  timerInterval = null;
}

// ============================================
// PRICE SIMULATION
// ============================================

function tickPrice() {
  if (store.game.gamePhase !== 'live') return;

  const token = store.game.token;

  // Random walk with volatility
  const randomChange = (Math.random() - 0.48) * store.game.volatility; // Slight upward bias early
  const newPrice = token.currentPrice * (1 + randomChange);

  // Clamp price
  token.currentPrice = Math.max(newPrice, token.startPrice * 0.01);

  // Add to history (keep last 100 points)
  token.priceHistory.push(token.currentPrice);
  if (token.priceHistory.length > 100) {
    token.priceHistory.shift();
  }

  // Update player PnL
  updatePlayerPnL();

  // Check for moon (10x)
  if (token.currentPrice >= token.startPrice * MEME_CONSTANTS.MOON_THRESHOLD) {
    // Rare moon event!
    if (Math.random() < 0.3) { // 30% chance to actually moon
      endGame('mooned');
    }
  }
}

function applyPriceImpact(impact: number) {
  const token = store.game.token;
  const multiplier = 1 + (impact / 100);
  token.currentPrice = Math.max(token.currentPrice * multiplier, token.startPrice * 0.001);
  token.priceHistory.push(token.currentPrice);

  // Temporarily increase volatility after big events
  store.game.volatility = Math.min(store.game.volatility * 1.2, 0.15);
  setTimeout(() => {
    store.game.volatility = Math.max(store.game.volatility * 0.9, MEME_CONSTANTS.BASE_VOLATILITY);
  }, 3000);

  updatePlayerPnL();
}

function updatePlayerPnL() {
  if (store.game.playerPosition <= 0 || store.game.playerEntryPrice <= 0) {
    store.game.playerPnL = 0;
    return;
  }

  const currentValue = (store.game.playerPosition / store.game.playerEntryPrice) * store.game.token.currentPrice;
  // Use cost basis for accurate P&L (accounts for slippage)
  store.game.playerPnL = currentValue - store.game.playerCostBasis;
}

// ============================================
// EVENT SYSTEM
// ============================================

function checkForEvents() {
  if (store.game.gamePhase !== 'live') return;

  const gameTime = MEME_CONSTANTS.BASE_GAME_DURATION - store.game.timeRemaining;

  // Check each event type
  for (const config of EVENT_CONFIGS) {
    // Check timing constraints
    if (gameTime < config.minPhaseTime || gameTime > config.maxPhaseTime) continue;

    // Roll for event
    if (Math.random() < config.probability) {
      triggerEvent(config);
      return; // Only one event per check
    }
  }
}

function triggerEvent(config: EventConfig) {
  const { type, authorTypes } = config;

  // Special handling for rug pull
  if (type === 'rug_pull') {
    // Check if rug should happen based on probability
    if (Math.random() * 100 > store.game.rugProbability) return;

    executeRug();
    return;
  }

  // Get random author from valid types
  const authorType = authorTypes[Math.floor(Math.random() * authorTypes.length)];
  const author = getRandomAuthor(authorType);

  // Get message
  const message = getRandomMessage(type, store.game.token.ticker);

  // Add post
  addPostWithAuthor(type, message, author);

  // Apply price impact
  const impact = getRandomPriceImpact(config);
  applyPriceImpact(impact);
}

function executeRug() {
  const author = getRandomAuthor('dev');
  const message = getRandomMessage('rug_pull', store.game.token.ticker);
  addPostWithAuthor('rug_pull', message, author);

  // Massive price crash
  applyPriceImpact(-95);

  // End game
  setTimeout(() => {
    endGame('rugged');
  }, 1500);
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

  // Add to front
  store.game.posts.unshift(post);

  // Keep max posts
  if (store.game.posts.length > MEME_CONSTANTS.MAX_POSTS_DISPLAYED) {
    store.game.posts.pop();
  }
}

// ============================================
// PLAYER ACTIONS
// ============================================

export function buyToken(amount: number) {
  if (store.game.gamePhase !== 'live') return;
  if (amount < MEME_CONSTANTS.MIN_BUY_AMOUNT) return;

  // Check if player has enough in main portfolio
  const mainPortfolio = portfolio.value;
  if (mainPortfolio < amount) return;

  // Apply slippage
  const slippageAmount = amount * MEME_CONSTANTS.SLIPPAGE;
  const effectiveAmount = amount - slippageAmount;

  // Deduct from main portfolio (cash)
  if (!deductFromPortfolio(amount)) return;

  // Track cost basis (actual cash spent)
  store.game.playerCostBasis += amount;

  // Calculate average entry price
  if (store.game.playerPosition > 0) {
    const totalValue = store.game.playerPosition + effectiveAmount;
    const oldWeight = store.game.playerPosition / totalValue;
    const newWeight = effectiveAmount / totalValue;
    store.game.playerEntryPrice = (store.game.playerEntryPrice * oldWeight) + (store.game.token.currentPrice * newWeight);
  } else {
    store.game.playerEntryPrice = store.game.token.currentPrice;
  }

  store.game.playerPosition += effectiveAmount;
  updatePlayerPnL();

  // Add post about user buying
  addPost('newbie_fomo', `Someone just aped $${amount.toFixed(0)} into ${store.game.token.ticker}! 🦍`);
}

export function sellAll() {
  if (store.game.gamePhase !== 'live' && store.game.gamePhase !== 'rugged') return;
  if (store.game.playerPosition <= 0) return;

  const exitValue = (store.game.playerPosition / store.game.playerEntryPrice) * store.game.token.currentPrice;
  // Use cost basis for accurate profit (accounts for slippage)
  const profit = exitValue - store.game.playerCostBasis;

  // Add exit value back to main portfolio (cash)
  addToPortfolio(exitValue);

  // Update stats
  if (profit > 0) {
    store.stats.totalProfit += profit;
    if (profit > store.stats.bestTrade) store.stats.bestTrade = profit;
  } else {
    store.stats.totalLoss += Math.abs(profit);
    if (profit < store.stats.worstTrade) store.stats.worstTrade = profit;
  }

  // Reset position
  store.game.playerPnL = profit;
  store.game.playerPosition = 0;
  store.game.playerCostBasis = 0;
  store.game.playerEntryPrice = 0;

  // Add post
  if (profit > 0) {
    addPost('diamond_hands', `Someone just took profit! +$${profit.toFixed(0)} 💰`);
  } else {
    addPost('paper_hands', `Paper hands sold at a loss! -$${Math.abs(profit).toFixed(0)} 📉`);
  }

  // If game is still live, end it as exited
  if (store.game.gamePhase === 'live') {
    endGame('exited');
  }
}

export function sellPartial(percentage: number) {
  if (store.game.gamePhase !== 'live') return;
  if (store.game.playerPosition <= 0) return;
  if (percentage <= 0 || percentage > 100) return;

  const sellAmount = store.game.playerPosition * (percentage / 100);
  const sellValue = (sellAmount / store.game.playerEntryPrice) * store.game.token.currentPrice;
  // Use proportional cost basis for accurate profit
  const proportionalCostBasis = store.game.playerCostBasis * (percentage / 100);
  const profit = sellValue - proportionalCostBasis;

  // Add sell value back to main portfolio (cash)
  addToPortfolio(sellValue);

  // Update position and cost basis
  store.game.playerPosition -= sellAmount;
  store.game.playerCostBasis -= proportionalCostBasis;
  updatePlayerPnL();

  // Update stats
  if (profit > 0) {
    store.stats.totalProfit += profit;
  } else {
    store.stats.totalLoss += Math.abs(profit);
  }

  addPost('paper_hands', `Someone sold ${percentage}% of their ${store.game.token.ticker} bag`);
}

// ============================================
// GAME END
// ============================================

function endGame(result: 'rugged' | 'mooned' | 'exited') {
  stopIntervals();
  store.game.gamePhase = result;
  store.stats.gamesPlayed++;

  if (result === 'rugged') {
    if (store.game.playerPosition > 0) {
      // Player got rugged with position - lost their cost basis
      store.stats.gotRugged++;
      const loss = store.game.playerCostBasis; // Lost everything they put in
      store.stats.totalLoss += loss;
      store.game.playerPnL = -loss;
      // Reset position
      store.game.playerPosition = 0;
      store.game.playerCostBasis = 0;
      store.game.playerEntryPrice = 0;
    } else {
      // Escaped the rug!
      store.stats.rugsEscaped++;
    }
  } else if (result === 'mooned') {
    store.stats.moonshots++;
    // Auto-sell at moon
    if (store.game.playerPosition > 0) {
      sellAll();
    }
  }

  store.isPlaying = false;
}

export function playAgain() {
  store.game = createInitialGameState();
  startMemeGame();
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
  if (change > 50) return '#4ade80';  // Bright green
  if (change > 0) return '#22c55e';   // Green
  if (change > -20) return '#f59e0b'; // Yellow/orange
  return '#ef4444';                    // Red
}
