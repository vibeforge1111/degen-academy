// Death Scene for DEGEN ACADEMY

import Phaser from 'phaser';
import { getRandomQuote } from '../data/ralph-quotes.ts';
import type { GameStats } from '../types/game.ts';

interface DeathSceneData {
  portfolio: number;
  stats: GameStats;
  elapsed: number;
}

export class DeathScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeathScene' });
  }

  create(data: DeathSceneData): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Lab background
    const bg = this.add.image(width / 2, height / 2, 'lab-bg');
    bg.setDisplaySize(width, height);

    // Dark overlay with red tint for death
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a14, 0.8);
    this.add.rectangle(width / 2, height / 2, width, height, 0xEF4444, 0.15);

    // Scanlines
    const scanlines = this.add.graphics();
    scanlines.fillStyle(0x000000, 0.1);
    for (let y = 0; y < height; y += 4) {
      scanlines.fillRect(0, y, width, 2);
    }

    // Skull
    this.add.text(width / 2, 120, '💀', {
      fontSize: '96px',
    }).setOrigin(0.5);

    // Title
    this.add.text(width / 2, 220, 'YOU GOT REKT', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '56px',
      color: '#EF4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Funny quote
    const deathQuotes = [
      '"The real rug was the friends we lost along the way"',
      '"At least it wasn\'t real money"',
      '"NGMI (but you can try again)"',
      '"Have you tried buying high and selling low?"',
    ];
    const quote = deathQuotes[Math.floor(Math.random() * deathQuotes.length)];
    this.add.text(width / 2, 290, quote ?? '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      color: '#A1A1AA',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Stats card
    const statsCard = this.add.rectangle(width / 2, 420, 350, 180, 0x1E1E32);
    statsCard.setStrokeStyle(1, 0x3D3D5C);

    const stats = data.stats ?? { rugsEaten: 0, highestPortfolio: 10000, gamesPlayed: 0, totalTimePlayed: 0, fastestWin: null };
    const elapsed = data.elapsed ?? 0;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    const statLines = [
      `Final Portfolio: $${(data.portfolio ?? 0).toFixed(2)}`,
      `Time Survived: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      `Rugs Eaten: ${stats.rugsEaten}`,
      `Highest Portfolio: $${stats.highestPortfolio.toLocaleString()}`,
    ];

    statLines.forEach((line, i) => {
      this.add.text(width / 2, 360 + i * 30, line, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '18px',
        color: '#FFFFFF',
      }).setOrigin(0.5);
    });

    // Buttons
    this.createButton(width / 2 - 120, 550, 'TRY AGAIN 🔄', 0x8B5CF6, () => {
      this.scene.start('GameScene');
    });

    this.createButton(width / 2 + 120, 550, 'SHARE L 🐦', 0x1DA1F2, () => {
      this.shareToTwitter(data);
    });

    // Ralph quote
    const ralphQuote = getRandomQuote('death');
    this.add.text(width / 2, 650, `Ralph: "${ralphQuote}"`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#A1A1AA',
      fontStyle: 'italic',
    }).setOrigin(0.5);
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

  private shareToTwitter(data: DeathSceneData): void {
    const elapsed = data.elapsed ?? 0;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const stats = data.stats ?? { rugsEaten: 0 };

    const text = `I just got REKT in DEGEN ACADEMY! 💀

⏱️ Survived: ${minutes}:${seconds.toString().padStart(2, '0')}
🚨 Rugs eaten: ${stats.rugsEaten}
💰 Final: $${(data.portfolio ?? 0).toFixed(2)}

Can you do better? Play free:`;

    const url = encodeURIComponent(window.location.href);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
    window.open(tweetUrl, '_blank');
  }
}
