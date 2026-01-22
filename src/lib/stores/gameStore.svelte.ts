// Game Store - Svelte 5 Runes
// DEGEN ACADEMY - Competitive Economy v2.0

import { GAME_CONSTANTS } from '../../data/constants';
import { createInitialPools } from '../../data/pools';
import { getRandomQuote, type QuoteCategory } from '../../data/ralph-quotes';
import { saveManager } from '../../systems/SaveManager';
import type { GameState, Pool, EventType, GameEvent } from '../../types/game';

// Screen types
export type Screen = 'menu' | 'game' | 'death' | 'win';

// Ralph notification - replaces toasts, shows in Ralph section
type RalphNotification = {
  title: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
} | null;

// Create initial game state
function createInitialState(): GameState {
  const savedStats = saveManager.getStats();

  return {
    portfolio: GAME_CONSTANTS.STARTING_PORTFOLIO,
    pools: createInitialPools(),
    items: {
      insuranceActive: false,
      insuranceEndTime: null,
      insuranceCooldownEnd: null,
      hedgeMode: false,
    },
    halvingMultiplier: 1,
    gasMultiplier: 1,
    gasEndTime: null,
    whaleEndTime: null,
    isGameOver: false,
    isVictory: false,
    currentRun: {
      startTime: Date.now(),
      elapsed: 0,
      halvingCount: 0,
    },
    stats: {
      rugsEaten: 0,
      highestPortfolio: GAME_CONSTANTS.STARTING_PORTFOLIO,
      gamesPlayed: savedStats.gamesPlayed,
      totalTimePlayed: savedStats.totalTimePlayed,
      fastestWin: savedStats.fastestWin,
      auditsUsed: 0,
      insurancesUsed: 0,
      leveragedWins: 0,
    },
  };
}

// Reactive store object
const store = $state({
  currentScreen: 'menu' as Screen,
  game: createInitialState(),
  ralphQuote: getRandomQuote('welcome'),
  ralphNotification: null as RalphNotification,
});

// Intervals
let yieldInterval: number | null = null;
let rngInterval: number | null = null;
let nextRngTime: number = 0;

// ===========================================
// DERIVED GETTERS
// ===========================================

export const currentScreen = {
  get value() { return store.currentScreen; }
};

export const gameState = {
  get value() { return store.game; }
};

export const ralphQuote = {
  get value() { return store.ralphQuote; }
};

export const ralphNotification = {
  get value() { return store.ralphNotification; }
};

export const portfolio = {
  get value() { return store.game.portfolio; }
};

export const pools = {
  get value() { return store.game.pools; }
};

export const items = {
  get value() { return store.game.items; }
};

export const halvingMultiplier = {
  get value() { return store.game.halvingMultiplier; }
};

export const gasMultiplier = {
  get value() { return store.game.gasMultiplier; }
};

export const isGameOver = {
  get value() { return store.game.isGameOver; }
};

export const isVictory = {
  get value() { return store.game.isVictory; }
};

// ===========================================
// COMPUTED VALUES
// ===========================================

// Count pools with deposits
export function getActivePoolCount(): number {
  return store.game.pools.filter(p => !p.isRugged && p.deposited > 0).length;
}

// Get diversification multiplier
export function getDiversificationBonus(): number {
  const count = getActivePoolCount();
  const bonus = GAME_CONSTANTS.DIVERSIFICATION_BONUS;
  if (count >= 6) return bonus[6];
  if (count >= 5) return bonus[5];
  if (count >= 4) return bonus[4];
  if (count >= 3) return bonus[3];
  return bonus[1];
}

// Get total deposited across all pools
export function getTotalDeposited(): number {
  return store.game.pools.reduce((sum, p) => sum + (p.isRugged ? 0 : p.deposited), 0);
}

// Check concentration for a specific pool
export function getConcentrationPenalty(pool: Pool): number {
  const totalDeposited = getTotalDeposited();
  if (totalDeposited === 0 || pool.deposited === 0) return 0;

  const concentration = pool.deposited / totalDeposited;

  if (concentration > GAME_CONSTANTS.CONCENTRATION_THRESHOLD_2) {
    return GAME_CONSTANTS.CONCENTRATION_PENALTY_2;
  }
  if (concentration > GAME_CONSTANTS.CONCENTRATION_THRESHOLD_1) {
    return GAME_CONSTANTS.CONCENTRATION_PENALTY_1;
  }
  return 0;
}

