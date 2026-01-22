<script lang="ts">
  import MemeChart from '../MemeChart.svelte';
  import SocialFeed from '../SocialFeed.svelte';
  import {
    allTokens,
    selectedTokenIndex,
    currentToken,
    playerPosition,
    playerPnL,
    tradingTokenIndex,
    priceChange,
    isMemePlaying,
    startMemeGame,
    stopMemeGame,
    selectToken,
    buyToken,
    sellAll,
    formatPrice,
    getChangeColor,
    formatMarketCap,
    getTierConfig,
  } from '../../stores/memeStore.svelte';
  import { portfolio, setScreen, getTotalDeposited } from '../../stores/gameStore.svelte';
  import { onMount } from 'svelte';

  const tokens = $derived(allTokens.value);
  const selectedIdx = $derived(selectedTokenIndex.value);
  const token = $derived(currentToken.value);
  const position = $derived(playerPosition.value);
  const pnl = $derived(playerPnL.value);
  const tradingIdx = $derived(tradingTokenIndex.value);
  const change = $derived(priceChange.value);
  const playing = $derived(isMemePlaying.value);
  const cashBalance = $derived(portfolio.value);

  // Wallet breakdown
  const totalInPools = $derived(getTotalDeposited());
  const totalNetWorth = $derived(cashBalance + totalInPools + position);

  const pnlColor = $derived(pnl >= 0 ? '#4ade80' : '#ef4444');
  const changeColor = $derived(getChangeColor(change));

  // Market cap
  const marketCap = $derived(token ? token.currentPrice * token.totalSupply : 0);

  // Buy amounts
  const buyAmounts = [100, 500, 1000];

  // Check if can buy this token (not holding another)
  const canBuyThisToken = $derived(tradingIdx === null || tradingIdx === selectedIdx);
  const isHoldingThis = $derived(tradingIdx === selectedIdx && position > 0);

  // Auto-start on mount
  onMount(() => {
    if (!playing) {
      startMemeGame();
    }
    return () => {
      // Don't stop on unmount - let it run
    };
  });

  function formatMoney(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  }

  // Get price change for a token
  function getTokenChange(t: typeof token): number {
    if (!t) return 0;
    return ((t.currentPrice - t.startPrice) / t.startPrice) * 100;
  }

  // Mini sparkline for token tabs
  function getMiniPath(history: number[]): string {
    if (history.length < 2) return '';
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    return history.map((p, i) => {
      const x = (i / (history.length - 1)) * 40;
      const y = 12 - ((p - min) / range) * 10;
      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    }).join(' ');
  }
</script>

