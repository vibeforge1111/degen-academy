// Phaser game configuration for DEGEN ACADEMY

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { MenuScene } from './scenes/MenuScene.ts';
import { GameScene } from './scenes/GameScene.ts';
import { DeathScene } from './scenes/DeathScene.ts';
import { WinScene } from './scenes/WinScene.ts';

// Fixed game resolution - designed for this specific size
// The game will scale to fit the viewport while maintaining aspect ratio
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,  // Force WebGL for smooth rendering
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0F0F1A',
  scene: [BootScene, MenuScene, GameScene, DeathScene, WinScene],
  scale: {
    // FIT mode: Scales canvas to fit while maintaining 16:9 aspect ratio
    // This gives a stable, predictable layout
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
  },
  render: {
    pixelArt: false,        // NO pixel art mode
    antialias: true,        // Enable antialiasing
    antialiasGL: true,      // Enable WebGL antialiasing
    roundPixels: false,     // NO pixel rounding
    transparent: false,
    mipmapFilter: 'LINEAR', // Smooth mipmap filtering
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
