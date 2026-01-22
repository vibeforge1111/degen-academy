<script lang="ts">
  import { priceHistory, currentPrice, priceChange, getChangeColor, formatPrice } from '../stores/memeStore.svelte';

  const history = $derived(priceHistory.value);
  const price = $derived(currentPrice.value);
  const change = $derived(priceChange.value);
  const changeColor = $derived(getChangeColor(change));

  // Chart dimensions
  const chartWidth = 100;
  const chartHeight = 70;
  const padding = { top: 2, right: 12, bottom: 8, left: 2 };

  // Calculate price range
  const priceRange = $derived(() => {
    if (history.length < 2) return { min: 0, max: 1, range: 1 };
    const prices = history;
    const min = Math.min(...prices) * 0.98;
    const max = Math.max(...prices) * 1.02;
    return { min, max, range: max - min || 1 };
  });

  // Calculate Y position for a price
  function getY(price: number): number {
    const { min, range } = priceRange();
    const chartInnerHeight = chartHeight - padding.top - padding.bottom;
    return padding.top + chartInnerHeight - ((price - min) / range) * chartInnerHeight;
  }

  // Calculate X position for an index
  function getX(index: number, total: number): number {
    const chartInnerWidth = chartWidth - padding.left - padding.right;
    return padding.left + (index / Math.max(total - 1, 1)) * chartInnerWidth;
  }

  // Line path
  const linePath = $derived(() => {
    if (history.length < 2) return '';
    return history.map((p, i) => {
      const x = getX(i, history.length);
      const y = getY(p);
      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    }).join(' ');
  });

  // Fill path (area under line)
  const fillPath = $derived(() => {
    if (history.length < 2) return '';
    const points = history.map((p, i) => {
      const x = getX(i, history.length);
      const y = getY(p);
      return `${x},${y}`;
    });
    const startX = getX(0, history.length);
    const endX = getX(history.length - 1, history.length);
    const bottomY = chartHeight - padding.bottom;
    return `M ${startX},${bottomY} L ${points.join(' L ')} L ${endX},${bottomY} Z`;
  });

  // Price levels for grid (4 levels)
  const priceLevels = $derived(() => {
    const { min, max } = priceRange();
    const levels = [];
    for (let i = 0; i <= 3; i++) {
      const price = min + (max - min) * (i / 3);
      levels.push({ price, y: getY(price) });
    }
    return levels;
  });

  // Generate volume bars (fake but realistic looking)
  const volumeBars = $derived(() => {
    const bars = [];
    const numBars = Math.min(history.length, 30);
    for (let i = 0; i < numBars; i++) {
      const priceIdx = Math.floor((i / numBars) * history.length);
      const prevIdx = Math.max(0, priceIdx - 1);
      const isUp = history[priceIdx] >= history[prevIdx];
      const height = 20 + Math.random() * 60;
      bars.push({ isUp, height });
    }
    return bars;
  });

  // Format price for axis
  function formatAxisPrice(p: number): string {
    if (p >= 0.01) return p.toFixed(4);
    if (p >= 0.0001) return p.toFixed(6);
    return p.toFixed(8);
  }
</script>

<div class="chart-wrapper">
  <!-- Main Chart Area -->
  <div class="chart-main">
    <svg viewBox="0 0 {chartWidth} {chartHeight}" preserveAspectRatio="none" class="chart-svg">
      <defs>
        <!-- Gradient for fill -->
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color: {changeColor}; stop-opacity: 0.3" />
          <stop offset="100%" style="stop-color: {changeColor}; stop-opacity: 0.02" />
        </linearGradient>
        <!-- Glow filter -->
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Grid lines -->
      <g class="grid">
        {#each priceLevels() as level, i}
          <line
            x1={padding.left}
            y1={level.y}
            x2={chartWidth - padding.right}
            y2={level.y}
            stroke="rgba(255,255,255,0.06)"
            stroke-width="0.3"
          />
        {/each}
        <!-- Vertical grid lines -->
        {#each [0.25, 0.5, 0.75] as ratio}
          <line
            x1={padding.left + (chartWidth - padding.left - padding.right) * ratio}
            y1={padding.top}
            x2={padding.left + (chartWidth - padding.left - padding.right) * ratio}
            y2={chartHeight - padding.bottom}
            stroke="rgba(255,255,255,0.04)"
            stroke-width="0.3"
          />
        {/each}
      </g>

      <!-- Fill area -->
      <path
        d={fillPath()}
        fill="url(#areaGradient)"
      />

      <!-- Price line -->
      <path
        d={linePath()}
        fill="none"
        stroke={changeColor}
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#lineGlow)"
      />

      <!-- Current price dot -->
      {#if history.length > 0}
        {@const lastY = getY(history[history.length - 1])}
        {@const lastX = getX(history.length - 1, history.length)}
        <circle
          cx={lastX}
          cy={lastY}
          r="1.5"
          fill={changeColor}
          class="price-dot"
        />
        <!-- Current price line -->
        <line
          x1={lastX}
          y1={lastY}
          x2={chartWidth - padding.right + 1}
          y2={lastY}
          stroke={changeColor}
          stroke-width="0.5"
          stroke-dasharray="1,1"
          opacity="0.6"
        />
      {/if}
    </svg>

    <!-- Price scale on right -->
    <div class="price-scale">
      {#each priceLevels() as level, i}
        <span
          class="price-label"
          style="top: {(level.y / chartHeight) * 100}%"
        >
          {formatAxisPrice(level.price)}
        </span>
      {/each}
      <!-- Current price badge -->
      {#if history.length > 0}
        {@const lastY = getY(history[history.length - 1])}
        <span
          class="current-price-badge"
          style="top: {(lastY / chartHeight) * 100}%; background: {changeColor}"
        >
          {formatAxisPrice(price)}
        </span>
      {/if}
    </div>
  </div>

  <!-- Volume bars -->
  <div class="volume-section">
    {#each volumeBars() as bar, i}
      <div
        class="vol-bar"
        style="
          height: {bar.height}%;
          background: {bar.isUp ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.4)'};
        "
      ></div>
    {/each}
  </div>
</div>

<style>
  .chart-wrapper {
    width: 100%;
    height: 100%;
    min-height: 200px;
    background: #131722;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chart-main {
    flex: 1;
    position: relative;
    min-height: 0;
  }

  .chart-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .price-scale {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 20px;
    width: 52px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    padding: 4px 0;
  }

  .price-label {
    position: absolute;
    right: 4px;
    transform: translateY(-50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: rgba(255, 255, 255, 0.4);
    text-align: right;
  }

  .current-price-badge {
    position: absolute;
    right: 2px;
    transform: translateY(-50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    font-weight: 600;
    color: #131722;
    padding: 1px 3px;
    border-radius: 2px;
    white-space: nowrap;
  }

  .price-dot {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .volume-section {
    height: 28px;
    display: flex;
    align-items: flex-end;
    gap: 1px;
    padding: 0 4px 4px 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.2);
  }

  .vol-bar {
    flex: 1;
    min-width: 2px;
    border-radius: 1px 1px 0 0;
    transition: height 0.2s ease;
  }
</style>
