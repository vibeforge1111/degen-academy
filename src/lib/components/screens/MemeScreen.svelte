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
    rugProbability,
    priceChange,
    startMemeGame,
    buyToken,
    sellAll,
    playAgain,
    formatPrice,
    getChangeColor,
  } from '../../stores/memeStore.svelte';
  import { portfolio, setScreen } from '../../stores/gameStore.svelte';

  const game = $derived(memeGame.value);
  const playing = $derived(isMemePlaying.value);
  const token = $derived(currentToken.value);
  const position = $derived(playerPosition.value);
  const pnl = $derived(playerPnL.value);
  const time = $derived(timeRemaining.value);
  const rugChance = $derived(rugProbability.value);
  const change = $derived(priceChange.value);
  const mainPortfolio = $derived(portfolio.value);

  const pnlColor = $derived(pnl >= 0 ? '#4ade80' : '#ef4444');
  const changeColor = $derived(getChangeColor(change));

  // Buy amounts
  const buyAmounts = [100, 500, 1000];

  function formatMoney(amount: number): string {
    if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  }
</script>

<div class="meme-screen">
  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <!-- Mode Switcher -->
      <div class="mode-switcher">
        <button class="mode-tab" onclick={() => setScreen('game')}>
          <span>📊</span>
          <span>Yield Farms</span>
        </button>
        <button class="mode-tab active">
          <span>📈</span>
          <span>Meme Coins</span>
        </button>
      </div>

      <!-- Token Info -->
      <div class="token-info">
        <span class="token-emoji">{token.emoji}</span>
        <div class="token-details">
          <h1 class="token-name">{token.name}</h1>
          <span class="token-ticker">{token.ticker}</span>
        </div>
      </div>
    </div>

    <div class="header-stats">
      {#if playing}
        <!-- Timer -->
        <div class="stat-box timer" class:urgent={time < 20}>
          <span class="stat-label">TIME</span>
          <span class="stat-value">{time}s</span>
        </div>

        <!-- Rug Risk Meter -->
        <div class="stat-box risk" class:high={rugChance > 50} class:critical={rugChance > 75}>
          <span class="stat-label">RUG RISK</span>
          <div class="risk-bar">
            <div class="risk-fill" style="width: {Math.min(rugChance, 100)}%"></div>
          </div>
          <span class="stat-value">{rugChance.toFixed(0)}%</span>
        </div>
      {/if}

      <!-- Wallet -->
      <div class="stat-box wallet">
        <span class="stat-label">WALLET</span>
        <span class="stat-value">{formatMoney(mainPortfolio)}</span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <!-- Left: Chart -->
    <div class="chart-section">
      <MemeChart />

      <!-- Position Info -->
      {#if position > 0}
        <div class="position-box">
          <div class="position-row">
            <span class="position-label">Your Position</span>
            <span class="position-value">{formatMoney(position)}</span>
          </div>
          <div class="position-row">
            <span class="position-label">P&L</span>
            <span class="position-value" style="color: {pnlColor}">
              {pnl >= 0 ? '+' : ''}{formatMoney(pnl)}
              ({pnl >= 0 ? '+' : ''}{((pnl / position) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      {/if}

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
                  disabled={mainPortfolio < amount}
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
  </main>
</div>

<style>
  .meme-screen {
    min-height: 100vh;
    min-height: 100dvh;
    background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
    display: flex;
    flex-direction: column;
    padding: 20px;
  }

  /* Mode Switcher */
  .mode-switcher {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #1e1e2e;
    border-radius: 10px;
  }

  .mode-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mode-tab:hover:not(.active) {
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.05);
  }

  .mode-tab.active {
    color: white;
    background: #8b5cf6;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .token-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .token-emoji {
    font-size: 40px;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(167, 139, 250, 0.2);
    border-radius: 12px;
  }

  .token-details {
    display: flex;
    flex-direction: column;
  }

  .token-name {
    font-size: 24px;
    font-weight: 700;
    color: white;
    font-family: 'Space Grotesk', sans-serif;
  }

  .token-ticker {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'JetBrains Mono', monospace;
  }

  .header-stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 16px;
    background: rgba(30, 30, 50, 0.8);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 80px;
  }

  .stat-label {
    font-size: 9px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: white;
    font-family: 'JetBrains Mono', monospace;
  }

  .timer.urgent {
    border-color: rgba(239, 68, 68, 0.5);
    animation: pulse-urgent 0.5s ease-in-out infinite;
  }

  @keyframes pulse-urgent {
    0%, 100% { background: rgba(239, 68, 68, 0.2); }
    50% { background: rgba(239, 68, 68, 0.4); }
  }

  .risk {
    min-width: 100px;
  }

  .risk-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin: 4px 0;
    overflow: hidden;
  }

  .risk-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #f59e0b, #ef4444);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .risk.high .stat-value { color: #f59e0b; }
  .risk.critical .stat-value { color: #ef4444; }
  .risk.critical { border-color: rgba(239, 68, 68, 0.5); }

  /* Main Content */
  .main-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 20px;
    min-height: 0;
  }

  @media (max-width: 900px) {
    .main-content {
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
  }

  .feed-section {
    min-height: 400px;
  }

  /* Position Box */
  .position-box {
    background: rgba(30, 30, 50, 0.8);
    border-radius: 12px;
    border: 1px solid rgba(167, 139, 250, 0.3);
    padding: 16px;
  }

  .position-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .position-row:not(:last-child) {
    margin-bottom: 8px;
  }

  .position-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .position-value {
    font-size: 16px;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    color: white;
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
