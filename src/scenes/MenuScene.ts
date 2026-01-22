// Menu Scene for DEGEN ACADEMY - The Lab

import Phaser from 'phaser';
import { getRandomQuote } from '../data/ralph-quotes.ts';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Lab background - fills entire canvas
    const bg = this.add.image(width / 2, height / 2, 'lab-bg');
    bg.setDisplaySize(width, height);

    // Subtle dark overlay for readability (less opacity to show more background)
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a14, 0.6);

    // Scanlines effect
    const scanlines = this.add.graphics();
    scanlines.fillStyle(0x000000, 0.08);
    for (let y = 0; y < height; y += 4) {
      scanlines.fillRect(0, y, width, 2);
    }

    // === LAYOUT FROM TOP ===
    const padding = 40;
    let currentY = padding;

    // Main title - no box, just text with shadow effect
    this.add.text(width / 2 + 2, currentY + 2, '🧪 DEGEN ACADEMY', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '48px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setAlpha(0.3);

    this.add.text(width / 2, currentY, '🧪 DEGEN ACADEMY', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '48px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    currentY += 60;

    // Subtitle
    this.add.text(width / 2, currentY, 'THE LAB - Learn DeFi by getting rekt (safely)', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#06B6D4',
    }).setOrigin(0.5, 0);

    currentY += 50;

    // Play button
    const playBtn = this.createGlowButton(width / 2, currentY + 30, 'ENTER THE LAB', 0x8B5CF6, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene');
      });
    });

    // Subtle pulsing animation on play button (reduced)
    this.tweens.add({
      targets: playBtn,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    currentY += 100;

    // Info cards - positioned lower, swapped left and middle icons
    const cardY = currentY + 140;
    const cardSpacing = 240;
    this.createInfoCard(width / 2 - cardSpacing, cardY, 'icon-goal', 'Goal: $1,000,000', 'Reach to graduate');
    this.createInfoCard(width / 2, cardY, 'icon-start', 'Start: $10,000', 'Your initial funding');
    this.createInfoCard(width / 2 + cardSpacing, cardY, 'icon-halving', 'Halving: 5 min', 'Yields cut 50%');

    // === BOTTOM SECTION ===
    // Ralph quote section - positioned from bottom
    const quoteBg = this.add.graphics();
    quoteBg.fillStyle(0x1a1a2e, 0.9);
    quoteBg.fillRoundedRect(padding, height - 110, width - (padding * 2), 70, 10);
    quoteBg.lineStyle(1, 0x3d3d5c, 1);
    quoteBg.strokeRoundedRect(padding, height - 110, width - (padding * 2), 70, 10);

    // Ralph avatar
    this.add.text(padding + 30, height - 75, '🐕', { fontSize: '28px' }).setOrigin(0.5);

    // Ralph quote
    const quote = getRandomQuote('welcome');
    this.add.text(padding + 60, height - 88, 'Ralph says:', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#8B5CF6',
      fontStyle: 'bold',
    });
    this.add.text(padding + 60, height - 72, `"${quote}"`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#A1A1AA',
      fontStyle: 'italic',
      wordWrap: { width: width - 160 },
    });

    // Footer
    this.add.text(width / 2, height - 18, 'No real money. Just vibes and education. WAGMI (or not)', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      color: '#71717A',
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  private createGlowButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Outer glow
    const glow = this.add.graphics();
    glow.fillStyle(color, 0.3);
    glow.fillRoundedRect(-130, -35, 260, 70, 16);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-120, -30, 240, 60, 12);

    // Hitbox
    const hitbox = this.add.rectangle(0, 0, 240, 60, 0x000000, 0);
    hitbox.setInteractive({ useHandCursor: true });

    // Text
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '22px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([glow, bg, hitbox, label]);

    // Hover effects
    hitbox.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x7c3aed, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 12);
      this.tweens.add({
        targets: container,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 100,
      });
    });

    hitbox.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 12);
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    hitbox.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(0x6d28d9, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 12);
    });

    hitbox.on('pointerup', callback);

    return container;
  }

  private createInfoCard(x: number, y: number, iconKey: string, title: string, desc: string): void {
    // Use integer positions for crisp text
    const px = Math.round(x);
    const py = Math.round(y);

    // Card background
    const card = this.add.graphics();
    card.fillStyle(0x1a1a2e, 0.9);
    card.fillRoundedRect(px - 105, py - 85, 210, 170, 14);

    // Neon green border glow effect
    card.lineStyle(2, 0x22c55e, 0.8);
    card.strokeRoundedRect(px - 105, py - 85, 210, 170, 14);

    // Outer glow
    card.lineStyle(4, 0x22c55e, 0.2);
    card.strokeRoundedRect(px - 107, py - 87, 214, 174, 16);

    // Use image sprite - bigger icons with smooth scaling
    const icon = this.add.image(px, py - 30, iconKey);
    icon.setOrigin(0.5);
    icon.setDisplaySize(88, 88);
    // Enable linear filtering for smooth scaling
    icon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

    this.add.text(px, py + 38, title, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '15px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(px, py + 60, desc, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#71717A',
    }).setOrigin(0.5);
  }
}
