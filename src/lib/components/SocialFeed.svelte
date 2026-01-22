<script lang="ts">
  import { socialPosts } from '../stores/memeStore.svelte';
  import type { MemeEventType } from '../../types/meme';

  const posts = $derived(socialPosts.value);

  // Event type colors (simplified)
  function getEventColor(type: MemeEventType): string {
    switch (type) {
      case 'whale_buy':
      case 'exchange_listing':
      case 'partnership':
      case 'celebrity_mention':
      case 'kol_shill':
      case 'dev_update':
      case 'organic_pump':
      case 'diamond_hands':
        return '#22c55e'; // Green

      case 'whale_dump':
      case 'rug_pull':
      case 'hack_rumor':
      case 'liquidity_remove':
      case 'kol_fud':
      case 'organic_dump':
      case 'paper_hands':
        return '#ef4444'; // Red

      case 'newbie_fomo':
      case 'airdrop_rumor':
        return '#a78bfa'; // Purple

      default:
        return '#6b7280'; // Gray
    }
  }

  function formatTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'now';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  }
</script>

<div class="feed-container">
  <div class="feed-header">
    <span class="feed-title">Live Feed</span>
    <span class="live-dot"></span>
  </div>

  <div class="posts-list">
    {#each posts as post (post.id)}
      <div class="post" style="border-left-color: {getEventColor(post.eventType)}">
        <div class="post-top">
          <span class="author">{post.author.name}</span>
          <span class="time">{formatTime(post.timestamp)}</span>
        </div>
        <p class="content">{post.content}</p>
      </div>
    {/each}

    {#if posts.length === 0}
      <div class="empty">Waiting for activity...</div>
    {/if}
  </div>
</div>

<style>
  .feed-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 240px;
    background: rgba(19, 23, 34, 0.8);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  .feed-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.2);
  }

  .feed-title {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    background: #ef4444;
    border-radius: 50%;
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .posts-list {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .post {
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 4px;
    border-left: 2px solid;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .post-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }

  .author {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
  }

  .time {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.3);
  }

  .content {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.3;
    word-break: break-word;
  }

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    color: rgba(255, 255, 255, 0.3);
    font-size: 11px;
  }

  /* Compact scrollbar */
  .posts-list::-webkit-scrollbar {
    width: 4px;
  }

  .posts-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .posts-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
</style>
