<script lang="ts">
  import MemeChart from '../MemeChart.svelte';
  import SocialFeed from '../SocialFeed.svelte';
  import {
    memeGame,
    isMemePlaying,
    currentToken,
    playerPosition,
    playerPnL,
    timeRemaining,
    priceChange,
    startMemeGame,
    buyToken,
    sellAll,
    playAgain,
    formatPrice,
    getChangeColor,
  } from '../../stores/memeStore.svelte';
  import { portfolio, setScreen, getTotalDeposited } from '../../stores/gameStore.svelte';

  const game = $derived(memeGame.value);
  const playing = $derived(isMemePlaying.value);
  const token = $derived(currentToken.value);
  const position = $derived(playerPosition.value);
  const pnl = $derived(playerPnL.value);
  const time = $derived(timeRemaining.value);
  const change = $derived(priceChange.value);
  const cashBalance = $derived(portfolio.value);

  // Wallet breakdown
  const totalInPools = $derived(getTotalDeposited());
  const tradingPosition = $derived(position);
  const totalNetWorth = $derived(cashBalance + totalInPools + tradingPosition);

  const pnlColor = $derived(pnl >= 0 ? '#4ade80' : '#ef4444');
  const changeColor = $derived(getChangeColor(change));

  // Market cap calculation
  const marketCap = $derived(token.currentPrice * token.totalSupply);

  // Buy amounts
  const buyAmounts = [100, 500, 1000];

  function formatMoney(amount: number): string {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  }

  function formatMarketCap(cap: number): string {
    if (cap >= 1_000_000_000) {
      return `$${(cap / 1_000_000_000).toFixed(2)}B`;
    } else if (cap >= 1_000_000) {
      return `$${(cap / 1_000_000).toFixed(2)}M`;
    } else if (cap >= 1_000) {
      return `$${(cap / 1_000).toFixed(1)}K`;
    }
    return `$${cap.toFixed(0)}`;
  }

  function formatSupply(supply: number): string {
    if (supply >= 1_000_000_000) {
      return `${(supply / 1_000_000_000).toFixed(1)}B`;
    } else if (supply >= 1_000_000) {
      return `${(supply / 1_000_000).toFixed(0)}M`;
    }
    return supply.toLocaleString();
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
            <span class="font-mono font-semibold" style="font-size: 13px; color: #a78bfa;">${(totalInPools + tradingPosition).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.15);"></div>

          <!-- Cash Available -->
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Cash</span>
            <span class="font-mono font-semibold" style="font-size: 13px; color: #4ade80;">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <!-- Second Row: Token Info + Stats -->
      <div style="display: flex; gap: 16px;">
        <!-- Token Panel (like Ralph panel) -->
        <div class="ralph-panel" style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
          <!-- Token Info (left) -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 32px;">{token.emoji}</span>
            <div>
              <h2 class="font-chalk text-white" style="font-size: 18px; line-height: 1.2;">{token.name}</h2>
              <span class="font-mono" style="font-size: 12px; color: rgba(255,255,255,0.5);">{token.ticker}</span>
            </div>
          </div>

          <!-- Position Info (center) -->
          {#if position > 0}
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="text-align: center;">
                <span style="font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Position</span>
                <p class="font-mono font-bold" style="font-size: 14px; color: #fff;">{formatMoney(position)}</p>
              </div>
              <div style="text-align: center;">
                <span style="font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase;">P&L</span>
                <p class="font-mono font-bold" style="font-size: 14px; color: {pnlColor};">
                  {pnl >= 0 ? '+' : ''}{formatMoney(pnl)}
                </p>
              </div>
            </div>
          {/if}

          <!-- Watching Time (right) -->
          {#if playing}
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(139, 92, 246, 0.2); border-radius: 6px;">
              <span style="font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Watching</span>
              <span class="font-mono font-bold" style="font-size: 14px; color: #a78bfa;">{90 - time}s</span>
            </div>
          {/if}
        </div>

        <!-- Stats Panel -->
        <div class="stats-panel">
          <!-- Market Cap -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; color: rgba(255,255,255,0.4);">MCap</span>
            <span class="font-mono font-bold" style="font-size: 13px; color: #a78bfa;">
              {formatMarketCap(marketCap)}
            </span>
          </div>

          <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>

          <!-- Supply -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; color: rgba(255,255,255,0.4);">Supply</span>
            <span class="font-mono font-bold" style="font-size: 13px; color: rgba(255,255,255,0.7);">
              {formatSupply(token.totalSupply)}
            </span>
          </div>

          <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>

          <!-- Price Change -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; color: rgba(255,255,255,0.4);">Change</span>
            <span class="font-mono font-bold" style="font-size: 13px; color: {changeColor};">
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden" style="padding: 0 32px 32px 32px;">
      <div class="main-grid">
        <!-- Left: Chart + Controls -->
        <div class="chart-section">
          <MemeChart />

          <!-- Game Controls -->
          <div class="controls">
            {#if !playing && game.gamePhase === 'pregame'}
              <!-- Start Game -->
              <button class="btn-start" onclick={() => startMemeGame()}>
                <span class="btn-icon">🎰</span>
                <span>Start Trading</span>
              </button>
            {:else if playing}
              <!-- Trading Controls -->
              <div class="trading-controls">
                <!-- Buy Buttons -->
                <div class="buy-buttons">
                  {#each buyAmounts as amount}
                    <button
                      class="btn-buy"
                      onclick={() => buyToken(amount)}
                      disabled={cashBalance < amount}
                    >
                      Buy {formatMoney(amount)}
                    </button>
                  {/each}
                </div>

                <!-- Sell Button -->
                {#if position > 0}
                  <button class="btn-sell" onclick={() => sellAll()}>
                    <span>SELL ALL</span>
                    <span class="sell-value" style="color: {pnlColor}">
                      ({pnl >= 0 ? '+' : ''}{formatMoney(pnl)})
                    </span>
                  </button>
                {/if}
              </div>
            {:else}
              <!-- Game Over -->
              <div class="game-over">
                {#if game.gamePhase === 'rugged'}
                  <div class="result rugged">
                    <span class="result-icon">💀</span>
                    <span class="result-title">RUGGED!</span>
                    <span class="result-subtitle">The dev pulled the rug. Classic.</span>
                  </div>
                {:else if game.gamePhase === 'mooned'}
                  <div class="result mooned">
                    <span class="result-icon">🚀</span>
                    <span class="result-title">MOON MISSION!</span>
                    <span class="result-subtitle">You caught a unicorn!</span>
                  </div>
                {:else}
                  <div class="result exited">
                    <span class="result-icon">{pnl >= 0 ? '💰' : '📉'}</span>
                    <span class="result-title">{pnl >= 0 ? 'PROFIT!' : 'LOSS'}</span>
                    <span class="result-subtitle" style="color: {pnlColor}">
                      {pnl >= 0 ? '+' : ''}{formatMoney(pnl)}
                    </span>
                  </div>
                {/if}

                <button class="btn-play-again" onclick={() => playAgain()}>
                  <span>🎲</span>
                  <span>Play Again</span>
                </button>
              </div>
            {/if}
          </div>
        </div>

        <!-- Right: Social Feed -->
        <div class="feed-section">
          <SocialFeed />
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
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .mode-tab.active svg {
    opacity: 1;
    color: #a78bfa;
  }

  /* Ralph/Token panel (same as GameScreen) */
  .ralph-panel {
    padding: 10px 14px;
    background: #2d2d3a;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  /* Stats panel (same as GameScreen) */
  .stats-panel {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: #2d2d3a;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  /* Main Grid Layout */
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
    height: 100%;
  }

  @media (max-width: 1024px) {
    .main-grid {
      grid-template-columns: 1fr;
    }

    .feed-section {
      height: 300px;
    }
  }

  .chart-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }

  .feed-section {
    min-height: 400px;
  }

  /* Controls */
  .controls {
    margin-top: auto;
  }

  .btn-start {
    width: 100%;
    padding: 20px;
    font-size: 20px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .btn-start:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
  }

  .btn-icon {
    font-size: 28px;
  }

  .trading-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .buy-buttons {
    display: flex;
    gap: 10px;
  }

  .btn-buy {
    flex: 1;
    padding: 14px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-buy:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.6);
  }

  .btn-buy:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-sell {
    width: 100%;
    padding: 16px;
    font-size: 16px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s;
  }

  .btn-sell:hover {
    transform: scale(1.02);
  }

  .sell-value {
    font-family: 'JetBrains Mono', monospace;
  }

  /* Game Over */
  .game-over {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 30px;
    background: rgba(30, 30, 50, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }

  .result-icon {
    font-size: 60px;
  }

  .result-title {
    font-size: 28px;
    font-weight: 800;
    font-family: 'Space Grotesk', sans-serif;
  }

  .result.rugged .result-title { color: #ef4444; }
  .result.mooned .result-title { color: #4ade80; }

  .result-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
  }

  .btn-play-again {
    padding: 14px 28px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s;
  }

  .btn-play-again:hover {
    transform: scale(1.05);
  }
</style>
