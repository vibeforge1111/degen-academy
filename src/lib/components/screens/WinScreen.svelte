<script lang="ts">
  import { startGame, gameState, ralphQuote, setRalphQuote } from '../../stores/gameStore.svelte';
  import { GAME_CONSTANTS } from '../../../data/constants';
  import { onMount } from 'svelte';

  const game = $derived(gameState.value);
  const quote = $derived(ralphQuote.value);

  onMount(() => {
    setRalphQuote('victory');
  });

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const isNewRecord = $derived(game.stats.fastestWin === game.currentRun.elapsed);

  function shareToTwitter() {
    const recordText = isNewRecord ? '🏆 NEW RECORD!\n\n' : '';
    const text = `🎓 I GRADUATED from Ralph's Degen Academy!

${recordText}⏱️ Time: ${formatTime(game.currentRun.elapsed)}
💰 Final: $${game.portfolio.toLocaleString(undefined, { maximumFractionDigits: 0 })}
🚨 Rugs survived: ${game.stats.rugsEaten}

I turned $10K into $1M without getting rugged!

🎮 Can you do it?`;
    const url = 'https://degen-academy.vercel.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  }
</script>

<div class="win-screen">
  <!-- Victory gradient overlay -->
  <div class="overlay"></div>

  <!-- Confetti Effect -->
  <div class="confetti-container">
    {#each Array(30) as _, i}
      <div
        class="confetti"
        style="--delay: {Math.random() * 5}s; --x: {Math.random() * 100}vw; --duration: {3 + Math.random() * 3}s; --color: {['#a855f7', '#22d3ee', '#facc15', '#22c55e', '#f472b6'][i % 5]}"
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

    <!-- Win Content -->
    <div class="win-content">
      <!-- Trophy with glow -->
      <div class="trophy-container">
        <div class="trophy-glow">🏆</div>
        <div class="trophy">🏆</div>
      </div>

      <!-- GRADUATED Title -->
      <h2 class="win-title">GRADUATED!</h2>
      <p class="win-subtitle">You reached ${GAME_CONSTANTS.WIN_PORTFOLIO.toLocaleString()}!</p>

      {#if isNewRecord}
        <div class="record-badge">
          <span>🎉</span> NEW RECORD TIME! <span>🎉</span>
        </div>
      {/if}

      <!-- Stats Panel -->
      <div class="stats-panel">
        <div class="panel-header">
          <span>🎓</span>
          <span>Graduation Stats</span>
          <span>🎓</span>
        </div>

        <div class="stats-grid">
          <div class="stat-row highlight">
            <span class="stat-label">Time to Graduate</span>
            <span class="stat-value cyan">{formatTime(game.currentRun.elapsed)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Final Portfolio</span>
            <span class="stat-value green">${game.portfolio.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Peak Portfolio</span>
            <span class="stat-value purple">${game.stats.highestPortfolio.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Rugs Survived</span>
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
            <span class="stat-label">Total Wins</span>
            <span class="stat-value cyan">{game.stats.gamesPlayed}</span>
          </div>
          {#if game.stats.fastestWin}
            <div class="stat-row small">
              <span class="stat-label">Best Time</span>
              <span class="stat-value purple">{formatTime(game.stats.fastestWin)}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Ralph Quote Panel -->
      <div class="ralph-panel">
        <div class="ralph-border"></div>
        <div class="ralph-avatar">
          <span>🐕</span>
        </div>
        <div class="ralph-content">
          <p class="ralph-name">Ralph</p>
          <p class="ralph-quote">"{quote}"</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <button class="btn btn-primary" onclick={() => startGame()}>
          <span>🚀</span>
          PLAY AGAIN
        </button>

        <button class="btn btn-secondary" onclick={() => shareToTwitter()}>
          <svg class="x-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          SHARE W
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>True degen: completing the game and immediately starting over</p>
    </footer>
  </div>
</div>

<style>
  .win-screen {
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
      rgba(88, 28, 135, 0.6) 0%,
      rgba(15, 23, 42, 0.85) 50%,
      rgba(6, 78, 59, 0.5) 100%
    );
  }

  .confetti-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--color);
    left: var(--x);
    top: -20px;
    animation: confetti-fall var(--duration) linear infinite;
    animation-delay: var(--delay);
    border-radius: 2px;
  }

  .confetti:nth-child(odd) {
    width: 8px;
    height: 12px;
  }

  .confetti:nth-child(3n) {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(-20px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
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

  /* Win Content */
  .win-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }

  /* Trophy */
  .trophy-container {
    position: relative;
    margin-bottom: 8px;
  }

  .trophy-glow {
    position: absolute;
    inset: 0;
    font-size: 80px;
    filter: blur(20px);
    color: rgba(251, 191, 36, 0.5);
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .trophy {
    font-size: 80px;
    position: relative;
    animation: trophy-glow 2s ease-in-out infinite;
  }

  @keyframes trophy-glow {
    0%, 100% { filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5)); }
    50% { filter: drop-shadow(0 0 40px rgba(34, 211, 238, 0.8)); }
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }

  /* Win Title */
  .win-title {
    font-size: 48px;
    font-weight: 900;
    background: linear-gradient(135deg, #a855f7, #ec4899, #22d3ee);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'Permanent Marker', cursive;
    margin: 0;
    animation: gradient-shift 3s ease infinite;
  }

  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .win-subtitle {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin: 0;
  }

  .record-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(251, 191, 36, 0.15);
    border: 1px solid rgba(251, 191, 36, 0.4);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    color: #fbbf24;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
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
    color: rgba(168, 85, 247, 0.8);
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

  .stat-row.highlight {
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.2);
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
    background: linear-gradient(to bottom, #a855f7, #ec4899, #22d3ee);
  }

  .ralph-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #eab308);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    border: 2px solid rgba(251, 191, 36, 0.5);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
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
    background: linear-gradient(135deg, #a855f7, #ec4899);
    color: white;
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #c084fc, #f472b6);
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(168, 85, 247, 0.5);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .btn-secondary {
    background: linear-gradient(135deg, #0891b2, #0284c7);
    color: white;
    box-shadow: 0 4px 20px rgba(8, 145, 178, 0.4);
  }

  .btn-secondary:hover {
    background: linear-gradient(135deg, #22d3ee, #38bdf8);
    transform: translateY(-2px);
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
