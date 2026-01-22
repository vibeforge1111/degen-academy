// Boot Scene - Loading and initialization for DEGEN ACADEMY

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a14);

    // Title with glow effect
    const title = this.add.text(width / 2, height / 2 - 100, '🧪 DEGEN ACADEMY', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '48px',
      color: '#8B5CF6',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 - 50, 'THE LAB', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '24px',
      color: '#06B6D4',
    }).setOrigin(0.5);

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 + 20, 'Initializing lab systems...', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '16px',
      color: '#A1A1AA',
    }).setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.rectangle(width / 2, height / 2 + 60, 400, 12, 0x1E1E32);
    progressBarBg.setOrigin(0.5);
    progressBarBg.setStrokeStyle(1, 0x3D3D5C);

    // Progress bar fill
    const progressBar = this.add.rectangle(width / 2 - 198, height / 2 + 60, 0, 8, 0x8B5CF6);
    progressBar.setOrigin(0, 0.5);

    // Pulsing title effect
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.7 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      progressBar.width = 396 * value;
      const messages = [
        'Initializing lab systems...',
        'Loading yield compounds...',
        'Calibrating risk meters...',
        'Waking up Ralph...',
        'Ready to experiment!',
      ];
      const msgIndex = Math.min(Math.floor(value * messages.length), messages.length - 1);
      loadingText.setText(messages[msgIndex] ?? 'Loading...');
    });

    this.load.on('complete', () => {
      loadingText.setText('Lab systems online!');
      loadingText.setColor('#10B981');
    });

    // Load actual game assets
    this.load.image('lab-bg', '/assets/lab-background.png');

    // Load custom icons
    this.load.image('icon-start', '/assets/icon-start.png');
    this.load.image('icon-goal', '/assets/icon-goal.png');
    this.load.image('icon-halving', '/assets/icon-halving.png');
  }

  create(): void {
    // Short delay before transitioning to menu
    this.time.delayedCall(800, () => {
      this.scene.start('MenuScene');
    });
  }
}