<div class="min-h-screen min-h-dvh flex flex-col bg-cover bg-center bg-fixed relative"
     style="background-image: url('/ralph-lab-bg.png');">

  <!-- Dark overlay -->
  <div class="absolute inset-0 bg-slate-950/85"></div>

  <!-- Main Content -->
  <div class="relative z-10 flex-1 flex flex-col h-screen h-dvh overflow-hidden">

    <!-- Header Section (same as GameScreen) -->
    <header class="flex-shrink-0" style="padding: 20px 32px;">
      <!-- Top Row: Logo, Controls, Wallet -->
      <div class="flex items-center justify-between" style="margin-bottom: 16px;">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <img src="/ralph-logo.png" alt="Ralph" class="w-10 h-10 rounded-lg object-cover" />
          <h1 class="text-lg font-chalk text-white">Ralph's Degen Academy</h1>
        </div>

        <!-- Right side: Mode Switcher + Wallet -->
        <div style="display: flex; align-items: center; gap: 16px;">
        <!-- Mode Switcher -->
        <div class="mode-switcher">
          <button class="mode-tab" onclick={() => setScreen('game')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Yield Farms</span>
          </button>
          <button class="mode-tab active">
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
            <span class="font-mono font-semibold" style="font-size: 13px; color: #a78bfa;">${(totalInPools + position).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.15);"></div>

          <!-- Cash Available -->
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Cash</span>
            <span class="font-mono font-semibold" style="font-size: 13px; color: #4ade80;">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        </div>
      </div>

      <!-- Second Row: Token Tabs (like Ralph panel) -->
      <div class="token-tabs-row">
        {#each tokens as t, i}
          {@const tokenChange = getTokenChange(t)}
          {@const tokenColor = getChangeColor(tokenChange)}
          {@const tierConfig = getTierConfig(t.tier)}
          <button
            class="token-tab"
            class:active={selectedIdx === i}
            class:holding={tradingIdx === i}
            onclick={() => selectToken(i)}
          >
            <span class="tier-badge" style="background: {tierConfig.color}">{tierConfig.label}</span>
            <span class="token-emoji">{t.emoji}</span>
            <div class="token-info">
              <span class="token-ticker">{t.ticker}</span>
              <span class="token-change" style="color: {tokenColor}">
                {tokenChange >= 0 ? '+' : ''}{tokenChange.toFixed(0)}%
              </span>
            </div>
            <svg class="mini-chart" viewBox="0 0 40 14" preserveAspectRatio="none">
              <path d={getMiniPath(t.priceHistory)} fill="none" stroke={tokenColor} stroke-width="1.5"/>
            </svg>
            {#if tradingIdx === i}
              <span class="holding-badge">HOLD</span>
            {/if}
          </button>
        {/each}
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden" style="padding: 0 32px 24px 32px;">
      <div class="trading-layout">
        <!-- Left: Chart + Token Info -->
        <div class="chart-area">
          <!-- Token Header -->
          <div class="token-header">
            <div class="token-identity">
              <span class="big-emoji">{token?.emoji}</span>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h2 class="token-name">{token?.name}</h2>
                  {#if token}
                    {@const tc = getTierConfig(token.tier)}
                    <span class="header-tier-badge" style="background: {tc.color}">{tc.label} CAP</span>
                  {/if}
                </div>
                <span class="token-ticker-sub">{token?.ticker}</span>
              </div>
            </div>
            <div class="token-price">
              <span class="price-value">{formatPrice(token?.currentPrice || 0)}</span>
              <span class="price-change" style="color: {changeColor}">
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
            <div class="token-stats">
              <div class="stat">
                <span class="stat-label">MCap</span>
                <span class="stat-value">{formatMarketCap(marketCap)}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Supply</span>
                <span class="stat-value">{token?.totalSupply ? (token.totalSupply / 1_000_000_000).toFixed(1) + 'B' : '-'}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Risk</span>
                <span class="stat-value" style="color: {token ? getTierConfig(token.tier).color : '#fff'}">
                  {token?.tier === 'micro' ? '🔥 EXTREME' : token?.tier === 'small' ? '⚠️ HIGH' : token?.tier === 'mid' ? '📊 MED' : '🛡️ LOW'}
                </span>
              </div>
            </div>
          </div>

          <!-- Chart -->
          <div class="chart-container">
            <MemeChart />
          </div>
        </div>

        <!-- Right: Feed + Trading -->
        <div class="trading-area">
          <!-- Position Info (if holding) -->
          {#if isHoldingThis}
            <div class="position-card">
              <div class="position-header">
                <span>Your Position</span>
                <span class="position-token">{token?.ticker}</span>
              </div>
              <div class="position-values">
                <div class="position-item">
                  <span class="pos-label">Value</span>
                  <span class="pos-value">{formatMoney(position)}</span>
                </div>
                <div class="position-item">
                  <span class="pos-label">P&L</span>
                  <span class="pos-value" style="color: {pnlColor}">
                    {pnl >= 0 ? '+' : ''}{formatMoney(pnl)}
                  </span>
                </div>
              </div>
              <button class="sell-btn" onclick={() => sellAll()}>
                SELL ALL
              </button>
            </div>
          {:else if tradingIdx !== null && tradingIdx !== selectedIdx}
            <div class="position-card warning">
              <span class="warning-text">You're holding {tokens[tradingIdx]?.ticker}</span>
              <span class="warning-sub">Sell before buying another token</span>
            </div>
          {/if}

          <!-- Buy Buttons -->
          {#if canBuyThisToken}
            <div class="buy-section">
              <span class="buy-label">Quick Buy</span>
              <div class="buy-buttons">
                {#each buyAmounts as amount}
                  <button
                    class="buy-btn"
                    onclick={() => buyToken(amount)}
                    disabled={cashBalance < amount}
                  >
                    ${amount >= 1000 ? `${amount/1000}K` : amount}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Live Feed -->
          <div class="feed-area">
            <SocialFeed />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Mode Switcher (same as GameScreen) */
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
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .mode-tab.active svg {
    opacity: 1;
    color: white;
  }

  /* Token Tabs Row */
  .token-tabs-row {
    display: flex;
    gap: 8px;
    padding: 10px 14px;
    background: #2d2d3a;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    overflow-x: auto;
  }

  .token-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    min-width: fit-content;
  }

  .token-tab:hover {
    background: rgba(255,255,255,0.08);
  }

  .token-tab.active {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.2);
  }

  .token-tab.holding {
    border-color: rgba(167, 139, 250, 0.5);
    box-shadow: 0 0 8px rgba(167, 139, 250, 0.2);
  }

  .token-emoji {
    font-size: 18px;
  }

  .token-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .token-ticker {
    font-size: 11px;
    font-weight: 600;
    color: white;
  }

  .token-change {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
  }

  .mini-chart {
    width: 40px;
    height: 14px;
  }

  .holding-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 7px;
    font-weight: 700;
    padding: 2px 4px;
    background: #a78bfa;
    color: #131722;
    border-radius: 3px;
  }

  .tier-badge {
    font-size: 7px;
    font-weight: 700;
    padding: 2px 4px;
    color: white;
    border-radius: 3px;
    text-shadow: 0 1px 1px rgba(0,0,0,0.3);
  }

  .header-tier-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 3px 6px;
    color: white;
    border-radius: 4px;
    text-shadow: 0 1px 1px rgba(0,0,0,0.3);
  }

  /* Trading Layout */
  .trading-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    height: 100%;
  }

  @media (max-width: 1024px) {
    .trading-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
    }
  }

  .chart-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  .token-header {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 12px 16px;
    background: rgba(19, 23, 34, 0.8);
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .token-identity {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .big-emoji {
    font-size: 28px;
  }

  .token-name {
    font-size: 16px;
    font-weight: 600;
    color: white;
    line-height: 1.2;
  }

  .token-ticker-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
  }

  .token-price {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .price-value {
    font-size: 20px;
    font-weight: 700;
    color: white;
    font-family: 'JetBrains Mono', monospace;
  }

  .price-change {
    font-size: 14px;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
  }

  .token-stats {
    display: flex;
    gap: 16px;
    margin-left: auto;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .stat-label {
    font-size: 9px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
  }

  .stat-value {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    font-family: 'JetBrains Mono', monospace;
  }

  .chart-container {
    flex: 1;
    min-height: 250px;
  }

  /* Trading Area - fills grid cell height */
  .trading-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    height: 100%;
    overflow: hidden;
  }

  .position-card {
    padding: 12px;
    background: rgba(167, 139, 250, 0.1);
    border: 1px solid rgba(167, 139, 250, 0.3);
    border-radius: 8px;
  }

  .position-card.warning {
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.3);
    text-align: center;
    padding: 16px;
  }

  .warning-text {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #fbbf24;
    margin-bottom: 4px;
  }

  .warning-sub {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
  }

  .position-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 11px;
    color: rgba(255,255,255,0.6);
  }

  .position-token {
    font-weight: 600;
    color: #a78bfa;
  }

  .position-values {
    display: flex;
    gap: 16px;
    margin-bottom: 10px;
  }

  .position-item {
    display: flex;
    flex-direction: column;
  }

  .pos-label {
    font-size: 9px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
  }

  .pos-value {
    font-size: 15px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: white;
  }

  .sell-btn {
    width: 100%;
    padding: 10px;
    font-size: 12px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.1s;
  }

  .sell-btn:hover {
    transform: scale(1.02);
  }

  .sell-btn:active {
    transform: scale(0.98);
  }

  /* Buy Section - matches token tabs bar styling */
  .buy-section {
    padding: 10px 14px;
    background: #2d2d3a;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .buy-label {
    display: block;
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .buy-buttons {
    display: flex;
    gap: 6px;
  }

  .buy-btn {
    flex: 1;
    padding: 10px 8px;
    font-size: 12px;
    font-weight: 600;
    color: white;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .buy-btn:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.6);
  }

  .buy-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Feed Area - extends to fill remaining space and align with chart bottom */
  .feed-area {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
