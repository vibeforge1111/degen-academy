<script lang="ts">
  import {
    pools, portfolio, ralphQuote, ralphNotification, items, gasMultiplier,
    buyInsurance, toggleHedge, halvingMultiplier, halvingTimeRemaining, gameState,
    getInsuranceCost, getHedgeCostPerTick, getDiversificationBonus, getActivePoolCount,
    isInsuranceOnCooldown, getInsuranceCooldownRemaining, getInsuranceTimeRemaining,
    totalYieldPerSecond, getTotalDeposited, setScreen
  } from '../../stores/gameStore.svelte';
  import { playerPosition } from '../../stores/memeStore.svelte';
  import { GAME_CONSTANTS } from '../../../data/constants';
  import BottomBar from '../BottomBar.svelte';
  import PoolCard from '../PoolCard.svelte';

  const poolList = $derived(pools.value);
  const portfolioVal = $derived(portfolio.value);
  const totalInPools = $derived(getTotalDeposited());
  const memePosition = $derived(playerPosition.value);
  const totalNetWorth = $derived(portfolioVal + totalInPools + memePosition);
  const quote = $derived(ralphQuote.value);
  const notification = $derived(ralphNotification.value);
  const itemsVal = $derived(items.value);
  const gasMult = $derived(gasMultiplier.value);
  const halvingMult = $derived(halvingMultiplier.value);
  const game = $derived(gameState.value);
  const halvingTime = $derived(halvingTimeRemaining());
  const halvingUrgent = $derived(halvingTime < 60000);

  // New competitive economy values
  const insuranceCost = $derived(getInsuranceCost());
  const hedgeCostPerSec = $derived(getHedgeCostPerTick());
  const diversificationBonus = $derived(getDiversificationBonus());
  const activePoolCount = $derived(getActivePoolCount());
  const insuranceOnCooldown = $derived(isInsuranceOnCooldown());
  const insuranceCooldown = $derived(getInsuranceCooldownRemaining());
  const insuranceTimeLeft = $derived(getInsuranceTimeRemaining());
  const yieldPerSec = $derived(totalYieldPerSecond());

  const canAffordInsurance = $derived(
    portfolioVal >= insuranceCost &&
    !itemsVal.insuranceActive &&
    !insuranceOnCooldown
  );
  const canAffordHedge = $derived(portfolioVal >= hedgeCostPerSec * 5);

  // Notification type colors
  const notificationColors = {
    success: { bg: '#2a3a2a', border: '#4ade80', text: '#4ade80' },
    danger: { bg: '#3a2a2a', border: '#f87171', text: '#f87171' },
    warning: { bg: '#3a3528', border: '#fbbf24', text: '#fbbf24' },
    info: { bg: '#2a2a3a', border: '#60a5fa', text: '#60a5fa' },
    neutral: { bg: '#2d2d3a', border: '#a78bfa', text: '#a78bfa' },
  };

  function formatMoney(amount: number): string {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  }

  // Format yield with precision - show exact earnings
  function formatYield(amount: number): string {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(2)}K`;
    } else if (amount >= 1) {
      return `$${amount.toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}`;
  }

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="min-h-screen min-h-dvh flex flex-col bg-cover bg-center bg-fixed relative"
     style="background-image: url('/ralph-lab-bg.png');">

  <!-- Dark overlay -->
  <div class="absolute inset-0 bg-slate-950/85"></div>

  <!-- Main Content -->
  <div class="relative z-10 flex-1 flex flex-col h-screen h-dvh overflow-hidden">

    <!-- Header Section -->
    <header class="flex-shrink-0" style="padding: 20px 32px;">
      <!-- Top Row: Logo, Controls, Wallet -->
      <div class="flex items-center justify-between" style="margin-bottom: 16px;">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <img src="/ralph-logo.png" alt="Ralph" class="w-10 h-10 rounded-lg object-cover" />
          <h1 class="text-lg font-chalk text-white">Ralph's Degen Academy</h1>
        </div>

        <!-- Mode Switcher -->
        <div class="mode-switcher">
          <button class="mode-tab active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Yield Farms</span>
          </button>
          <button class="mode-tab" onclick={() => setScreen('meme')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
            <span>Meme Coins</span>
          </button>
        </div>

        <!-- Wallet with breakdown -->
        <div style="display: flex; align-items: center; gap: 16px; padding: 10px 20px; background: #2d2d3a; border-radius: 8px;">
          <!-- Total Portfolio -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color: #fff; opacity: 0.9;">
              <path d="M3 7c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
              <path d="M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
              <path d="M3 7l4-3h10l4 3"/>
            </svg>
            <div style="display: flex; flex-direction: column; line-height: 1.2;">
              <span style="font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Total</span>
              <span class="font-mono font-bold" style="font-size: 14px; color: #fff;">${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.15);"></div>

          <!-- In Pools + Trading -->
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Pools + Trading</span>
            <span class="font-mono font-semibold" style="font-size: 13px; color: #a78bfa;">${(totalInPools + memePosition).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.15);"></div>

          <!-- Cash Available -->
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Cash</span>
            <span class="font-mono font-semibold" style="font-size: 13px; color: #4ade80;">${portfolioVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <!-- Second Row: Ralph + Actions (left) | Stats (right) -->
      <div style="display: flex; gap: 16px;">
        <!-- Ralph Panel with Audit/Insurance on right -->
        <div class="ralph-panel" style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
          <!-- Ralph Message (left) -->
          {#if notification}
            {@const colors = notificationColors[notification.type]}
            <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
              <span class="font-handwritten" style="font-size: 17px; color: #fff;">Ralph:</span>
              <p class="font-handwritten" style="font-size: 17px; color: {colors.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">"{notification.message}"</p>
            </div>
          {:else}
            <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
              <span class="font-handwritten" style="font-size: 17px; color: #fff;">Ralph:</span>
              <p class="font-handwritten" style="font-size: 17px; color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">"{quote}"</p>
            </div>
          {/if}

          <!-- Action Buttons (right) -->
          <div style="display: flex; align-items: center; gap: 8px; margin-left: 16px;">
            <!-- Insurance Button - 5% portfolio, 60s duration, 90s cooldown -->
            <div class="tooltip-wrapper">
              <button
                onclick={() => buyInsurance()}
                disabled={!canAffordInsurance}
                class="action-btn"
                class:disabled={!canAffordInsurance}
                class:active={itemsVal.insuranceActive}
                class:cooldown={insuranceOnCooldown}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color: #fff; opacity: 0.85;">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
                <span class="font-medium">Insurance</span>
                {#if itemsVal.insuranceActive}
                  <span style="color: #4ade80; font-weight: 700;">{Math.ceil(insuranceTimeLeft / 1000)}s</span>
                {:else if insuranceOnCooldown}
                  <span style="color: #f87171; font-weight: 700;">{Math.ceil(insuranceCooldown / 1000)}s</span>
                {:else}
                  <span style="color: rgba(255,255,255,0.4);">{formatMoney(insuranceCost)}</span>
                {/if}
              </button>
              <div class="tooltip">
                {#if itemsVal.insuranceActive}
                  Active! 50% damage reduction
                {:else if insuranceOnCooldown}
                  On cooldown - wait {Math.ceil(insuranceCooldown / 1000)}s
                {:else}
                  5% of portfolio, 60s protection, 50% damage reduction
                {/if}
              </div>
            </div>

            <!-- Hedge Mode Toggle - 2%/sec drain, immune to rugs, -50% yields -->
            <div class="tooltip-wrapper">
              <button
                onclick={() => toggleHedge()}
                disabled={!itemsVal.hedgeMode && !canAffordHedge}
                class="action-btn"
                class:disabled={!itemsVal.hedgeMode && !canAffordHedge}
                class:hedge-active={itemsVal.hedgeMode}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color: #fff; opacity: 0.85;">
                  <path d="M12 3l8 4v5c0 5.5-3.8 10.2-8 12-4.2-1.8-8-6.5-8-12V7l8-4z"/>
                </svg>
                <span class="font-medium">Hedge</span>
                {#if itemsVal.hedgeMode}
                  <span style="color: #60a5fa; font-weight: 700;">ON</span>
                {:else}
                  <span style="color: rgba(255,255,255,0.4);">{formatMoney(hedgeCostPerSec)}/s</span>
                {/if}
              </button>
              <div class="tooltip">
                {#if itemsVal.hedgeMode}
                  Draining {formatMoney(hedgeCostPerSec)}/s • Click to disable
                {:else}
                  Immune to rugs, -50% yields, 2%/sec cost
                {/if}
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Panel -->
        <div class="stats-panel">
          <!-- Yield/sec -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; color: rgba(255,255,255,0.4);">Yield</span>
            <span class="font-mono font-bold" style="font-size: 13px; color: #4ade80;">
              +{formatYield(yieldPerSec)}/s
            </span>
          </div>

          <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>

          <!-- Diversification Bonus -->
          <div class="tooltip-wrapper">
            <div style="display: flex; align-items: center; gap: 6px; cursor: help;">
              <span style="font-size: 10px; color: rgba(255,255,255,0.4);">Div</span>
              <span class="font-mono font-bold" style="font-size: 13px; color: {diversificationBonus > 1 ? '#4ade80' : 'rgba(255,255,255,0.5)'};">
                {#if diversificationBonus > 1}
                  +{((diversificationBonus - 1) * 100).toFixed(0)}%
                {:else}
                  --
                {/if}
              </span>
            </div>
            <div class="tooltip">
              {activePoolCount}/6 pools active
              {#if diversificationBonus > 1}
                • +{((diversificationBonus - 1) * 100).toFixed(0)}% yield bonus!
              {:else}
                • Need 3+ pools for bonus
              {/if}
            </div>
          </div>

          <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>

          <!-- Halving Timer -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; color: rgba(255,255,255,0.4);">Halving</span>
            <span class="font-mono font-bold" style="font-size: 13px; color: {halvingUrgent ? '#f87171' : '#fbbf24'};">
              {formatTime(halvingTime)}
            </span>
          </div>

          <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>

          <!-- Multiplier -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; color: rgba(255,255,255,0.4);">Mult</span>
            <span class="font-mono font-bold" style="font-size: 13px; color: #a78bfa;">{halvingMult.toFixed(2)}x</span>
          </div>

          <!-- Gas indicator (only when active) -->
          {#if gasMult > 1}
            <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>
            <div class="status-indicator warning">
              <span>⛽</span>
              <span class="font-bold">{gasMult}x</span>
            </div>
          {/if}

          <!-- Whale indicator (only when active) -->
          {#if game.whaleEndTime && Date.now() < game.whaleEndTime}
            <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>
            <div class="status-indicator info">
              <span>🐋</span>
              <span class="font-bold">Active</span>
            </div>
          {/if}

          <!-- Hedge indicator (only when active) -->
          {#if itemsVal.hedgeMode}
            <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>
            <div class="status-indicator hedge">
              <span>🛡️</span>
              <span class="font-bold">HEDGE</span>
            </div>
          {/if}
        </div>
      </div>
    </header>

    <!-- Scrollable Pool Grid - Centered -->
    <div class="flex-1 overflow-y-auto" style="padding-bottom: 32px;">
      <div class="flex flex-col items-center" style="padding: 32px 32px 0 32px;">
        <!-- Section Header -->
        <h2 class="text-white font-chalk text-3xl" style="margin-bottom: 24px;">Liquidity Pools</h2>

        <!-- Pool Grid - 2 cards per row, centered -->
        <div class="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {#each poolList as pool (pool.id)}
            <PoolCard {pool} />
          {/each}
        </div>
      </div>
    </div>

    <!-- Simplified Footer - Just Progress Bar -->
    <div class="flex-shrink-0" style="padding: 16px 32px 24px 32px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.1);">
      <BottomBar />
    </div>
  </div>
</div>

<style>
  /* Mode Switcher */
  .mode-switcher {
    display: flex;
    gap: 2px;
  }

  .mode-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mode-tab svg {
    opacity: 0.6;
  }

  .mode-tab:hover:not(.active) {
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.1);
  }

  .mode-tab:hover:not(.active) svg {
    opacity: 0.8;
  }

  .mode-tab.active {
    color: white;
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .mode-tab.active svg {
    opacity: 1;
    color: #a78bfa;
  }

  /* Ralph panel */
  .ralph-panel {
    padding: 10px 14px;
    background: #2d2d3a;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  /* Action button - simple, clean */
  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 12px;
    background: #3a3a4a;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    transition: all 0.15s ease;
    cursor: pointer;
    color: rgba(255,255,255,0.9);
  }

  .action-btn:hover:not(.disabled) {
    background: #454555;
    border-color: rgba(255,255,255,0.2);
  }

  .action-btn:active:not(.disabled) {
    background: #333343;
  }

  .action-btn.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Stats panel */
  .stats-panel {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    background: #2d2d3a;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  /* Status indicators */
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-size: 11px;
    border-radius: 6px;
  }

  .status-indicator.warning {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
  }

  .status-indicator.info {
    background: rgba(96, 165, 250, 0.15);
    color: #60a5fa;
  }

  .status-indicator.hedge {
    background: rgba(96, 165, 250, 0.15);
    color: #60a5fa;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* Active insurance button */
  .action-btn.active {
    background: rgba(74, 222, 128, 0.2);
    border-color: #4ade80;
  }

  /* Cooldown insurance button */
  .action-btn.cooldown {
    background: rgba(248, 113, 113, 0.1);
    border-color: rgba(248, 113, 113, 0.3);
  }

  /* Hedge active button */
  .action-btn.hedge-active {
    background: rgba(96, 165, 250, 0.2);
    border-color: #60a5fa;
    animation: pulse 1.5s ease-in-out infinite;
  }

  /* Tooltip styles */
  .tooltip-wrapper {
    position: relative;
  }

  .tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 10px;
    background: #1a1a2e;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 6px;
    font-size: 11px;
    color: rgba(255,255,255,0.9);
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s ease;
    pointer-events: none;
    z-index: 50;
  }

  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #1a1a2e;
  }

  .tooltip-wrapper:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }
</style>
