// Main Game Scene for DEGEN ACADEMY - UI Overhauled

import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../data/constants.ts';
import { createInitialPools, getRiskEmoji, getRiskLabel } from '../data/pools.ts';
import { getRandomQuote } from '../data/ralph-quotes.ts';
import { saveManager } from '../systems/SaveManager.ts';
import type { Pool, GameState, GameEvent, EventType } from '../types/game.ts';

// Color palette
const COLORS = {
  bgDark: 0x0a0a14,
  bgMedium: 0x12121f,
  bgLight: 0x1a1a2e,
  surface: 0x252540,
  surfaceHover: 0x2f2f50,
  border: 0x3d3d5c,
  borderLight: 0x4d4d6c,
  primary: 0x8b5cf6,
  primaryHover: 0x7c3aed,
  secondary: 0xf59e0b,
  success: 0x10b981,
  danger: 0xef4444,
  warning: 0xf59e0b,
  info: 0x3b82f6,
  textPrimary: 0xffffff,
  textSecondary: 0xa1a1aa,
  textMuted: 0x71717a,
};

export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private lastYieldTick: number = 0;
  private lastRNGCheck: number = 0;
  private nextRNGInterval: number = 0;

  // UI Elements
  private portfolioText!: Phaser.GameObjects.Text;
  private portfolioChange!: Phaser.GameObjects.Text;
  private halvingText!: Phaser.GameObjects.Text;
  private halvingBar!: Phaser.GameObjects.Rectangle;
  private halvingBarBg!: Phaser.GameObjects.Rectangle;
  private multiplierText!: Phaser.GameObjects.Text;
  private poolCards: Map<string, PoolCardUI> = new Map();
  private ralphText!: Phaser.GameObjects.Text;
  private ralphContainer!: Phaser.GameObjects.Container;
  private auditsText!: Phaser.GameObjects.Text;
  private insuranceText!: Phaser.GameObjects.Text;
  private gasText!: Phaser.GameObjects.Text;
  private toastContainer!: Phaser.GameObjects.Container;
  private lastPortfolio: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.initializeGameState();
    this.createUI();
    this.resetRNGInterval();
    this.setRalphQuote('welcome');
    this.lastPortfolio = this.gameState.portfolio;
  }

  private initializeGameState(): void {
    const savedStats = saveManager.getStats();

    this.gameState = {
      portfolio: GAME_CONSTANTS.STARTING_PORTFOLIO,
      pools: createInitialPools(),
      items: { audits: 0, insurance: 0 },
      halvingMultiplier: 1,
      gasMultiplier: 1,
      gasEndTime: null,
      whaleEndTime: null,
      isGameOver: false,
      isVictory: false,
      currentRun: {
        startTime: Date.now(),
        elapsed: 0,
        halvingCount: 0,
      },
      stats: {
        rugsEaten: 0,
        highestPortfolio: GAME_CONSTANTS.STARTING_PORTFOLIO,
        gamesPlayed: savedStats.gamesPlayed,
        totalTimePlayed: savedStats.totalTimePlayed,
        fastestWin: savedStats.fastestWin,
      },
    };
  }

  private createUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background with subtle gradient effect
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark);

    // Add subtle grid pattern
    this.createBackgroundPattern();

    // Top bar
    this.createTopBar();

    // Pool grid
    this.createPoolGrid();

    // Ralph chat
    this.createRalphChat();

    // Bottom bar
    this.createBottomBar();

    // Toast container
    this.toastContainer = this.add.container(width - 20, 100);
  }

  private createBackgroundPattern(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const graphics = this.add.graphics();

    graphics.lineStyle(1, 0x1a1a2e, 0.3);

    // Vertical lines
    for (let x = 0; x < width; x += 40) {
      graphics.lineBetween(x, 0, x, height);
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 40) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  private createTopBar(): void {
    const width = this.cameras.main.width;

    // Top bar background with gradient effect
    const topBarBg = this.add.graphics();
    topBarBg.fillStyle(COLORS.bgMedium, 1);
    topBarBg.fillRoundedRect(10, 10, width - 20, 70, 12);
    topBarBg.lineStyle(1, COLORS.border, 1);
    topBarBg.strokeRoundedRect(10, 10, width - 20, 70, 12);

    // Logo/Title
    this.add.text(30, 28, '🎓', { fontSize: '28px' });
    this.add.text(65, 30, 'DEGEN ACADEMY', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '22px',
      color: '#8B5CF6',
      fontStyle: 'bold',
    });
    this.add.text(65, 52, 'Learn DeFi by getting rekt', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#71717A',
    });

    // Portfolio section (centered)
    const portfolioX = width / 2;

    this.add.text(portfolioX, 22, '💰 PORTFOLIO', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#A1A1AA',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.portfolioText = this.add.text(portfolioX, 42, '$10,000.00', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '26px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.portfolioChange = this.add.text(portfolioX + 100, 48, '+$0.00/s', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#10B981',
    }).setOrigin(0, 0.5);

    // Halving section (right side)
    const halvingX = width - 180;

    // Halving container
    const halvingBg = this.add.graphics();
    halvingBg.fillStyle(COLORS.surface, 1);
    halvingBg.fillRoundedRect(halvingX - 10, 18, 160, 54, 8);

    this.add.text(halvingX, 25, '⏱️ NEXT HALVING', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#A1A1AA',
      fontStyle: 'bold',
    });

    this.halvingText = this.add.text(halvingX, 42, '5:00', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '22px',
      color: '#F59E0B',
      fontStyle: 'bold',
    });

    // Progress bar background
    this.halvingBarBg = this.add.rectangle(halvingX + 75, 58, 60, 6, COLORS.border);
    this.halvingBarBg.setOrigin(0, 0.5);

    this.halvingBar = this.add.rectangle(halvingX + 75, 58, 0, 6, COLORS.secondary);
    this.halvingBar.setOrigin(0, 0.5);

    // Multiplier badge
    this.multiplierText = this.add.text(halvingX + 140, 42, '1x', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#F59E0B',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private createPoolGrid(): void {
    const width = this.cameras.main.width;
    const startY = 100;
    const cardWidth = 195;
    const cardHeight = 180;
    const gap = 15;

    // Calculate total width of 3 cards + gaps
    const totalWidth = (cardWidth * 3) + (gap * 2);
    const startX = (width - totalWidth) / 2 + cardWidth / 2;

    this.gameState.pools.forEach((pool, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      const card = this.createPoolCard(pool, x, y, cardWidth, cardHeight);
      this.poolCards.set(pool.id, card);
    });
  }

  private createPoolCard(pool: Pool, x: number, y: number, w: number, h: number): PoolCardUI {
    const container = this.add.container(x, y);

    // Card background with rounded corners
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.bgLight, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(1, COLORS.border, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);

    // Risk indicator stripe at top
    const riskColor = pool.riskLevel === 'safe' ? COLORS.success :
                      pool.riskLevel === 'medium' ? COLORS.warning : COLORS.danger;
    const stripe = this.add.graphics();
    stripe.fillStyle(riskColor, 1);
    stripe.fillRoundedRect(-w / 2, -h / 2, w, 4, { tl: 12, tr: 12, bl: 0, br: 0 });

    // Pool name with emoji
    const riskEmoji = getRiskEmoji(pool.riskLevel);
    const nameText = this.add.text(0, -h / 2 + 22, `${riskEmoji} ${pool.name}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Risk label badge
    const riskLabel = getRiskLabel(pool.riskLevel);
    const riskLabelColor = pool.riskLevel === 'safe' ? '#10B981' :
                           pool.riskLevel === 'medium' ? '#F59E0B' : '#EF4444';
    const riskText = this.add.text(0, -h / 2 + 42, riskLabel.toUpperCase(), {
      fontFamily: 'Inter, sans-serif',
      fontSize: '9px',
      color: riskLabelColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // APY - big and bold
    const apyText = this.add.text(0, -10, `${pool.apy}%`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '36px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(0, 22, 'APY', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#71717A',
    }).setOrigin(0.5);

    // Deposited section
    const depositedBg = this.add.graphics();
    depositedBg.fillStyle(COLORS.surface, 1);
    depositedBg.fillRoundedRect(-w / 2 + 10, 40, w - 20, 36, 6);

    const depositedText = this.add.text(-w / 2 + 20, 50, '$0.00', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '16px',
      color: '#10B981',
      fontStyle: 'bold',
    });

    const yieldText = this.add.text(w / 2 - 20, 50, '+$0.00/s', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#71717A',
    }).setOrigin(1, 0);

    // Action buttons
    const btnY = h / 2 - 25;
    const btnWidth = (w - 30) / 2;

    // Deposit button
    const depositBtn = this.createCardButton(-w / 4 + 2, btnY, btnWidth - 5, 32, '+$1K', COLORS.primary, () => {
      this.deposit(pool.id, 1000);
    });

    // Withdraw button
    const withdrawBtn = this.createCardButton(w / 4 - 2, btnY, btnWidth - 5, 32, 'OUT', COLORS.surface, () => {
      this.withdrawAll(pool.id);
    });

    container.add([bg, stripe, nameText, riskText, apyText, depositedBg, depositedText, yieldText, ...depositBtn, ...withdrawBtn]);

    // Create a rectangle for the card background that can be colored
    const cardBg = this.add.rectangle(x, y, w, h);
    cardBg.setFillStyle(0x000000, 0);

    return {
      container,
      bg: cardBg,
      depositedText,
      yieldText,
      apyText,
      graphics: bg,
    };
  }

  private createCardButton(x: number, y: number, w: number, h: number, text: string, color: number, callback: () => void): Phaser.GameObjects.GameObject[] {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);

    // Create invisible hitbox for interaction
    const hitbox = this.add.rectangle(x, y, w, h, 0x000000, 0);
    hitbox.setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, text, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    hitbox.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color === COLORS.primary ? COLORS.primaryHover : COLORS.surfaceHover, 1);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    });

    hitbox.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    });

    hitbox.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(color === COLORS.primary ? 0x6d28d9 : COLORS.border, 1);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    });

    hitbox.on('pointerup', callback);

    return [bg, hitbox, label];
  }

  private createRalphChat(): void {
    const width = this.cameras.main.width;
    const y = 505;

    // Chat container background
    this.ralphContainer = this.add.container(width / 2, y);

    const chatBg = this.add.graphics();
    chatBg.fillStyle(COLORS.bgLight, 1);
    chatBg.fillRoundedRect(-width / 2 + 20, -25, width - 40, 50, 10);
    chatBg.lineStyle(1, COLORS.border, 1);
    chatBg.strokeRoundedRect(-width / 2 + 20, -25, width - 40, 50, 10);

    // Ralph avatar
    const avatarBg = this.add.graphics();
    avatarBg.fillStyle(COLORS.primary, 0.2);
    avatarBg.fillCircle(-width / 2 + 50, 0, 18);

    const avatar = this.add.text(-width / 2 + 50, 0, '🐕', { fontSize: '20px' }).setOrigin(0.5);

    // Ralph text
    this.ralphText = this.add.text(-width / 2 + 80, 0, 'Ralph: "..."', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#A1A1AA',
      fontStyle: 'italic',
      wordWrap: { width: width - 160 },
    }).setOrigin(0, 0.5);

    this.ralphContainer.add([chatBg, avatarBg, avatar, this.ralphText]);
  }

  private createBottomBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const barY = height - 45;

    // Bottom bar background
    const bottomBg = this.add.graphics();
    bottomBg.fillStyle(COLORS.bgMedium, 1);
    bottomBg.fillRoundedRect(10, height - 80, width - 20, 70, 12);
    bottomBg.lineStyle(1, COLORS.border, 1);
    bottomBg.strokeRoundedRect(10, height - 80, width - 20, 70, 12);

    // Items section
    const itemStartX = 40;

    // Audit item
    this.createItemSlot(itemStartX, barY, '🛡️', 'AUDIT', GAME_CONSTANTS.AUDIT_COST, () => this.buyAudit());
    this.auditsText = this.add.text(itemStartX + 45, barY - 8, '0', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Insurance item
    this.createItemSlot(itemStartX + 180, barY, '🏥', 'INSURANCE', GAME_CONSTANTS.INSURANCE_COST, () => this.buyInsurance());
    this.insuranceText = this.add.text(itemStartX + 225, barY - 8, '0', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Gas indicator (right side)
    const gasX = width - 150;

    const gasBg = this.add.graphics();
    gasBg.fillStyle(COLORS.surface, 1);
    gasBg.fillRoundedRect(gasX - 10, barY - 25, 130, 50, 8);

    this.add.text(gasX, barY - 12, '⛽ GAS PRICE', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#71717A',
      fontStyle: 'bold',
    });

    this.gasText = this.add.text(gasX, barY + 8, '1x NORMAL', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#10B981',
      fontStyle: 'bold',
    });

    // Goal indicator (center)
    const goalX = width / 2;
    this.add.text(goalX, barY - 12, '🎯 GOAL', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#71717A',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(goalX, barY + 8, '$1,000,000', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '16px',
      color: '#8B5CF6',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private createItemSlot(x: number, y: number, emoji: string, label: string, cost: number, callback: () => void): void {
    // Item background
    const itemBg = this.add.graphics();
    itemBg.fillStyle(COLORS.surface, 1);
    itemBg.fillRoundedRect(x - 10, y - 25, 150, 50, 8);

    // Emoji
    this.add.text(x, y - 5, emoji, { fontSize: '24px' }).setOrigin(0, 0.5);

    // Label
    this.add.text(x + 70, y - 15, label, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#71717A',
      fontStyle: 'bold',
    }).setOrigin(0, 0);

    // Buy button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLORS.primary, 1);
    btnBg.fillRoundedRect(x + 85, y - 5, 50, 24, 4);

    const btnHitbox = this.add.rectangle(x + 110, y + 7, 50, 24, 0x000000, 0);
    btnHitbox.setInteractive({ useHandCursor: true });

    this.add.text(x + 110, y + 7, `$${cost}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btnHitbox.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(COLORS.primaryHover, 1);
      btnBg.fillRoundedRect(x + 85, y - 5, 50, 24, 4);
    });

    btnHitbox.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(COLORS.primary, 1);
      btnBg.fillRoundedRect(x + 85, y - 5, 50, 24, 4);
    });

    btnHitbox.on('pointerup', callback);
  }

  update(time: number, _delta: number): void {
    if (this.gameState.isGameOver || this.gameState.isVictory) return;

    this.gameState.currentRun.elapsed = Date.now() - this.gameState.currentRun.startTime;

    if (time - this.lastYieldTick >= GAME_CONSTANTS.YIELD_TICK_MS) {
      this.tickYields();
      this.lastYieldTick = time;
    }

    if (time - this.lastRNGCheck >= this.nextRNGInterval) {
      this.checkRNGEvent();
      this.lastRNGCheck = time;
      this.resetRNGInterval();
    }

    this.updateHalvingTimer();
    this.checkTemporaryEffects();
    this.checkEndConditions();
    this.updateUI();
  }

  private tickYields(): void {
    let totalYield = 0;

    this.gameState.pools.forEach(pool => {
      if (pool.isRugged || pool.deposited <= 0) return;

      let yieldPerSecond = pool.deposited * (pool.apy / 100) / 365 / 24 / 60 / 60;
      yieldPerSecond *= this.gameState.halvingMultiplier;

      if (this.gameState.whaleEndTime && Date.now() < this.gameState.whaleEndTime) {
        const reduction = this.gameState.items.insurance > 0
          ? GAME_CONSTANTS.WHALE_YIELD_REDUCTION * GAME_CONSTANTS.INSURANCE_DAMAGE_REDUCTION
          : GAME_CONSTANTS.WHALE_YIELD_REDUCTION;
        yieldPerSecond *= (1 - reduction);
      }

      if (pool.isPumping && pool.pumpEndTime && Date.now() < pool.pumpEndTime) {
        yieldPerSecond *= GAME_CONSTANTS.PUMP_MULTIPLIER;
      }

      totalYield += yieldPerSecond;
    });

    this.gameState.portfolio += totalYield;

    if (this.gameState.portfolio > this.gameState.stats.highestPortfolio) {
      this.gameState.stats.highestPortfolio = this.gameState.portfolio;
    }
  }

  private updateHalvingTimer(): void {
    const elapsed = this.gameState.currentRun.elapsed;
    const halvingInterval = GAME_CONSTANTS.HALVING_INTERVAL_MS;
    const timeInCurrentCycle = elapsed % halvingInterval;
    const timeRemaining = halvingInterval - timeInCurrentCycle;

    const expectedHalvings = Math.floor(elapsed / halvingInterval);
    if (expectedHalvings > this.gameState.currentRun.halvingCount) {
      this.executeHalving();
      this.gameState.currentRun.halvingCount = expectedHalvings;
    }

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    this.halvingText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);

    const progress = 1 - (timeRemaining / halvingInterval);
    this.halvingBar.width = 60 * progress;

    // Update multiplier display
    const mult = this.gameState.halvingMultiplier;
    this.multiplierText.setText(mult >= 1 ? `${mult}x` : `${mult.toFixed(2)}x`);
  }

  private executeHalving(): void {
    this.gameState.halvingMultiplier *= 0.5;
    this.showToast('⏰ HALVING!', 'All yields cut by 50%!', COLORS.secondary);
    this.setRalphQuote('halving');
  }

  private checkRNGEvent(): void {
    const event = this.rollForEvent();
    if (event) {
      this.executeEvent(event);
    }
  }

  private rollForEvent(): GameEvent | null {
    const weights = GAME_CONSTANTS.EVENT_WEIGHTS;
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const roll = Math.random() * total;

    let cumulative = 0;
    let eventType: EventType | null = null;

    for (const [type, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (roll < cumulative) {
        eventType = type as EventType;
        break;
      }
    }

    if (!eventType) return null;

    const targetPool = this.selectTargetPool(eventType);

    return {
      id: crypto.randomUUID(),
      type: eventType,
      targetPoolId: targetPool?.id ?? null,
      magnitude: Math.random(),
      timestamp: Date.now(),
      blocked: false,
      message: '',
    };
  }

  private selectTargetPool(eventType: EventType): Pool | null {
    const activePools = this.gameState.pools.filter(p => !p.isRugged && p.deposited > 0);
    if (activePools.length === 0) return null;

    if (eventType === 'rug' || eventType === 'exploit' || eventType === 'pump') {
      const totalWeight = activePools.reduce((sum, p) => sum + p.apy, 0);
      const roll = Math.random() * totalWeight;
      let cumulative = 0;

      for (const pool of activePools) {
        cumulative += pool.apy;
        if (roll < cumulative) return pool;
      }
    }

    return activePools[Math.floor(Math.random() * activePools.length)] ?? null;
  }

  private executeEvent(event: GameEvent): void {
    switch (event.type) {
      case 'rug': this.executeRug(event); break;
      case 'exploit': this.executeExploit(event); break;
      case 'whale': this.executeWhaleDump(); break;
      case 'gas': this.executeGasSpike(); break;
      case 'pump': this.executePump(event); break;
    }
  }

  private executeRug(event: GameEvent): void {
    if (!event.targetPoolId) return;

    const pool = this.gameState.pools.find(p => p.id === event.targetPoolId);
    if (!pool || pool.isRugged) return;

    const lostAmount = pool.deposited;
    pool.isRugged = true;
    pool.deposited = 0;
    this.gameState.stats.rugsEaten++;

    this.showToast('🚨 RUG PULL!', `${pool.name} rugged! Lost $${lostAmount.toFixed(2)}`, COLORS.danger);
    this.setRalphQuote('rug');
    this.flashScreen(COLORS.danger);
  }

  private executeExploit(event: GameEvent): void {
    if (!event.targetPoolId) return;

    const pool = this.gameState.pools.find(p => p.id === event.targetPoolId);
    if (!pool || pool.isRugged) return;

    if (this.gameState.items.audits > 0) {
      this.gameState.items.audits--;
      this.showToast('🛡️ EXPLOIT BLOCKED!', `Audit saved ${pool.name}!`, COLORS.success);
      this.setRalphQuote('exploitBlocked');
      return;
    }

    const lostAmount = pool.deposited * GAME_CONSTANTS.EXPLOIT_DAMAGE;
    pool.deposited -= lostAmount;

    this.showToast('⚠️ EXPLOIT!', `${pool.name} hacked! Lost $${lostAmount.toFixed(2)}`, COLORS.warning);
    this.setRalphQuote('exploit');
  }

  private executeWhaleDump(): void {
    this.gameState.whaleEndTime = Date.now() + GAME_CONSTANTS.WHALE_DURATION_MS;
    const reduction = this.gameState.items.insurance > 0 ? '15%' : '30%';

    this.showToast('🐋 WHALE DUMP!', `All yields -${reduction} for 60s`, COLORS.info);
    this.setRalphQuote('whale');
  }

  private executeGasSpike(): void {
    this.gameState.gasMultiplier = GAME_CONSTANTS.GAS_MULTIPLIER;
    this.gameState.gasEndTime = Date.now() + GAME_CONSTANTS.GAS_DURATION_MS;

    this.showToast('⛽ GAS SPIKE!', 'Actions cost 3x for 30s!', COLORS.warning);
    this.setRalphQuote('gas');
  }

  private executePump(event: GameEvent): void {
    if (!event.targetPoolId) return;

    const pool = this.gameState.pools.find(p => p.id === event.targetPoolId);
    if (!pool || pool.isRugged) return;

    pool.isPumping = true;
    pool.pumpEndTime = Date.now() + GAME_CONSTANTS.PUMP_DURATION_MS;

    this.showToast('🚀 PUMP!', `${pool.name} 2x yields for 30s!`, COLORS.success);
    this.setRalphQuote('pump');
  }

  private checkTemporaryEffects(): void {
    const now = Date.now();

    if (this.gameState.gasEndTime && now >= this.gameState.gasEndTime) {
      this.gameState.gasMultiplier = 1;
      this.gameState.gasEndTime = null;
    }

    if (this.gameState.whaleEndTime && now >= this.gameState.whaleEndTime) {
      this.gameState.whaleEndTime = null;
    }

    this.gameState.pools.forEach(pool => {
      if (pool.isPumping && pool.pumpEndTime && now >= pool.pumpEndTime) {
        pool.isPumping = false;
        pool.pumpEndTime = null;
      }
    });
  }

  private checkEndConditions(): void {
    if (this.gameState.portfolio >= GAME_CONSTANTS.WIN_PORTFOLIO) {
      this.gameState.isVictory = true;
      saveManager.recordGameEnd(this.gameState.stats, true, this.gameState.currentRun.elapsed);
      this.scene.start('WinScene', {
        portfolio: this.gameState.portfolio,
        stats: this.gameState.stats,
        elapsed: this.gameState.currentRun.elapsed,
      });
    }

    if (this.gameState.portfolio <= 0) {
      this.gameState.isGameOver = true;
      saveManager.recordGameEnd(this.gameState.stats, false, this.gameState.currentRun.elapsed);
      this.scene.start('DeathScene', {
        portfolio: this.gameState.portfolio,
        stats: this.gameState.stats,
        elapsed: this.gameState.currentRun.elapsed,
      });
    }
  }

  private deposit(poolId: string, amount: number): void {
    const pool = this.gameState.pools.find(p => p.id === poolId);
    if (!pool || pool.isRugged) {
      this.showToast('❌ Pool Rugged', 'This pool has been rugged!', COLORS.danger);
      return;
    }

    const cost = amount * this.gameState.gasMultiplier;
    if (this.gameState.portfolio < cost) {
      this.setRalphQuote('cantAfford');
      this.showToast('❌ Insufficient Funds', `Need $${cost.toFixed(2)}`, COLORS.danger);
      return;
    }

    this.gameState.portfolio -= cost;
    pool.deposited += amount;

    const quoteType = pool.riskLevel === 'degen' ? 'depositHighRisk' : 'deposit';
    this.setRalphQuote(quoteType);
  }

  private withdraw(poolId: string, amount: number): void {
    const pool = this.gameState.pools.find(p => p.id === poolId);
    if (!pool || pool.isRugged) return;

    const actualAmount = Math.min(amount, pool.deposited);
    if (actualAmount <= 0) {
      this.showToast('❌ Nothing to Withdraw', 'No funds in this pool', COLORS.warning);
      return;
    }

    pool.deposited -= actualAmount;
    this.gameState.portfolio += actualAmount;
    this.setRalphQuote('withdraw');
  }

  private withdrawAll(poolId: string): void {
    const pool = this.gameState.pools.find(p => p.id === poolId);
    if (pool && pool.deposited > 0) {
      this.withdraw(poolId, pool.deposited);
    }
  }

  private buyAudit(): void {
    const cost = GAME_CONSTANTS.AUDIT_COST * this.gameState.gasMultiplier;
    if (this.gameState.portfolio < cost) {
      this.setRalphQuote('cantAfford');
      return;
    }

    this.gameState.portfolio -= cost;
    this.gameState.items.audits++;
    this.setRalphQuote('buyAudit');
    this.showToast('🛡️ Audit Purchased!', `Protection +1 (${this.gameState.items.audits} total)`, COLORS.primary);
  }

  private buyInsurance(): void {
    const cost = GAME_CONSTANTS.INSURANCE_COST * this.gameState.gasMultiplier;
    if (this.gameState.portfolio < cost) {
      this.setRalphQuote('cantAfford');
      return;
    }

    this.gameState.portfolio -= cost;
    this.gameState.items.insurance++;
    this.setRalphQuote('buyInsurance');
    this.showToast('🏥 Insurance Purchased!', `Protection +1 (${this.gameState.items.insurance} total)`, COLORS.primary);
  }

  private updateUI(): void {
    // Portfolio with formatting
    const portfolio = this.gameState.portfolio;
    this.portfolioText.setText(`$${portfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    // Portfolio change indicator
    const change = portfolio - this.lastPortfolio;
    if (change > 0) {
      this.portfolioChange.setText(`+$${change.toFixed(2)}/s`);
      this.portfolioChange.setColor('#10B981');
    } else if (change < 0) {
      this.portfolioChange.setText(`-$${Math.abs(change).toFixed(2)}/s`);
      this.portfolioChange.setColor('#EF4444');
    }
    this.lastPortfolio = portfolio;

    // Pool cards
    this.gameState.pools.forEach(pool => {
      const card = this.poolCards.get(pool.id);
      if (!card) return;

      card.depositedText.setText(`$${pool.deposited.toFixed(2)}`);

      let yps = pool.deposited * (pool.apy / 100) / 365 / 24 / 60 / 60 * this.gameState.halvingMultiplier;
      if (pool.isPumping) yps *= 2;
      card.yieldText.setText(`+$${yps.toFixed(4)}/s`);

      // Visual states
      if (pool.isRugged) {
        card.depositedText.setColor('#EF4444');
        card.yieldText.setText('RUGGED');
        card.yieldText.setColor('#EF4444');
      } else if (pool.isPumping) {
        card.yieldText.setColor('#10B981');
      } else {
        card.depositedText.setColor('#10B981');
        card.yieldText.setColor('#71717A');
      }
    });

    // Items
    this.auditsText.setText(this.gameState.items.audits.toString());
    this.insuranceText.setText(this.gameState.items.insurance.toString());

    // Gas status
    if (this.gameState.gasMultiplier > 1) {
      this.gasText.setText(`${this.gameState.gasMultiplier}x HIGH`);
      this.gasText.setColor('#EF4444');
    } else {
      this.gasText.setText('1x NORMAL');
      this.gasText.setColor('#10B981');
    }
  }

  private showToast(title: string, message: string, color: number): void {
    const toast = this.add.container(0, 0);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.bgLight, 1);
    bg.fillRoundedRect(-160, -40, 320, 80, 10);
    bg.lineStyle(2, color, 1);
    bg.strokeRoundedRect(-160, -40, 320, 80, 10);

    // Color accent bar
    const accent = this.add.graphics();
    accent.fillStyle(color, 1);
    accent.fillRoundedRect(-160, -40, 6, 80, { tl: 10, bl: 10, tr: 0, br: 0 });

    const titleText = this.add.text(-140, -20, title, {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });

    const msgText = this.add.text(-140, 5, message, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#A1A1AA',
    });

    toast.add([bg, accent, titleText, msgText]);
    toast.setPosition(-180, this.toastContainer.list.length * 95);
    toast.setAlpha(0);
    this.toastContainer.add(toast);

    // Animate in
    this.tweens.add({
      targets: toast,
      alpha: 1,
      x: -180,
      duration: 200,
      ease: 'Power2',
    });

    // Remove after delay
    this.time.delayedCall(4000, () => {
      this.tweens.add({
        targets: toast,
        alpha: 0,
        x: -100,
        duration: 200,
        ease: 'Power2',
        onComplete: () => toast.destroy(),
      });
    });
  }

  private setRalphQuote(category: string): void {
    const quote = getRandomQuote(category as keyof typeof import('../data/ralph-quotes.ts').RALPH_QUOTES);
    this.ralphText.setText(`"${quote}"`);
  }

  private flashScreen(color: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const flash = this.add.rectangle(width / 2, height / 2, width, height, color, 0.3);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });
  }

  private resetRNGInterval(): void {
    const base = GAME_CONSTANTS.RNG_CHECK_INTERVAL_MS;
    const variance = GAME_CONSTANTS.RNG_VARIANCE_MS;
    this.nextRNGInterval = base + (Math.random() * variance * 2 - variance);
  }
}

interface PoolCardUI {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
  depositedText: Phaser.GameObjects.Text;
  yieldText: Phaser.GameObjects.Text;
  apyText: Phaser.GameObjects.Text;
  graphics: Phaser.GameObjects.Graphics;
}
