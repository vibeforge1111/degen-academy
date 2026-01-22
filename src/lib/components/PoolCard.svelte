<script lang="ts">
  import {
    deposit, withdrawAll, gasMultiplier, portfolio, halvingMultiplier, gameState,
    buyAudit, toggleLeverage, getAuditCost, getConcentrationPenalty, getLeveragedPool,
    getTotalDeposited
  } from '../stores/gameStore.svelte';
  import { GAME_CONSTANTS } from '../../data/constants';
  import type { Pool } from '../../types/game';

  interface Props {
    pool: Pool;
  }

  let { pool }: Props = $props();

  const gasMult = $derived(gasMultiplier.value);
  const portfolioVal = $derived(portfolio.value);
  const halvingMult = $derived(halvingMultiplier.value);
  const game = $derived(gameState.value);

  const depositAmount = 1000;
  const depositCost = $derived(depositAmount * gasMult);
  const canDeposit = $derived(!pool.isRugged && portfolioVal >= depositCost);
  const canWithdraw = $derived(!pool.isRugged && pool.deposited > 0);

  // New competitive economy
  const auditCost = $derived(getAuditCost(pool));
  const canAffordAudit = $derived(
    !pool.isRugged &&
    pool.deposited > 0 &&
    !pool.hasAudit &&
    portfolioVal >= auditCost
  );
  const concentrationPenalty = $derived(getConcentrationPenalty(pool));
  const hasConcentrationRisk = $derived(concentrationPenalty > 0);
  const leveragedPool = $derived(getLeveragedPool());
  const canToggleLeverage = $derived(
    !pool.isRugged &&
    pool.deposited > 0 &&
    (pool.isLeveraged || !leveragedPool)
  );
  const totalDeposited = $derived(getTotalDeposited());
  const poolShare = $derived(totalDeposited > 0 ? (pool.deposited / totalDeposited * 100) : 0);

  const riskConfig = {
    safe: { label: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
    medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
    degen: { label: 'High Risk', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40' },
  };

  const config = $derived(riskConfig[pool.riskLevel]);

  const tvl = $derived(Math.floor(1000000 / (pool.apy / 100 + 1)));

  // Calculate yield per second for this pool
  const yieldPerSecond = $derived(() => {
    if (pool.isRugged || pool.deposited <= 0) return 0;
    let yps = pool.deposited * (pool.apy / 100) / 365 / 24 / 60 / 60;
    yps *= GAME_CONSTANTS.YIELD_SPEED_MULTIPLIER;
    yps *= halvingMult;
    if (pool.isPumping) yps *= GAME_CONSTANTS.PUMP_MULTIPLIER;
    if (game.whaleEndTime && Date.now() < game.whaleEndTime) {
      const reduction = game.items.insurance > 0
        ? GAME_CONSTANTS.WHALE_YIELD_REDUCTION * GAME_CONSTANTS.INSURANCE_DAMAGE_REDUCTION
        : GAME_CONSTANTS.WHALE_YIELD_REDUCTION;
      yps *= (1 - reduction);
    }
    return yps;
  });

  function formatTVL(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
  }

  function formatYieldPerSec(yps: number): string {
    if (yps >= 1000) return `+$${(yps / 1000).toFixed(1)}K/s`;
    if (yps >= 1) return `+$${yps.toFixed(0)}/s`;
    if (yps > 0) return `+$${yps.toFixed(2)}/s`;
    return '$0/s';
  }

  function formatMoney(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  }
</script>

<div
  class="w-full rounded-xl border transition-all duration-200
         {pool.isRugged ? 'opacity-50 border-white/5' : 'border-white/5 hover:border-white/10'}
         {pool.isPumping ? 'border-emerald-500/30' : ''}"
  style="padding: 20px 24px; background: #2d2d3a;"
>
  <!-- Header Row -->
  <div class="flex items-center justify-between" style="margin-bottom: 16px;">
    <!-- Token Info -->
    <div class="flex items-center" style="gap: 12px;">
      <div class="rounded-lg flex items-center justify-center" style="width: 40px; height: 40px; font-size: 20px; background: #383848;">
        {pool.emoji}
      </div>
      <div>
        <div class="flex items-center" style="gap: 6px;">
          <h3 class="font-semibold text-white" style="font-size: 14px;">{pool.name}</h3>
          <!-- Status badges -->
          {#if pool.hasAudit}
            <span class="audit-badge" title="Audit Shield Active">🛡️</span>
          {/if}
          {#if pool.isLeveraged}
            <span class="leverage-badge" title="2x Leverage Active">⚡</span>
          {/if}
        </div>
        <p class="text-white/40" style="font-size: 11px;">/ USDC</p>
      </div>
    </div>

    <!-- Risk Badge + Concentration Warning -->
    <div class="flex items-center" style="gap: 6px;">
      {#if hasConcentrationRisk}
        <span class="concentration-badge" title="+{(concentrationPenalty * 100).toFixed(0)}% rug risk!">
          ⚠️ {poolShare.toFixed(0)}%
        </span>
      {/if}
      <span class="font-medium rounded-md border {config.bg} {config.color} {config.border}" style="padding: 5px 10px; font-size: 10px;">
        {config.label}
      </span>
    </div>
  </div>

  <!-- Stats Row -->
  <div class="flex items-center" style="gap: 28px; margin-bottom: 16px;">
    <!-- APR -->
    <div>
      <p class="text-white/40 uppercase tracking-wider" style="font-size: 9px; margin-bottom: 4px;">APR</p>
      <p class="font-mono font-bold text-white" style="font-size: 24px;">
        {pool.apy}%
        {#if pool.isPumping}
          <span class="text-emerald-400" style="font-size: 14px; margin-left: 4px;">🔥</span>
        {/if}
      </p>
    </div>

    <!-- TVL -->
    <div>
      <p class="text-white/40 uppercase tracking-wider" style="font-size: 9px; margin-bottom: 4px;">TVL</p>
      <p class="font-mono text-white/60" style="font-size: 16px;">{formatTVL(tvl)}</p>
    </div>
  </div>

  <!-- Your Position Box -->
  <div class="rounded-lg" style="padding: 12px 14px; margin-bottom: 16px; background: #252532;">
    <div class="flex items-center justify-between" style="margin-bottom: 4px;">
      <span class="text-white/40" style="font-size: 12px;">Your Position</span>
      <span class="font-mono text-white font-semibold" style="font-size: 14px;">
        ${pool.deposited.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        {#if pool.isLeveraged}
          <span class="text-amber-400" style="font-size: 10px;">(2x)</span>
        {/if}
      </span>
    </div>
    {#if pool.deposited > 0 && !pool.isRugged}
      <div class="flex items-center justify-between">
        <span class="text-white/30" style="font-size: 10px;">
          Earning
          {#if pool.isLeveraged}
            <span class="text-amber-400">(2x)</span>
          {/if}
        </span>
        <span class="font-mono font-medium" style="font-size: 12px; color: {pool.isLeveraged ? '#fbbf24' : '#4ade80'};">
          {formatYieldPerSec(yieldPerSecond())}
        </span>
      </div>
    {/if}
  </div>

  <!-- Action Buttons -->
  {#if !pool.isRugged}
    <!-- Primary Actions -->
    <div class="flex" style="gap: 10px; margin-bottom: 10px;">
      <!-- Deposit Button -->
      <button
        onclick={() => deposit(pool.id, depositAmount)}
        disabled={!canDeposit}
        class="neu-btn flex-1 font-semibold text-white/90"
        class:disabled={!canDeposit}
      >
        Deposit +$1K
      </button>

      <!-- Withdraw Button -->
      <button
        onclick={() => withdrawAll(pool.id)}
        disabled={!canWithdraw}
        class="neu-btn flex-1 font-semibold text-white/70"
        class:disabled={!canWithdraw}
      >
        Withdraw
      </button>
    </div>

    <!-- Pool-Specific Actions (only show when has position) -->
    {#if pool.deposited > 0}
      <div class="flex" style="gap: 10px;">
        <!-- Audit Shield Button (10% of pool value) -->
        <button
          onclick={() => buyAudit(pool.id)}
          disabled={!canAffordAudit}
          class="pool-action-btn flex-1"
          class:disabled={!canAffordAudit}
          class:active={pool.hasAudit}
        >
          <span>🛡️</span>
          {#if pool.hasAudit}
            <span class="text-emerald-400 font-semibold">Protected</span>
          {:else}
            <span>Audit</span>
            <span class="text-white/40">{formatMoney(auditCost)}</span>
          {/if}
        </button>

        <!-- Leverage Toggle (2x yields & risk) -->
        <button
          onclick={() => toggleLeverage(pool.id)}
          disabled={!canToggleLeverage}
          class="pool-action-btn flex-1"
          class:disabled={!canToggleLeverage}
          class:leverage={pool.isLeveraged}
        >
          <span>⚡</span>
          {#if pool.isLeveraged}
            <span class="text-amber-400 font-semibold">2x ON</span>
          {:else if leveragedPool}
            <span class="text-white/30">In Use</span>
          {:else}
            <span>Leverage</span>
            <span class="text-white/40">FREE</span>
          {/if}
        </button>
      </div>
    {/if}
  {:else}
    <div class="rounded-lg text-center" style="padding: 12px 16px; background: rgba(239,68,68,0.1);">
      <p class="text-red-400 font-semibold flex items-center justify-center gap-2" style="font-size: 12px;">
        <span>⚠️</span> Pool Rugged
      </p>
    </div>
  {/if}
</div>

<style>
  .neu-btn {
    padding: 12px 16px;
    font-size: 13px;
    background: #3a3a4a;
    border: none;
    border-radius: 10px;
    box-shadow: 3px 3px 6px #1e1e28, -2px -2px 5px #4a4a5a;
    transition: all 0.15s ease;
    cursor: pointer;
  }

  .neu-btn:hover:not(.disabled) {
    box-shadow: 2px 2px 4px #1e1e28, -1px -1px 3px #4a4a5a;
  }

  .neu-btn:active:not(.disabled) {
    box-shadow: inset 3px 3px 6px #1e1e28, inset -2px -2px 5px #4a4a5a;
  }

  .neu-btn.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Pool-specific action buttons */
  .pool-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 11px;
    background: #2a2a38;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    transition: all 0.15s ease;
    cursor: pointer;
    color: rgba(255,255,255,0.8);
  }

  .pool-action-btn:hover:not(.disabled) {
    background: #353545;
    border-color: rgba(255,255,255,0.2);
  }

  .pool-action-btn.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .pool-action-btn.active {
    background: rgba(74, 222, 128, 0.15);
    border-color: rgba(74, 222, 128, 0.3);
  }

  .pool-action-btn.leverage {
    background: rgba(251, 191, 36, 0.15);
    border-color: rgba(251, 191, 36, 0.3);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  /* Status badges */
  .audit-badge {
    font-size: 12px;
    filter: drop-shadow(0 0 4px rgba(74, 222, 128, 0.5));
  }

  .leverage-badge {
    font-size: 12px;
    filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
    animation: pulse 1.5s ease-in-out infinite;
  }

  .concentration-badge {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 600;
    background: rgba(248, 113, 113, 0.15);
    border: 1px solid rgba(248, 113, 113, 0.3);
    border-radius: 6px;
    color: #f87171;
  }
</style>
