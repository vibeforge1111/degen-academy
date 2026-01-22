<script lang="ts">
  import { socialPosts } from '../stores/memeStore.svelte';
  import type { SocialPost, MemeEventType } from '../../types/meme';

  const posts = $derived(socialPosts.value);

  // Event type styling
  function getEventStyle(type: MemeEventType): { bg: string; border: string; icon: string } {
    switch (type) {
      case 'whale_buy':
      case 'exchange_listing':
      case 'partnership':
      case 'celebrity_mention':
      case 'team_doxx':
      case 'airdrop_rumor':
        return { bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.3)', icon: '🟢' };

      case 'whale_dump':
      case 'rug_pull':
      case 'hack_rumor':
      case 'liquidity_remove':
      case 'black_swan':
      case 'regulatory_fud':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', icon: '🔴' };

      case 'kol_shill':
      case 'dev_update':
      case 'organic_pump':
      case 'diamond_hands':
      case 'newbie_fomo':
        return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', icon: '📈' };

      case 'kol_fud':
      case 'dev_rug_signal':
      case 'organic_dump':
      case 'paper_hands':
      case 'competitor_fud':
        return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', icon: '📉' };

      default:
        return { bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.3)', icon: '💬' };
    }
  }

  function formatTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  }
</script>

<div class="feed-container">
  <div class="feed-header">
    <span class="feed-title">Live Feed</span>
    <span class="feed-live">LIVE</span>
  </div>

  <div class="posts-list">
    {#each posts as post, i (post.id)}
      {@const style = getEventStyle(post.eventType)}
      <div
        class="post"
        class:new={i === 0}
        style="
          background: {style.bg};
          border-color: {style.border};
          animation-delay: {i * 50}ms;
        "
      >
        <!-- Author avatar and info -->
        <div class="post-author">
          <span class="avatar">{post.author.avatar}</span>
          <div class="author-info">
            <div class="author-name-row">
              <span class="author-name">{post.author.name}</span>
              {#if post.author.verified}
                <span class="verified">✓</span>
              {/if}
            </div>
            <span class="author-handle">{post.author.handle}</span>
          </div>
          <span class="post-time">{formatTime(post.timestamp)}</span>
        </div>

        <!-- Post content -->
        <p class="post-content">{post.content}</p>

        <!-- Engagement (fake numbers for fun) -->
        <div class="post-engagement">
          <span>💬 {Math.floor(Math.random() * 50)}</span>
          <span>🔁 {Math.floor(Math.random() * 200)}</span>
          <span>❤️ {Math.floor(Math.random() * 500)}</span>
        </div>
      </div>
    {/each}

    {#if posts.length === 0}
      <div class="empty-feed">
        <span>Waiting for activity...</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .feed-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: rgba(20, 20, 35, 0.6);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .feed-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(30, 30, 50, 0.5);
  }

  .feed-title {
    font-size: 14px;
    font-weight: 600;
    color: white;
  }

  .feed-live {
    font-size: 10px;
    font-weight: 700;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.2);
    padding: 3px 8px;
    border-radius: 4px;
    animation: pulse-live 1.5s ease-in-out infinite;
  }

  @keyframes pulse-live {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .posts-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .post {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid;
    animation: slide-in 0.3s ease-out;
  }

  .post.new {
    animation: slide-in 0.3s ease-out, highlight 0.5s ease-out;
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes highlight {
    0% { box-shadow: 0 0 20px rgba(167, 139, 250, 0.5); }
    100% { box-shadow: none; }
  }

  .post-author {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .avatar {
    font-size: 24px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .author-info {
    flex: 1;
    min-width: 0;
  }

  .author-name-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .author-name {
    font-size: 13px;
    font-weight: 600;
    color: white;
  }

  .verified {
    font-size: 10px;
    color: #60a5fa;
    background: rgba(96, 165, 250, 0.2);
    padding: 1px 4px;
    border-radius: 3px;
  }

  .author-handle {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  .post-time {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
  }

  .post-content {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
    margin-bottom: 8px;
    word-break: break-word;
  }

  .post-engagement {
    display: flex;
    gap: 16px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
  }

  .empty-feed {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
  }

  /* Custom scrollbar */
  .posts-list::-webkit-scrollbar {
    width: 6px;
  }

  .posts-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .posts-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
</style>
