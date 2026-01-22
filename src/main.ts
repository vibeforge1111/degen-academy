// DEGEN ACADEMY - Main Entry Point
// "Learn DeFi by getting rekt (safely)"

import Phaser from 'phaser';
import { gameConfig } from './config.ts';
import './style.css';

// Initialize the game
const game = new Phaser.Game(gameConfig);

// Handle window resize for responsive scaling
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Prevent context menu on right-click (for game feel)
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Log startup
console.log('%c DEGEN ACADEMY ', 'background: #8B5CF6; color: white; font-size: 24px; font-weight: bold;');
console.log('%c "Learn DeFi by getting rekt (safely)" ', 'color: #A1A1AA; font-style: italic;');
console.log('Game initialized. WAGMI! (or not...)');

export { game };