// Calculate time until next halving
export function halvingTimeRemaining(): number {
  const elapsed = store.game.currentRun.elapsed;
  const interval = GAME_CONSTANTS.HALVING_INTERVAL_MS;
  const timeInCycle = elapsed % interval;
  return interval - timeInCycle;
}

// Check if insurance is on cooldown
export function isInsuranceOnCooldown(): boolean {
  const cooldownEnd = store.game.items.insuranceCooldownEnd;
  return cooldownEnd !== null && Date.now() < cooldownEnd;
}

// Get insurance cooldown remaining
export function getInsuranceCooldownRemaining(): number {
  const cooldownEnd = store.game.items.insuranceCooldownEnd;
  if (!cooldownEnd) return 0;
  return Math.max(0, cooldownEnd - Date.now());
}

// Get insurance active time remaining
export function getInsuranceTimeRemaining(): number {
  const endTime = store.game.items.insuranceEndTime;
  if (!endTime || !store.game.items.insuranceActive) return 0;
  return Math.max(0, endTime - Date.now());
}

// Check if any pool is leveraged
export function getLeveragedPool(): Pool | null {
  return store.game.pools.find(p => p.isLeveraged && !p.isRugged) ?? null;
}

// Calculate total yield per second (for display)
export function totalYieldPerSecond(): number {
  let total = 0;
  const diversificationBonus = getDiversificationBonus();

  for (const pool of store.game.pools) {
    if (pool.isRugged || pool.deposited <= 0) continue;

    let yps = pool.deposited * (pool.apy / 100) / 365 / 24 / 60 / 60;
    yps *= GAME_CONSTANTS.YIELD_SPEED_MULTIPLIER;
    yps *= store.game.halvingMultiplier;
    yps *= diversificationBonus;

    // Leverage doubles yields
    if (pool.isLeveraged) {
      yps *= GAME_CONSTANTS.LEVERAGE_MULTIPLIER;
    }

    // Pump bonus
    if (pool.isPumping) yps *= GAME_CONSTANTS.PUMP_MULTIPLIER;

    // Whale dump reduction
    if (store.game.whaleEndTime && Date.now() < store.game.whaleEndTime) {
      const reduction = store.game.items.insuranceActive
        ? GAME_CONSTANTS.WHALE_YIELD_REDUCTION * GAME_CONSTANTS.INSURANCE_DAMAGE_REDUCTION
        : GAME_CONSTANTS.WHALE_YIELD_REDUCTION;
      yps *= (1 - reduction);
    }

    // Hedge mode reduces yields
    if (store.game.items.hedgeMode) {
      yps *= (1 - GAME_CONSTANTS.HEDGE_YIELD_REDUCTION);
    }

    total += yps;
  }

  return total;
}

// ===========================================
// ITEM COST CALCULATIONS
// ===========================================

export function getAuditCost(pool: Pool): number {
  return pool.deposited * GAME_CONSTANTS.AUDIT_COST_PERCENT * store.game.gasMultiplier;
}

export function getInsuranceCost(): number {
  return store.game.portfolio * GAME_CONSTANTS.INSURANCE_COST_PERCENT * store.game.gasMultiplier;
}

export function getHedgeCostPerTick(): number {
  return store.game.portfolio * GAME_CONSTANTS.HEDGE_COST_PERCENT_PER_TICK;
}

// ===========================================
// ACTIONS
// ===========================================

export function setScreen(screen: Screen) {
  store.currentScreen = screen;
}

export function startGame() {
  const fresh = createInitialState();
  store.game.portfolio = fresh.portfolio;
  store.game.pools = fresh.pools;
  store.game.items = fresh.items;
  store.game.halvingMultiplier = fresh.halvingMultiplier;
  store.game.gasMultiplier = fresh.gasMultiplier;
  store.game.gasEndTime = fresh.gasEndTime;
  store.game.whaleEndTime = fresh.whaleEndTime;
  store.game.isGameOver = fresh.isGameOver;
  store.game.isVictory = fresh.isVictory;
  store.game.currentRun = fresh.currentRun;
  store.game.stats = fresh.stats;

  store.ralphQuote = getRandomQuote('welcome');
  store.currentScreen = 'game';
  startIntervals();
}

