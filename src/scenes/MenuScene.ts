// Menu Scene for DEGEN ACADEMY

import Phaser from 'phaser';
import { getRandomQuote } from '../data/ralph-quotes.ts';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0F0F1A);

    // Title
    this.add.text(width / 2, 150, 'DEGEN ACADEMY', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '64px',
      color: '#8B5CF6',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 220, '"Learn DeFi by getting rekt (safely)"', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '24px',
      color: '#A1A1AA',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Play button
    this.createButton(width / 2, 350, 'PLAY', () => {
      this.scene.start('GameScene');
    });

    // Ralph quote
    const quote = getRandomQuote('welcome');
    this.add.text(width / 2, 550, `"${quote}"`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#A1A1AA',
      fontStyle: 'italic',
      wordWrap: { width: 600 },
      align: 'center',
    }).setOrigin(0.5);

    // Ralph label
    this.add.text(width / 2, 600, '- Ralph', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#8B5CF6',
    }).setOrigin(0.5);

    // Footer
    this.add.text(width / 2, height - 30, 'No real money. Just vibes and education.', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#71717A',
    }).setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 200, 60, 0x8B5CF6, 1);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([bg, label]);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(0x7C3AED);
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x8B5CF6);
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x6D28D9);
    });

    bg.on('pointerup', () => {
      callback();
    });

    return container;
  }
}
