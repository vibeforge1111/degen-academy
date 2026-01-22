// Phaser game configuration for DEGEN ACADEMY

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { MenuScene } from './scenes/MenuScene.ts';
import { GameScene } from './scenes/GameScene.ts';
import { DeathScene } from './scenes/DeathScene.ts';
import { WinScene } from './scenes/WinScene.ts';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  // Base resolution - will be overridden by RESIZE mode
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#0F0F1A',
  scene: [BootScene, MenuScene, GameScene, DeathScene, WinScene],
  scale: {
    // RESIZE mode: Canvas fills parent container, no letterboxing
    // The game resolution dynamically matches the viewport
    mode: Phaser.Scale.RESIZE,
    // No autoCenter needed with RESIZE - canvas fills parent
    autoCenter: Phaser.Scale.NO_CENTER,
    // Parent container
    parent: 'game-container',
    // Ensure canvas stretches to fill
    width: '100%',
    height: '100%',
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false,
  },
  dom: {
    createContainer: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};