function startIntervals() {
  stopIntervals();

  yieldInterval = setInterval(() => {
    tickYields();
    tickHedgeDrain();
    updateElapsed();
    checkHalving();
    checkTemporaryEffects();
    checkEndConditions();
  }, GAME_CONSTANTS.YIELD_TICK_MS) as unknown as number;

  resetRngInterval();
  rngInterval = setInterval(() => {
    if (Date.now() >= nextRngTime) {
      checkRngEvent();
      resetRngInterval();
    }
  }, 1000) as unknown as number;
}

export function stopIntervals() {
  if (yieldInterval) clearInterval(yieldInterval);
  if (rngInterval) clearInterval(rngInterval);
  yieldInterval = null;
  rngInterval = null;
}

function resetRngInterval() {
  const base = GAME_CONSTANTS.RNG_CHECK_INTERVAL_MS;
  const variance = GAME_CONSTANTS.RNG_VARIANCE_MS;
  nextRngTime = Date.now() + base + (Math.random() * variance * 2 - variance);
}

function tickYields() {
  let totalYield = 0;
  const diversificationBonus = getDiversificationBonus();

  for (const pool of store.game.pools) {
    if (pool.isRugged || pool.deposited <= 0) continue;

    let yps = pool.deposited * (pool.apy / 100) / 365 / 24 / 60 / 60;
    yps *= GAME_CONSTANTS.YIELD_SPEED_MULTIPLIER;
    yps *= store.game.halvingMultiplier;
    yps *= diversificationBonus;

    // Leverage doubles yields
    if (pool.isLeveraged) {
      yps *= GAME_CONSTANTS.LEVERAGE_MULTIPLIER;
    }

    // Whale dump reduction
    if (store.game.whaleEndTime && Date.now() < store.game.whaleEndTime) {
      const reduction = store.game.items.insuranceActive
        ? GAME_CONSTANTS.WHALE_YIELD_REDUCTION * GAME_CONSTANTS.INSURANCE_DAMAGE_REDUCTION
        : GAME_CONSTANTS.WHALE_YIELD_REDUCTION;
      yps *= (1 - reduction);
    }

    // Pump bonus
    if (pool.isPumping && pool.pumpEndTime && Date.now() < pool.pumpEndTime) {
      yps *= GAME_CONSTANTS.PUMP_MULTIPLIER;
    }

    // Hedge mode reduces yields
    if (store.game.items.hedgeMode) {
      yps *= (1 - GAME_CONSTANTS.HEDGE_YIELD_REDUCTION);
    }

    totalYield += yps;
  }

  store.game.portfolio += totalYield;

  if (store.game.portfolio > store.game.stats.highestPortfolio) {
    store.game.stats.highestPortfolio = store.game.portfolio;
  }
}

function tickHedgeDrain() {
  if (!store.game.items.hedgeMode) return;

  const drain = getHedgeCostPerTick();
  store.game.portfolio -= drain;

  // Auto-disable hedge if portfolio gets too low
  if (store.game.portfolio < drain * 5) {
    store.game.items.hedgeMode = false;
    showToast('🛡️ Hedge Disabled', 'Not enough funds to maintain hedge', 'warning');
  }
}

function updateElapsed() {
  store.game.currentRun.elapsed = Date.now() - store.game.currentRun.startTime;
}

function checkHalving() {
  const elapsed = store.game.currentRun.elapsed;
  const expectedHalvings = Math.floor(elapsed / GAME_CONSTANTS.HALVING_INTERVAL_MS);

  if (expectedHalvings > store.game.currentRun.halvingCount) {
    store.game.halvingMultiplier *= 0.5;
    store.game.currentRun.halvingCount = expectedHalvings;
    showToast('⏰ HALVING!', 'All yields cut by 50%!', 'warning');
    setRalphQuote('halving');
  }
}

function checkTemporaryEffects() {
  const now = Date.now();

  if (store.game.gasEndTime && now >= store.game.gasEndTime) {
    store.game.gasMultiplier = 1;
    store.game.gasEndTime = null;
  }

  if (store.game.whaleEndTime && now >= store.game.whaleEndTime) {
    store.game.whaleEndTime = null;
  }

  // Check insurance expiry
  if (store.game.items.insuranceActive && store.game.items.insuranceEndTime && now >= store.game.items.insuranceEndTime) {
    store.game.items.insuranceActive = false;
    store.game.items.insuranceEndTime = null;
    // Start cooldown
    store.game.items.insuranceCooldownEnd = now + GAME_CONSTANTS.INSURANCE_COOLDOWN_MS;
    showToast('🏥 Insurance Expired', 'Cooldown started (90s)', 'info');
  }

  for (const pool of store.game.pools) {
    if (pool.isPumping && pool.pumpEndTime && now >= pool.pumpEndTime) {
      pool.isPumping = false;
      pool.pumpEndTime = null;
    }
  }
}

