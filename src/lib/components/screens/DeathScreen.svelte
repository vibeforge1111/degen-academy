<script lang="ts">
  import { startGame, gameState, ralphQuote, setRalphQuote } from '../../stores/gameStore.svelte';
  import { onMount } from 'svelte';

  const game = $derived(gameState.value);
  const quote = $derived(ralphQuote.value);

  onMount(() => {
    setRalphQuote('death');
  });

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function shareToTwitter() {
    const text = `☠️ I got REKT in Ralph's Degen Academy!

📊 Survived: ${formatTime(game.currentRun.elapsed)}
💰 Peak: $${game.stats.highestPortfolio.toLocaleString(undefined, { maximumFractionDigits: 0 })}
🚨 Rugs eaten: ${game.stats.rugsEaten}

Can you reach $1M without getting rugged?

🎮 Play free:`;
    const url = 'https://degen-academy.vercel.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  }
</script>

<div class="death-screen">
  <!-- Dark red overlay -->
  <div class="overlay"></div>

  <!-- Blood drip effects -->
  <div class="blood-container">
    {#each Array(14) as _, i}
      <div
        class="blood-drop"
        style="--delay: {i * 0.3}s; --x: {5 + i * 7}%"
      ></div>
    {/each}
  </div>

  <!-- Main Content -->
  <div class="content">
    <!-- Header (minimal branding) -->
    <header class="header">
      <div class="logo-section">
        <img src="/ralph-logo.png" alt="Ralph" class="logo" />
        <h1 class="title">Ralph's Degen Academy</h1>
      </div>
    </header>

    <!-- Death Content -->
    <div class="death-content">
      <!-- Skull with glow -->
      <div class="skull-container">
        <div class="skull-glow">☠️</div>
        <div class="skull">☠️</div>
      </div>

      <!-- REKT Title -->
      <h2 class="rekt-title">REKT</h2>
      <p class="rekt-subtitle">Your portfolio has been liquidated</p>

      <!-- Stats Panel -->
      <div class="stats-panel">
        <div class="panel-header">
          <span>💀</span>
          <span>Run Statistics</span>
          <span>💀</span>
        </div>

        <div class="stats-grid">
          <div class="stat-row">
            <span class="stat-label">Survival Time</span>
            <span class="stat-value">{formatTime(game.currentRun.elapsed)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Peak Portfolio</span>
            <span class="stat-value green">${game.stats.highestPortfolio.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Rugs Eaten</span>
            <span class="stat-value red">{game.stats.rugsEaten}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Halvings</span>
            <span class="stat-value amber">{game.currentRun.halvingCount}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="lifetime-stats">
          <div class="stat-row small">
            <span class="stat-label">Total Games</span>
            <span class="stat-value cyan">{game.stats.gamesPlayed}</span>
          </div>
          {#if game.stats.fastestWin}
            <div class="stat-row small">
              <span class="stat-label">Best Win Time</span>
              <span class="stat-value purple">{formatTime(game.stats.fastestWin)}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Ralph Quote Panel -->
      <div class="ralph-panel">
        <div class="ralph-border"></div>
        <div class="ralph-content">
          <p class="ralph-name">Ralph says...</p>
          <p class="ralph-quote">"{quote}"</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <button class="btn btn-primary" onclick={() => startGame()}>
          TRY AGAIN
        </button>

        <button class="btn btn-x" onclick={() => shareToTwitter()}>
          <svg class="x-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          SHARE L
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>The real rug was the lessons we learned along the way</p>
    </footer>
  </div>
</div>

<style>
  .death-screen {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background-image: url('/ralph-lab-bg.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    position: relative;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom,
      rgba(127, 29, 29, 0.7) 0%,
      rgba(15, 23, 42, 0.9) 50%,
      rgba(15, 23, 42, 0.95) 100%
    );
  }

  .blood-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .blood-drop {
    position: absolute;
    width: 5px;
    height: 30px;
    background: linear-gradient(to bottom, rgba(220, 38, 38, 0.8), rgba(185, 28, 28, 0.4), transparent);
    left: var(--x);
    top: -30px;
    animation: blood-drop 2.5s ease-in infinite;
    animation-delay: var(--delay);
    border-radius: 0 0 5px 5px;
  }

  @keyframes blood-drop {
    0% {
      transform: translateY(-20px);
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(100vh);
      opacity: 0;
    }
  }

  .content {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 32px;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 16px;
    margin-bottom: 24px;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
  }

  .title {
    font-size: 18px;
    font-weight: 700;
    color: white;
    font-family: 'Permanent Marker', cursive;
  }

  /* Death Content */
  .death-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }

  /* Skull */
  .skull-container {
    position: relative;
    margin-bottom: -8px;
  }

  .skull-glow {
    position: absolute;
    inset: 0;
    font-size: 80px;
    filter: blur(15px);
    color: rgba(239, 68, 68, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }

  .skull {
    font-size: 80px;
    position: relative;
    animation: float 2s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.5));
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }

  /* REKT Title */
  .rekt-title {
    font-size: 56px;
    font-weight: 900;
    background: linear-gradient(to bottom, #f87171, #dc2626);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px rgba(239, 68, 68, 0.5);
    font-family: 'Permanent Marker', cursive;
    margin: 0;
  }

  .rekt-subtitle {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    margin: 0 0 8px 0;
  }

  /* Stats Panel - matches game style */
  .stats-panel {
    width: 100%;
    background: #2d2d3a;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 16px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    color: rgba(239, 68, 68, 0.8);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
  }

  .stat-row.small {
    padding: 6px 12px;
    background: transparent;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .stat-value {
    font-size: 14px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: white;
  }

  .stat-value.green { color: #4ade80; }
  .stat-value.red { color: #f87171; }
  .stat-value.amber { color: #fbbf24; }
  .stat-value.cyan { color: #22d3ee; }
  .stat-value.purple { color: #a78bfa; }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 12px 0;
  }

  .lifetime-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Ralph Panel - matches game style */
  .ralph-panel {
    width: 100%;
    background: #2d2d3a;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    overflow: hidden;
  }

  .ralph-border {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #a78bfa;
  }

  .ralph-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #c026d3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    border: 2px solid rgba(167, 139, 250, 0.5);
  }

  .ralph-content {
    flex: 1;
    min-width: 0;
  }

  .ralph-name {
    font-size: 11px;
    font-weight: 700;
    color: #a78bfa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 4px 0;
  }

  .ralph-quote {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    font-family: 'Permanent Marker', cursive;
    margin: 0;
    line-height: 1.4;
  }

  /* Action Buttons */
  .actions {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(220, 38, 38, 0.5);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .btn-secondary {
    background: #2d2d3a;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn-secondary:hover {
    background: #3d3d4a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .x-icon {
    width: 16px;
    height: 16px;
  }

  /* Footer */
  .footer {
    text-align: center;
    padding: 16px 0;
  }

  .footer p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.3);
    font-family: 'Permanent Marker', cursive;
    margin: 0;
  }
</style>
