<script lang="ts">
  import { priceHistory, currentPrice, priceChange, getChangeColor, formatPrice, formatPriceChange } from '../stores/memeStore.svelte';

  const history = $derived(priceHistory.value);
  const price = $derived(currentPrice.value);
  const change = $derived(priceChange.value);
  const changeColor = $derived(getChangeColor(change));

  // Chart dimensions
  const width = 100;
  const height = 60;
  const padding = 2;

  // Calculate path from price history
  const chartPath = $derived(() => {
    if (history.length < 2) return '';

    const prices = history;
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;
    const priceRange = maxPrice - minPrice || 1;

    const points = prices.map((p, i) => {
      const x = padding + (i / (prices.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p - minPrice) / priceRange) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  });

  // Fill area under line
  const fillPath = $derived(() => {
    if (history.length < 2) return '';

    const prices = history;
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;
    const priceRange = maxPrice - minPrice || 1;

    const points = prices.map((p, i) => {
      const x = padding + (i / (prices.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p - minPrice) / priceRange) * (height - padding * 2);
      return `${x},${y}`;
    });

    const firstX = padding;
    const lastX = padding + ((prices.length - 1) / (prices.length - 1)) * (width - padding * 2);

    return `M ${firstX},${height - padding} L ${points.join(' L ')} L ${lastX},${height - padding} Z`;
  });
</script>

<div class="chart-container">
  <!-- Price Display -->
  <div class="price-display">
    <span class="current-price">{formatPrice(price)}</span>
    <span class="price-change" style="color: {changeColor}">
      {formatPriceChange(change)}
    </span>
  </div>

  <!-- SVG Chart -->
  <svg viewBox="0 0 {width} {height}" preserveAspectRatio="none" class="chart-svg">
    <!-- Gradient definition -->
    <defs>
      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color: {changeColor}; stop-opacity: 0.4" />
        <stop offset="100%" style="stop-color: {changeColor}; stop-opacity: 0.05" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Grid lines -->
    <g class="grid-lines">
      {#each [0.25, 0.5, 0.75] as ratio}
        <line
          x1={padding}
          y1={height * ratio}
          x2={width - padding}
          y2={height * ratio}
          stroke="rgba(255,255,255,0.1)"
          stroke-dasharray="2,2"
        />
      {/each}
    </g>

    <!-- Fill area -->
    <path
      d={fillPath()}
      fill="url(#chartGradient)"
      class="chart-fill"
    />

    <!-- Line -->
    <path
      d={chartPath()}
      fill="none"
      stroke={changeColor}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      filter="url(#glow)"
      class="chart-line"
    />

    <!-- Current price dot -->
    {#if history.length > 0}
      {@const lastPrice = history[history.length - 1]}
      {@const minPrice = Math.min(...history) * 0.95}
      {@const maxPrice = Math.max(...history) * 1.05}
      {@const priceRange = maxPrice - minPrice || 1}
      {@const dotX = width - padding}
      {@const dotY = height - padding - ((lastPrice - minPrice) / priceRange) * (height - padding * 2)}
      <circle
        cx={dotX}
        cy={dotY}
        r="2.5"
        fill={changeColor}
        filter="url(#glow)"
        class="price-dot"
      />
    {/if}
  </svg>

  <!-- Candle-style indicators at bottom -->
  <div class="volume-bars">
    {#each { length: 20 } as _, i}
      {@const isActive = i < Math.min(history.length / 5, 20)}
      {@const randomHeight = 20 + Math.random() * 80}
      <div
        class="volume-bar"
        style="
          height: {isActive ? randomHeight : 10}%;
          background: {isActive ? (change > 0 ? 'rgba(74, 222, 128, 0.6)' : 'rgba(239, 68, 68, 0.6)') : 'rgba(255,255,255,0.1)'};
        "
      ></div>
    {/each}
  </div>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 320px;
    background: linear-gradient(180deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .price-display {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
  }

  .current-price {
    font-family: 'JetBrains Mono', monospace;
    font-size: 28px;
    font-weight: 700;
    color: white;
  }

  .price-change {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 600;
  }

  .chart-svg {
    flex: 1;
    width: 100%;
    min-height: 0;
  }

  .chart-line {
    transition: stroke 0.3s ease;
  }

  .chart-fill {
    transition: fill 0.3s ease;
  }

  .price-dot {
    animation: pulse-dot 1s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; r: 2.5; }
    50% { opacity: 0.7; r: 3.5; }
  }

  .volume-bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 30px;
    margin-top: 8px;
  }

  .volume-bar {
    flex: 1;
    border-radius: 2px;
    transition: height 0.3s ease, background 0.3s ease;
  }
</style>