function checkEndConditions() {
  if (store.game.portfolio >= GAME_CONSTANTS.WIN_PORTFOLIO) {
    store.game.isVictory = true;

    // Check if won with leverage for stats
    const leveragedPool = getLeveragedPool();
    if (leveragedPool) {
      store.game.stats.leveragedWins++;
    }

    stopIntervals();
    saveManager.recordGameEnd(store.game.stats, true, store.game.currentRun.elapsed);
    store.currentScreen = 'win';
  }

  if (store.game.portfolio <= 0) {
    store.game.isGameOver = true;
    stopIntervals();
    saveManager.recordGameEnd(store.game.stats, false, store.game.currentRun.elapsed);
    store.currentScreen = 'death';
  }
}

// ===========================================
// RNG EVENTS
// ===========================================

function checkRngEvent() {
  const event = rollForEvent();
  if (event) executeEvent(event);
}

function rollForEvent(): GameEvent | null {
  const weights = GAME_CONSTANTS.EVENT_WEIGHTS;
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const roll = Math.random() * total;

  let cumulative = 0;
  let eventType: EventType | null = null;

  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (roll < cumulative) {
      eventType = type as EventType;
      break;
    }
  }

  if (!eventType) return null;

  const targetPool = selectTargetPool(eventType);

  return {
    id: crypto.randomUUID(),
    type: eventType,
    targetPoolId: targetPool?.id ?? null,
    magnitude: Math.random(),
    timestamp: Date.now(),
    blocked: false,
    message: '',
  };
}

