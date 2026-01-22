<script lang="ts">
  import { socialPosts } from '../stores/memeStore.svelte';
  import type { MemeEventType } from '../../types/meme';

  const posts = $derived(socialPosts.value);

  // Author type avatar gradients
  function getAvatarStyle(authorType: string): string {
    switch (authorType) {
      case 'kol': return 'linear-gradient(135deg, #8b5cf6, #6366f1)';
      case 'whale': return 'linear-gradient(135deg, #0ea5e9, #06b6d4)';
      case 'dev': return 'linear-gradient(135deg, #22c55e, #10b981)';
      case 'celebrity': return 'linear-gradient(135deg, #f59e0b, #eab308)';
      case 'exchange': return 'linear-gradient(135deg, #f97316, #ef4444)';
      case 'news': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'fudder': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'analyst': return 'linear-gradient(135deg, #14b8a6, #0d9488)';
      case 'newbie': return 'linear-gradient(135deg, #a78bfa, #c084fc)';
      case 'bot': return 'linear-gradient(135deg, #64748b, #475569)';
      case 'scammer': return 'linear-gradient(135deg, #991b1b, #7f1d1d)';
      default: return 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    }
  }

  function formatTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'now';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  }

  // Generate realistic engagement numbers
  function getEngagement(post: typeof posts[0]) {
    const base = Math.floor(Math.random() * 100);
    const isPositive = ['whale_buy', 'kol_shill', 'organic_pump', 'celebrity_mention', 'partnership'].includes(post.eventType);
    const multiplier = isPositive ? 3 : 1;
    return {
      replies: Math.floor(base * 0.3 * multiplier),
      retweets: Math.floor(base * 0.8 * multiplier),
      likes: Math.floor(base * 2.5 * multiplier),
      views: `${(base * 0.1 * multiplier + 0.1).toFixed(1)}K`,
    };
  }
</script>

<div class="feed-container">
  <div class="feed-header">
    <span class="feed-title">Live Feed</span>
    <div class="live-indicator">
      <span class="live-dot"></span>
      <span class="live-text">LIVE</span>
    </div>
  </div>

  <div class="tweets-list">
    {#each posts as post (post.id)}
      {@const engagement = getEngagement(post)}
      <article class="tweet">
        <!-- Avatar -->
        <div class="tweet-avatar" style="background: {getAvatarStyle(post.author.type)}">
          {post.author.avatar}
        </div>

        <!-- Tweet Content -->
        <div class="tweet-main">
          <!-- Header: Name, Handle, Verified, Time -->
          <div class="tweet-header">
            <span class="tweet-name">{post.author.name}</span>
            {#if post.author.verified}
              <svg class="verified-badge" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="11" fill="#1d9bf0"/>
                <path d="M9.5 12.5L7 10l-1 1 3.5 3.5 7-7-1-1-6 6z" fill="white"/>
              </svg>
            {/if}
            <span class="tweet-handle">{post.author.handle}</span>
            <span class="tweet-dot">·</span>
            <span class="tweet-time">{formatTime(post.timestamp)}</span>
          </div>

          <!-- Tweet Text -->
          <p class="tweet-text">{post.content}</p>

          <!-- Action Bar -->
          <div class="tweet-actions">
            <!-- Reply -->
            <button class="action-btn reply">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
              </svg>
              <span>{engagement.replies}</span>
            </button>

            <!-- Retweet -->
            <button class="action-btn retweet">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
              </svg>
              <span>{engagement.retweets}</span>
            </button>

            <!-- Like -->
            <button class="action-btn like">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
              </svg>
              <span>{engagement.likes}</span>
            </button>

            <!-- Views -->
            <button class="action-btn views">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
              </svg>
              <span>{engagement.views}</span>
            </button>

            <!-- Share/Bookmark -->
            <button class="action-btn share">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    {/each}

    {#if posts.length === 0}
      <div class="empty-state">
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
    min-height: 0;
    flex: 1;
    background: #000;
    border-radius: 8px;
    border: 1px solid rgb(47, 51, 54);
    overflow: hidden;
  }

  .feed-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgb(47, 51, 54);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(12px);
  }

  .feed-title {
    font-size: 15px;
    font-weight: 700;
    color: rgb(231, 233, 234);
  }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    background: #f91880;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.9); }
  }

  .live-text {
    font-size: 11px;
    font-weight: 700;
    color: #f91880;
  }

  .tweets-list {
    flex: 1;
    overflow-y: auto;
    background: #000;
  }

  .tweet {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgb(47, 51, 54);
    transition: background 0.2s;
    cursor: pointer;
  }

  .tweet:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .tweet-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .tweet-main {
    flex: 1;
    min-width: 0;
  }

  .tweet-header {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    margin-bottom: 2px;
  }

  .tweet-name {
    font-size: 15px;
    font-weight: 700;
    color: rgb(231, 233, 234);
  }

  .verified-badge {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .tweet-handle {
    font-size: 15px;
    color: rgb(113, 118, 123);
  }

  .tweet-dot {
    color: rgb(113, 118, 123);
  }

  .tweet-time {
    font-size: 15px;
    color: rgb(113, 118, 123);
  }

  .tweet-text {
    font-size: 15px;
    line-height: 1.4;
    color: rgb(231, 233, 234);
    margin-bottom: 12px;
    word-break: break-word;
  }

  .tweet-actions {
    display: flex;
    justify-content: space-between;
    max-width: 425px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: rgb(113, 118, 123);
    font-size: 13px;
    transition: color 0.2s;
  }

  .action-btn svg {
    width: 18px;
    height: 18px;
  }

  .action-btn.reply:hover {
    color: #1d9bf0;
  }

  .action-btn.retweet:hover {
    color: #00ba7c;
  }

  .action-btn.like:hover {
    color: #f91880;
  }

  .action-btn.views:hover,
  .action-btn.share:hover {
    color: #1d9bf0;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: rgb(113, 118, 123);
    font-size: 15px;
  }

  /* Custom scrollbar (Twitter style) */
  .tweets-list::-webkit-scrollbar {
    width: 12px;
  }

  .tweets-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .tweets-list::-webkit-scrollbar-thumb {
    background: rgb(62, 65, 68);
    border-radius: 6px;
    border: 3px solid #000;
  }

  .tweets-list::-webkit-scrollbar-thumb:hover {
    background: rgb(90, 93, 96);
  }
</style>
