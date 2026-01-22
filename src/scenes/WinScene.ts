// Win Scene for DEGEN ACADEMY

import Phaser from 'phaser';
import { getRandomQuote } from '../data/ralph-quotes.ts';
import type { GameStats } from '../types/game.ts';

interface WinSceneData {
  portfolio: number;
  stats: GameStats;
  elapsed: number;
}

export class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  create(data: WinSceneData): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Purple/gold gradient-ish background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0F0F1A);
    this.add.rectangle(width / 2, height / 2, width, height, 0x8B5CF6, 0.1);

    // Confetti effect (simple particles)
    this.createConfetti();

    // Celebration emoji
    this.add.text(width / 2, 100, '🎉 🎓 🎉', {
      fontSize: '72px',
    }).setOrigin(0.5);

    // Title
    this.add.text(width / 2, 200, 'YOU GRADUATED!', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '56px',
      color: '#10B981',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 260, '"Ready to lose real money now"', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      color: '#F59E0B',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Stats card
    this.add.rectangle(width / 2, 400, 350, 200, 0x1E1E32).setStrokeStyle(2, 0x10B981);

    const stats = data.stats ?? { rugsEaten: 0, highestPortfolio: 1000000, gamesPlayed: 1, totalTimePlayed: 0, fastestWin: null };
    const elapsed = data.elapsed ?? 0;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    const statLines = [
      `Final Portfolio: $${(data.portfolio ?? 1000000).toLocaleString()}`,
      `Time to Graduate: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      `Rugs Survived: ${stats.rugsEaten}`,
      `DeFi IQ: GALAXY BRAIN 🧠`,
    ];

    statLines.forEach((line, i) => {
      this.add.text(width / 2, 330 + i * 35, line, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '18px',
        color: '#FFFFFF',
      }).setOrigin(0.5);
    });

    // Buttons
    this.createButton(width / 2 - 120, 550, 'PLAY AGAIN 🔄', 0x8B5CF6, () => {
      this.scene.start('GameScene');
    });

    this.createButton(width / 2 + 120, 550, 'FLEX ON X 🐦', 0x10B981, () => {
      this.shareToTwitter(data);
    });

    // Ralph quote
    const ralphQuote = getRandomQuote('victory');
    this.add.text(width / 2, 650, `Ralph: "${ralphQuote}"`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#A1A1AA',
      fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private createConfetti(): void {
    const colors = [0x8B5CF6, 0xF59E0B, 0x10B981, 0x06B6D4, 0xEF4444];
    const width = this.cameras.main.width;

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = -50 - Math.random() * 200;
      const color = colors[Math.floor(Math.random() * colors.length)] ?? 0x8B5CF6;
      const size = 5 + Math.random() * 10;

      const particle = this.add.rectangle(x, y, size, size, color);

      this.tweens.add({
        targets: particle,
        y: 800,
        x: x + (Math.random() - 0.5) * 200,
        rotation: Math.random() * 10,
        duration: 2000 + Math.random() * 2000,
        delay: Math.random() * 1000,
        repeat: -1,
        onRepeat: () => {
          particle.x = Math.random() * width;
          particle.y = -50;
        },
      });
    }
  }

  private createButton(x: number, y: number, text: string, color: number, callback: () => void): void {
    const bg = this.add.rectangle(x, y, 180, 50, color);
    bg.setInteractive({ useHandCursor: true });

    this.add.text(x, y, text, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout', () => bg.setAlpha(1));
    bg.on('pointerup', callback);
  }

  private shareToTwitter(data: WinSceneData): void {
    const elapsed = data.elapsed ?? 0;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const stats = data.stats ?? { rugsEaten: 0 };

    const text = `I just GRADUATED from DEGEN ACADEMY! 🎓🎉

💰 Portfolio: $${(data.portfolio ?? 1000000).toLocaleString()}
⏱️ Time: ${minutes}:${seconds.toString().padStart(2, '0')}
🚨 Rugs survived: ${stats.rugsEaten}

I'm ready to lose real money now! JK... maybe.

Learn DeFi free:`;

    const url = encodeURIComponent(window.location.href);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
    window.open(tweetUrl, '_blank');
  }
}
