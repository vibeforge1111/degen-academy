// Boot Scene - Loading and initialization for DEGEN ACADEMY

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0F0F1A);
    bg.setOrigin(0.5);

    // Title
    this.add.text(width / 2, height / 2 - 100, 'DEGEN ACADEMY', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '48px',
      color: '#8B5CF6',
    }).setOrigin(0.5);

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '24px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.rectangle(width / 2, height / 2 + 50, 400, 20, 0x1E1E32);
    progressBarBg.setOrigin(0.5);

    // Progress bar fill
    const progressBar = this.add.rectangle(width / 2 - 198, height / 2 + 50, 0, 16, 0x8B5CF6);
    progressBar.setOrigin(0, 0.5);

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      progressBar.width = 396 * value;
      loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      loadingText.setText('Ready!');
    });

    // For now, we'll use placeholder assets
    // In production, load actual images and audio here

    // Simulate some loading time for the effect
    for (let i = 0; i < 10; i++) {
      this.load.image(`placeholder_${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }

  create(): void {
    // Short delay before transitioning to menu
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
