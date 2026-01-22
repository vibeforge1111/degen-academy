// Phaser game configuration for DEGEN ACADEMY

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { MenuScene } from './scenes/MenuScene.ts';
import { GameScene } from './scenes/GameScene.ts';
import { DeathScene } from './scenes/DeathScene.ts';
import { WinScene } from './scenes/WinScene.ts';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#0F0F1A',
  scene: [BootScene, MenuScene, GameScene, DeathScene, WinScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 450,
    },
    max: {
      width: 1920,
      height: 1080,
    },
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
