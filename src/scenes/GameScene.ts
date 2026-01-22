// Main Game Scene for DEGEN ACADEMY

import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../data/constants.ts';
import { createInitialPools, getRiskEmoji, getRiskLabel } from '../data/pools.ts';
import { getRandomQuote } from '../data/ralph-quotes.ts';
import type { Pool, GameState, GameEvent, EventType } from '../types/game.ts';

export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private lastYieldTick: number = 0;
  private lastRNGCheck: number = 0;
  private nextRNGInterval: number = 0;

  // UI Elements
  private portfolioText!: Phaser.GameObjects.Text;
  private halvingText!: Phaser.GameObjects.Text;
  private halvingBar!: Phaser.GameObjects.Rectangle;
  private poolCards: Map<string, PoolCardUI> = new Map();
  private ralphText!: Phaser.GameObjects.Text;
  private auditsText!: Phaser.GameObjects.Text;
  private insuranceText!: Phaser.GameObjects.Text;
  private toastContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.initializeGameState();
    this.createUI();
    this.resetRNGInterval();
    this.setRalphQuote('welcome');
  }

  private initializeGameState(): void {
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
        gamesPlayed: 0,
        totalTimePlayed: 0,
        fastestWin: null,
      },
    };
  }

  private createUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0F0F1A);

    // Top bar
    this.createTopBar();

    // Pool grid
    this.createPoolGrid();

    // Ralph chat
    this.createRalphChat();

    // Bottom bar (items)
    this.createBottomBar();

    // Toast container
    this.toastContainer = this.add.container(width - 20, 80);
  }

  private createTopBar(): void {
    const width = this.cameras.main.width;

    // Top bar background
    this.add.rectangle(width / 2, 35, width, 70, 0x1A1A2E);

    // Title
    this.add.text(20, 35, '🎓 DEGEN ACADEMY', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '24px',
      color: '#8B5CF6',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Portfolio
    this.add.text(width / 2 - 100, 25, '💰 Portfolio', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#A1A1AA',
    }).setOrigin(0, 0.5);

    this.portfolioText = this.add.text(width / 2 - 100, 45, '$10,000.00', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '28px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Halving timer
    this.add.text(width - 200, 20, '⏱️ HALVING', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#A1A1AA',
    }).setOrigin(0, 0.5);

    this.halvingText = this.add.text(width - 200, 40, '5:00', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '24px',
      color: '#F59E0B',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Halving progress bar
    this.add.rectangle(width - 100, 55, 80, 8, 0x3D3D5C).setOrigin(0, 0.5);
    this.halvingBar = this.add.rectangle(width - 100, 55, 80, 8, 0xF59E0B).setOrigin(0, 0.5);
  }

  private createPoolGrid(): void {
    const startX = 120;
    const startY = 180;
    const cardWidth = 180;
    const cardHeight = 200;
    const gapX = 200;
    const gapY = 220;

    this.gameState.pools.forEach((pool, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * gapX;
      const y = startY + row * gapY;

      const card = this.createPoolCard(pool, x, y, cardWidth, cardHeight);
      this.poolCards.set(pool.id, card);
    });
  }

  private createPoolCard(pool: Pool, x: number, y: number, w: number, h: number): PoolCardUI {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, w, h, 0x1E1E32);
    bg.setStrokeStyle(1, 0x3D3D5C);

    // Pool name with risk indicator
    const riskEmoji = getRiskEmoji(pool.riskLevel);
    const nameText = this.add.text(0, -h / 2 + 25, `${riskEmoji} ${pool.name}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Risk label
    const riskColor = pool.riskLevel === 'safe' ? '#10B981' : pool.riskLevel === 'medium' ? '#F59E0B' : '#EF4444';
    const riskText = this.add.text(0, -h / 2 + 50, getRiskLabel(pool.riskLevel), {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: riskColor,
    }).setOrigin(0.5);

    // APY
    const apyText = this.add.text(0, -10, `${pool.apy}%`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '32px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(0, 20, 'APY', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#A1A1AA',
    }).setOrigin(0.5);

    // Deposited amount
    const depositedText = this.add.text(0, 55, '$0.00', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#10B981',
    }).setOrigin(0.5);

    // Yield per second
    const yieldText = this.add.text(0, 75, '+$0.00/sec', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#A1A1AA',
    }).setOrigin(0.5);

    // Buttons
    const depositBtn = this.createSmallButton(-45, h / 2 - 30, 'DEP', 0x8B5CF6, () => {
      this.deposit(pool.id, GAME_CONSTANTS.MIN_DEPOSIT);
    });

    const withdrawBtn = this.createSmallButton(45, h / 2 - 30, 'WITH', 0x3D3D5C, () => {
      this.withdraw(pool.id, GAME_CONSTANTS.MIN_DEPOSIT);
    });

    container.add([bg, nameText, riskText, apyText, depositedText, yieldText, ...depositBtn, ...withdrawBtn]);

    return {
      container,
      bg,
      depositedText,
      yieldText,
      apyText,
    };
  }

  private createSmallButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.GameObject[] {
    const bg = this.add.rectangle(x, y, 70, 30, color);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, text, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout', () => bg.setAlpha(1));
    bg.on('pointerup', callback);

    return [bg, label];
  }

  private createRalphChat(): void {
    const width = this.cameras.main.width;

    // Chat background
    this.add.rectangle(width / 2, 605, width - 40, 50, 0x1E1E32).setStrokeStyle(1, 0x3D3D5C);

    // Ralph emoji
    this.add.text(40, 605, '🐕', { fontSize: '24px' }).setOrigin(0.5);

    // Ralph text
    this.ralphText = this.add.text(70, 605, 'Ralph: "..."', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#A1A1AA',
      fontStyle: 'italic',
    }).setOrigin(0, 0.5);
  }

  private createBottomBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Bottom bar background
    this.add.rectangle(width / 2, height - 35, width, 70, 0x1A1A2E);

    // Audits
    this.add.text(100, height - 45, '🛡️ Audits:', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#A1A1AA',
    }).setOrigin(0, 0.5);

    this.auditsText = this.add.text(100, height - 25, '0', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '20px',
      color: '#FFFFFF',
    }).setOrigin(0, 0.5);

    this.createSmallButton(200, height - 35, `$${GAME_CONSTANTS.AUDIT_COST}`, 0x8B5CF6, () => {
      this.buyAudit();
    });

    // Insurance
    this.add.text(350, height - 45, '🏥 Insurance:', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#A1A1AA',
    }).setOrigin(0, 0.5);

    this.insuranceText = this.add.text(350, height - 25, '0', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '20px',
      color: '#FFFFFF',
    }).setOrigin(0, 0.5);

    this.createSmallButton(460, height - 35, `$${GAME_CONSTANTS.INSURANCE_COST}`, 0x8B5CF6, () => {
      this.buyInsurance();
    });

    // Gas indicator
    this.add.text(width - 150, height - 35, '⛽ Gas: 1x', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#A1A1AA',
    }).setOrigin(0, 0.5);
  }

  update(time: number, _delta: number): void {
    if (this.gameState.isGameOver || this.gameState.isVictory) return;

    // Update elapsed time
    this.gameState.currentRun.elapsed = Date.now() - this.gameState.currentRun.startTime;

    // Yield tick (every 1 second)
    if (time - this.lastYieldTick >= GAME_CONSTANTS.YIELD_TICK_MS) {
      this.tickYields();
      this.lastYieldTick = time;
    }

    // RNG check
    if (time - this.lastRNGCheck >= this.nextRNGInterval) {
      this.checkRNGEvent();
      this.lastRNGCheck = time;
      this.resetRNGInterval();
    }

    // Update halving timer
    this.updateHalvingTimer();

    // Check temporary effects
    this.checkTemporaryEffects();

    // Check win/lose conditions
    this.checkEndConditions();

    // Update UI
    this.updateUI();
  }

  private tickYields(): void {
    let totalYield = 0;

    this.gameState.pools.forEach(pool => {
      if (pool.isRugged || pool.deposited <= 0) return;

      // Calculate yield per second
      let yieldPerSecond = pool.deposited * (pool.apy / 100) / 365 / 24 / 60 / 60;

      // Apply halving multiplier
      yieldPerSecond *= this.gameState.halvingMultiplier;

      // Apply whale dump reduction if active
      if (this.gameState.whaleEndTime && Date.now() < this.gameState.whaleEndTime) {
        const reduction = this.gameState.items.insurance > 0
          ? GAME_CONSTANTS.WHALE_YIELD_REDUCTION * GAME_CONSTANTS.INSURANCE_DAMAGE_REDUCTION
          : GAME_CONSTANTS.WHALE_YIELD_REDUCTION;
        yieldPerSecond *= (1 - reduction);
      }

      // Apply pump multiplier if active
      if (pool.isPumping && pool.pumpEndTime && Date.now() < pool.pumpEndTime) {
        yieldPerSecond *= GAME_CONSTANTS.PUMP_MULTIPLIER;
      }

      totalYield += yieldPerSecond;
    });

    this.gameState.portfolio += totalYield;

    // Update highest portfolio stat
    if (this.gameState.portfolio > this.gameState.stats.highestPortfolio) {
      this.gameState.stats.highestPortfolio = this.gameState.portfolio;
    }
  }

  private updateHalvingTimer(): void {
    const elapsed = this.gameState.currentRun.elapsed;
    const halvingInterval = GAME_CONSTANTS.HALVING_INTERVAL_MS;
    const timeInCurrentCycle = elapsed % halvingInterval;
    const timeRemaining = halvingInterval - timeInCurrentCycle;

    // Check if we need to halve
    const expectedHalvings = Math.floor(elapsed / halvingInterval);
    if (expectedHalvings > this.gameState.currentRun.halvingCount) {
      this.executeHalving();
      this.gameState.currentRun.halvingCount = expectedHalvings;
    }

    // Update halving display
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    this.halvingText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);

    // Update progress bar
    const progress = 1 - (timeRemaining / halvingInterval);
    this.halvingBar.width = 80 * progress;
  }

  private executeHalving(): void {
    this.gameState.halvingMultiplier *= 0.5;
    this.showToast('⏰ HALVING!', 'Yields cut by 50%!', 0xF59E0B);
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

    // Select target pool (favor high APY for rugs/exploits)
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
      // Weight by APY (higher APY = more likely target)
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
      case 'rug':
        this.executeRug(event);
        break;
      case 'exploit':
        this.executeExploit(event);
        break;
      case 'whale':
        this.executeWhaleDump(event);
        break;
      case 'gas':
        this.executeGasSpike(event);
        break;
      case 'pump':
        this.executePump(event);
        break;
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

    this.showToast('🚨 RUG PULL!', `${pool.name} rugged! Lost $${lostAmount.toFixed(2)}`, 0xEF4444);
    this.setRalphQuote('rug');
    this.flashPoolCard(pool.id, 0xEF4444);
  }

  private executeExploit(event: GameEvent): void {
    if (!event.targetPoolId) return;

    const pool = this.gameState.pools.find(p => p.id === event.targetPoolId);
    if (!pool || pool.isRugged) return;

    // Check if audit blocks it
    if (this.gameState.items.audits > 0) {
      this.gameState.items.audits--;
      this.showToast('🛡️ EXPLOIT BLOCKED!', `Audit saved ${pool.name}!`, 0x10B981);
      this.setRalphQuote('exploitBlocked');
      return;
    }

    const lostAmount = pool.deposited * GAME_CONSTANTS.EXPLOIT_DAMAGE;
    pool.deposited -= lostAmount;

    this.showToast('⚠️ EXPLOIT!', `${pool.name} exploited! Lost $${lostAmount.toFixed(2)}`, 0xF59E0B);
    this.setRalphQuote('exploit');
    this.flashPoolCard(pool.id, 0xF59E0B);
  }

  private executeWhaleDump(_event: GameEvent): void {
    this.gameState.whaleEndTime = Date.now() + GAME_CONSTANTS.WHALE_DURATION_MS;
    const reduction = this.gameState.items.insurance > 0 ? '15%' : '30%';

    this.showToast('🐋 WHALE DUMP!', `All yields -${reduction} for 60s`, 0x3B82F6);
    this.setRalphQuote('whale');
  }

  private executeGasSpike(_event: GameEvent): void {
    this.gameState.gasMultiplier = GAME_CONSTANTS.GAS_MULTIPLIER;
    this.gameState.gasEndTime = Date.now() + GAME_CONSTANTS.GAS_DURATION_MS;

    this.showToast('⛽ GAS SPIKE!', 'Actions cost 3x for 30s', 0xF59E0B);
    this.setRalphQuote('gas');
  }

  private executePump(event: GameEvent): void {
    if (!event.targetPoolId) return;

    const pool = this.gameState.pools.find(p => p.id === event.targetPoolId);
    if (!pool || pool.isRugged) return;

    pool.isPumping = true;
    pool.pumpEndTime = Date.now() + GAME_CONSTANTS.PUMP_DURATION_MS;

    this.showToast('🚀 PUMP!', `${pool.name} 2x yields for 30s!`, 0x10B981);
    this.setRalphQuote('pump');
    this.flashPoolCard(pool.id, 0x10B981);
  }

  private checkTemporaryEffects(): void {
    const now = Date.now();

    // Check gas spike end
    if (this.gameState.gasEndTime && now >= this.gameState.gasEndTime) {
      this.gameState.gasMultiplier = 1;
      this.gameState.gasEndTime = null;
    }

    // Check whale dump end
    if (this.gameState.whaleEndTime && now >= this.gameState.whaleEndTime) {
      this.gameState.whaleEndTime = null;
    }

    // Check pump ends
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
      this.scene.start('WinScene', {
        portfolio: this.gameState.portfolio,
        stats: this.gameState.stats,
        elapsed: this.gameState.currentRun.elapsed,
      });
    }

    if (this.gameState.portfolio <= 0) {
      this.gameState.isGameOver = true;
      this.scene.start('DeathScene', {
        portfolio: this.gameState.portfolio,
        stats: this.gameState.stats,
        elapsed: this.gameState.currentRun.elapsed,
      });
    }
  }

  private deposit(poolId: string, amount: number): void {
    const pool = this.gameState.pools.find(p => p.id === poolId);
    if (!pool || pool.isRugged) return;

    const cost = amount * this.gameState.gasMultiplier;
    if (this.gameState.portfolio < cost) return;

    this.gameState.portfolio -= cost;
    pool.deposited += amount;

    const quoteType = pool.riskLevel === 'degen' ? 'depositHighRisk' : 'deposit';
    this.setRalphQuote(quoteType);
  }

  private withdraw(poolId: string, amount: number): void {
    const pool = this.gameState.pools.find(p => p.id === poolId);
    if (!pool || pool.isRugged || pool.deposited < amount) return;

    pool.deposited -= amount;
    this.gameState.portfolio += amount;
    this.setRalphQuote('withdraw');
  }

  private buyAudit(): void {
    const cost = GAME_CONSTANTS.AUDIT_COST * this.gameState.gasMultiplier;
    if (this.gameState.portfolio < cost) return;

    this.gameState.portfolio -= cost;
    this.gameState.items.audits++;
  }

  private buyInsurance(): void {
    const cost = GAME_CONSTANTS.INSURANCE_COST * this.gameState.gasMultiplier;
    if (this.gameState.portfolio < cost) return;

    this.gameState.portfolio -= cost;
    this.gameState.items.insurance++;
  }

  private updateUI(): void {
    // Portfolio
    this.portfolioText.setText(`$${this.gameState.portfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    // Pool cards
    this.gameState.pools.forEach(pool => {
      const card = this.poolCards.get(pool.id);
      if (!card) return;

      card.depositedText.setText(`$${pool.deposited.toFixed(2)}`);

      // Calculate yield per second for display
      let yps = pool.deposited * (pool.apy / 100) / 365 / 24 / 60 / 60 * this.gameState.halvingMultiplier;
      if (pool.isPumping) yps *= 2;
      card.yieldText.setText(`+$${yps.toFixed(4)}/sec`);

      // Update colors based on state
      if (pool.isRugged) {
        card.bg.setFillStyle(0x3D3D5C);
        card.depositedText.setColor('#EF4444');
      } else if (pool.isPumping) {
        card.bg.setStrokeStyle(2, 0x10B981);
      } else {
        card.bg.setStrokeStyle(1, 0x3D3D5C);
      }
    });

    // Items
    this.auditsText.setText(this.gameState.items.audits.toString());
    this.insuranceText.setText(this.gameState.items.insurance.toString());
  }

  private showToast(title: string, message: string, color: number): void {
    const toast = this.add.container(0, 0);

    const bg = this.add.rectangle(0, 0, 300, 80, 0x1E1E32);
    bg.setStrokeStyle(3, color);

    const titleText = this.add.text(-130, -20, title, {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    const msgText = this.add.text(-130, 10, message, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#A1A1AA',
    }).setOrigin(0, 0.5);

    toast.add([bg, titleText, msgText]);
    toast.setPosition(-170, this.toastContainer.list.length * 100);
    this.toastContainer.add(toast);

    // Animate in
    this.tweens.add({
      targets: toast,
      x: -170,
      alpha: { from: 0, to: 1 },
      duration: 300,
    });

    // Remove after delay
    this.time.delayedCall(4000, () => {
      this.tweens.add({
        targets: toast,
        alpha: 0,
        duration: 300,
        onComplete: () => toast.destroy(),
      });
    });
  }

  private setRalphQuote(category: string): void {
    const quote = getRandomQuote(category as keyof typeof import('../data/ralph-quotes.ts').RALPH_QUOTES);
    this.ralphText.setText(`Ralph: "${quote}"`);
  }

  private flashPoolCard(poolId: string, color: number): void {
    const card = this.poolCards.get(poolId);
    if (!card) return;

    this.tweens.add({
      targets: card.bg,
      fillColor: { from: color, to: 0x1E1E32 },
      duration: 500,
      yoyo: true,
      repeat: 2,
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
}