function selectTargetPool(eventType: EventType): Pool | null {
  const activePools = store.game.pools.filter(p => !p.isRugged && p.deposited > 0);
  if (activePools.length === 0) return null;

  if (eventType === 'rug' || eventType === 'exploit' || eventType === 'pump') {
    // Weight by APY + concentration penalty for rugs
    let weights = activePools.map(p => {
      let weight = p.apy;
      if (eventType === 'rug') {
        // Concentration increases rug chance
        const penalty = getConcentrationPenalty(p);
        weight *= (1 + penalty);
      }
      return weight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const roll = Math.random() * totalWeight;
    let cumulative = 0;

    for (let i = 0; i < activePools.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) return activePools[i];
    }
  }

  return activePools[Math.floor(Math.random() * activePools.length)] ?? null;
}

function executeEvent(event: GameEvent) {
  switch (event.type) {
    case 'rug': executeRug(event); break;
    case 'exploit': executeExploit(event); break;
    case 'whale': executeWhaleDump(); break;
    case 'gas': executeGasSpike(); break;
    case 'pump': executePump(event); break;
  }
}

function executeRug(event: GameEvent) {
  if (!event.targetPoolId) return;

  const pool = store.game.pools.find(p => p.id === event.targetPoolId);
  if (!pool || pool.isRugged) return;

  // Hedge mode = immune to rugs!
  if (store.game.items.hedgeMode) {
    showToast('🛡️ RUG BLOCKED!', `Hedge mode saved ${pool.name}!`, 'success');
    setRalphQuote('exploitBlocked');
    return;
  }

  // Audit blocks rugs on this specific pool
  if (pool.hasAudit) {
    pool.hasAudit = false;
    showToast('🛡️ AUDIT SAVED YOU!', `${pool.name} rug blocked by audit!`, 'success');
    setRalphQuote('exploitBlocked');
    return;
  }

  // Calculate loss (leverage = 2x loss!)
  let lostAmount = pool.deposited;
  if (pool.isLeveraged) {
    lostAmount *= GAME_CONSTANTS.LEVERAGE_MULTIPLIER;
    pool.isLeveraged = false;
  }

  // Insurance reduces damage
  if (store.game.items.insuranceActive) {
    lostAmount *= (1 - GAME_CONSTANTS.INSURANCE_DAMAGE_REDUCTION);
  }

  pool.isRugged = true;
  pool.deposited = 0;
  store.game.portfolio -= lostAmount; // Can go negative with leverage!
  store.game.stats.rugsEaten++;

  const leverageText = pool.isLeveraged ? ' (2x LEVERAGE LOSS!)' : '';
  showToast('🚨 RUG PULL!', `${pool.name} rugged! Lost $${lostAmount.toFixed(0)}${leverageText}`, 'danger');
  setRalphQuote('rug');
}

function executeExploit(event: GameEvent) {
  if (!event.targetPoolId) return;

  const pool = store.game.pools.find(p => p.id === event.targetPoolId);
  if (!pool || pool.isRugged) return;

  // Audit blocks exploits
  if (pool.hasAudit) {
    pool.hasAudit = false;
    store.game.stats.auditsUsed++;
    showToast('🛡️ EXPLOIT BLOCKED!', `Audit saved ${pool.name}!`, 'success');
    setRalphQuote('exploitBlocked');
    return;
  }

  let lostAmount = pool.deposited * GAME_CONSTANTS.EXPLOIT_DAMAGE;

  // Leverage = 2x loss
  if (pool.isLeveraged) {
    lostAmount *= GAME_CONSTANTS.LEVERAGE_MULTIPLIER;
  }

  // Insurance reduces damage
  if (store.game.items.insuranceActive) {
    lostAmount *= (1 - GAME_CONSTANTS.INSURANCE_DAMAGE_REDUCTION);
  }

  pool.deposited -= lostAmount;

  showToast('⚠️ EXPLOIT!', `${pool.name} hacked! Lost $${lostAmount.toFixed(0)}`, 'warning');
  setRalphQuote('exploit');
}

function executeWhaleDump() {
  store.game.whaleEndTime = Date.now() + GAME_CONSTANTS.WHALE_DURATION_MS;
  const reduction = store.game.items.insuranceActive ? '15%' : '30%';

  showToast('🐋 WHALE DUMP!', `All yields -${reduction} for 60s`, 'info');
  setRalphQuote('whale');
}

function executeGasSpike() {
  store.game.gasMultiplier = GAME_CONSTANTS.GAS_MULTIPLIER;
  store.game.gasEndTime = Date.now() + GAME_CONSTANTS.GAS_DURATION_MS;

  showToast('⛽ GAS SPIKE!', 'Actions cost 3x for 30s!', 'warning');
  setRalphQuote('gas');
}

function executePump(event: GameEvent) {
  if (!event.targetPoolId) return;

  const pool = store.game.pools.find(p => p.id === event.targetPoolId);
  if (!pool || pool.isRugged) return;

  pool.isPumping = true;
  pool.pumpEndTime = Date.now() + GAME_CONSTANTS.PUMP_DURATION_MS;

  showToast('🚀 PUMP!', `${pool.name} 2x yields for 30s!`, 'success');
  setRalphQuote('pump');
}

// ===========================================
// PLAYER ACTIONS
// ===========================================

export function deposit(poolId: string, amount: number) {
  const pool = store.game.pools.find(p => p.id === poolId);
  if (!pool || pool.isRugged) {
    showToast('❌ Pool Rugged', 'This pool has been rugged!', 'danger');
    return;
  }

  const cost = amount * store.game.gasMultiplier;
  if (store.game.portfolio < cost) {
    setRalphQuote('cantAfford');
    showToast('❌ Insufficient Funds', `Need $${cost.toFixed(0)}`, 'danger');
    return;
  }

  store.game.portfolio -= cost;
  pool.deposited += amount;

  const quoteType = pool.riskLevel === 'degen' ? 'depositHighRisk' : 'deposit';
  setRalphQuote(quoteType);
}

export function withdrawAll(poolId: string) {
  const pool = store.game.pools.find(p => p.id === poolId);
  if (!pool || pool.isRugged || pool.deposited <= 0) {
    showToast('❌ Nothing to Withdraw', 'No funds in this pool', 'warning');
    return;
  }

  store.game.portfolio += pool.deposited;
  pool.deposited = 0;
  pool.hasAudit = false; // Audit is lost when you withdraw
  pool.isLeveraged = false; // Leverage is removed
  setRalphQuote('withdraw');
}

// Buy audit for a specific pool (10% of pool value)
export function buyAudit(poolId: string) {
  const pool = store.game.pools.find(p => p.id === poolId);
  if (!pool || pool.isRugged || pool.deposited <= 0) {
    showToast('❌ Invalid Pool', 'Cannot audit this pool', 'danger');
    return;
  }

  if (pool.hasAudit) {
    showToast('❌ Already Audited', 'This pool already has an audit', 'warning');
    return;
  }

  const cost = getAuditCost(pool);
  if (store.game.portfolio < cost) {
    setRalphQuote('cantAfford');
    showToast('❌ Insufficient Funds', `Need $${cost.toFixed(0)}`, 'danger');
    return;
  }

  store.game.portfolio -= cost;
  pool.hasAudit = true;
  setRalphQuote('buyAudit');
  showToast('🛡️ Audit Shield Active!', `${pool.name} protected from next rug/exploit`, 'success');
}

// Buy insurance (5% of portfolio, 60s duration)
export function buyInsurance() {
  if (store.game.items.insuranceActive) {
    showToast('❌ Already Active', 'Insurance is already active', 'warning');
    return;
  }

  if (isInsuranceOnCooldown()) {
    const remaining = Math.ceil(getInsuranceCooldownRemaining() / 1000);
    showToast('❌ On Cooldown', `Wait ${remaining}s before buying again`, 'warning');
    return;
  }

  const cost = getInsuranceCost();
  if (store.game.portfolio < cost) {
    setRalphQuote('cantAfford');
    showToast('❌ Insufficient Funds', `Need $${cost.toFixed(0)}`, 'danger');
    return;
  }

  store.game.portfolio -= cost;
  store.game.items.insuranceActive = true;
  store.game.items.insuranceEndTime = Date.now() + GAME_CONSTANTS.INSURANCE_DURATION_MS;
  store.game.items.insuranceCooldownEnd = null;
  store.game.stats.insurancesUsed++;

  setRalphQuote('buyInsurance');
  showToast('🏥 Insurance Active!', '50% damage reduction for 60s', 'success');
}

// Toggle hedge mode
export function toggleHedge() {
  if (store.game.items.hedgeMode) {
    // Turn off hedge
    store.game.items.hedgeMode = false;
    showToast('🛡️ Hedge OFF', 'Full yields restored, rug protection removed', 'info');
  } else {
    // Turn on hedge - check if can afford
    const costPerTick = getHedgeCostPerTick();
    if (store.game.portfolio < costPerTick * 5) {
      showToast('❌ Insufficient Funds', 'Need more funds to hedge', 'danger');
      return;
    }
    store.game.items.hedgeMode = true;
    showToast('🛡️ Hedge ON', 'Immune to rugs, -50% yields, draining 2%/sec', 'success');
  }
}

// Toggle leverage on a pool
export function toggleLeverage(poolId: string) {
  const pool = store.game.pools.find(p => p.id === poolId);
  if (!pool || pool.isRugged || pool.deposited <= 0) {
    showToast('❌ Invalid Pool', 'Cannot leverage this pool', 'danger');
    return;
  }

  if (pool.isLeveraged) {
    // Turn off leverage
    pool.isLeveraged = false;
    showToast('📉 Leverage OFF', `${pool.name} back to normal yields`, 'info');
  } else {
    // Check if another pool is leveraged
    const existingLeveraged = getLeveragedPool();
    if (existingLeveraged) {
      showToast('❌ Already Leveraged', `Remove leverage from ${existingLeveraged.name} first`, 'warning');
      return;
    }
    pool.isLeveraged = true;
    showToast('📈 LEVERAGE ON!', `${pool.name} now 2x yields AND 2x risk!`, 'warning');
  }
}

// ===========================================
// UI HELPERS
// ===========================================

export function setRalphQuote(category: QuoteCategory) {
  store.ralphQuote = getRandomQuote(category);
}

let notificationTimeout: number | null = null;

export function showToast(title: string, message: string, type: 'success' | 'danger' | 'warning' | 'info') {
  showRalphNotification(title, message, type);
}

export function showRalphNotification(title: string, message: string, type: 'success' | 'danger' | 'warning' | 'info' | 'neutral') {
  if (notificationTimeout) clearTimeout(notificationTimeout);

  store.ralphNotification = { title, message, type };

  notificationTimeout = setTimeout(() => {
    store.ralphNotification = null;
  }, 5000) as unknown as number;
}
