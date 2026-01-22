# DEGEN ACADEMY - Technical Architecture

> **Build Guide for Day 1 Stream**

---

## 1. Tech Stack (Finalized)

| Layer | Technology | Why |
|-------|------------|-----|
| **Game Engine** | Phaser 3.80+ | Battle-tested 2D engine, huge community, perfect for idle games |
| **Language** | TypeScript | Type safety, better autocomplete, fewer bugs |
| **UI Overlay** | HTML/CSS + Tailwind | Easier than Phaser UI for menus, modals |
| **Build Tool** | Vite | Fast HMR, native TS support, simple config |
| **Audio** | Phaser Audio (Web Audio API) | Built-in, no extra library needed |
| **Storage (MVP)** | LocalStorage | Zero backend, instant saves |
| **Storage (v2)** | Supabase | Auth + leaderboards + cloud saves |
| **Hosting** | Vercel | Free tier, instant deploys, perfect for static |
| **Analytics** | PostHog | Free tier, privacy-friendly |

---

## 2. Project Structure

```
degen-academy/
├── index.html                 # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
│
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── pools/        # Pool sprites (6 pools)
│   │   │   ├── ui/           # Buttons, icons
│   │   │   ├── effects/      # Rug explosion, pump glow
│   │   │   └── ralph/        # Ralph mascot sprites
│   │   └── audio/
│   │       ├── sfx/          # Sound effects
│   │       └── music/        # Lo-fi background
│   └── favicon.ico
│
├── src/
│   ├── main.ts               # Phaser game init
│   ├── config.ts             # Game configuration
│   │
│   ├── scenes/
│   │   ├── BootScene.ts      # Asset preloading
│   │   ├── MenuScene.ts      # Main menu
│   │   ├── GameScene.ts      # Core gameplay (THE BIG ONE)
│   │   ├── DeathScene.ts     # Game over screen
│   │   └── WinScene.ts       # Victory screen
│   │
│   ├── systems/
│   │   ├── PoolManager.ts    # Manages 6 yield pools
│   │   ├── YieldEngine.ts    # Calculates yields per tick
│   │   ├── RNGEngine.ts      # Random events (rugs, pumps, etc)
│   │   ├── HalvingTimer.ts   # Countdown + halving logic
│   │   ├── ItemManager.ts    # Audits, insurance
│   │   └── SaveManager.ts    # LocalStorage persistence
│   │
│   ├── entities/
│   │   ├── Pool.ts           # Single pool entity
│   │   ├── Ralph.ts          # AI mascot logic + quotes
│   │   └── Particle.ts       # Visual effects
│   │
│   ├── ui/
│   │   ├── HUD.ts            # Portfolio, timer display
│   │   ├── PoolCard.ts       # Individual pool UI
│   │   ├── EventToast.ts     # RNG event notifications
│   │   └── ShareButton.ts    # Twitter share
│   │
│   ├── data/
│   │   ├── pools.ts          # Pool configurations
│   │   ├── events.ts         # RNG event definitions
│   │   ├── ralph-quotes.ts   # Ralph's sarcastic lines
│   │   └── constants.ts      # Game balance constants
│   │
│   └── types/
│       ├── game.ts           # Core game types
│       └── events.ts         # Event types
│
└── styles/
    └── main.css              # Tailwind + custom styles
```

---

## 3. Core Systems Architecture

### 3.1 Game State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                      GAME STATE MACHINE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐            │
│   │  BOOT   │────▶│  MENU   │────▶│  PLAY   │            │
│   │ (load)  │     │         │     │ (game)  │            │
│   └─────────┘     └─────────┘     └────┬────┘            │
│                        ▲               │                  │
│                        │        ┌──────┴──────┐          │
│                        │        ▼             ▼          │
│                   ┌─────────┐         ┌─────────┐        │
│                   │  DEATH  │         │   WIN   │        │
│                   │ ($0)    │         │ ($1M)   │        │
│                   └─────────┘         └─────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Core Game Loop (GameScene)

```typescript
// Runs every frame (~60fps)
update(time: number, delta: number) {
  // 1. Update yields (every 1 second)
  if (this.shouldTickYield(time)) {
    this.yieldEngine.tick();
    this.updatePortfolioDisplay();
  }

  // 2. Check RNG events (every 30-60 seconds)
  if (this.shouldCheckRNG(time)) {
    const event = this.rngEngine.roll();
    if (event) this.executeEvent(event);
  }

  // 3. Update halving timer
  this.halvingTimer.update(delta);
  if (this.halvingTimer.shouldHalve()) {
    this.executeHalving();
  }

  // 4. Check win/lose conditions
  if (this.portfolio <= 0) this.gameOver();
  if (this.portfolio >= 1_000_000) this.victory();

  // 5. Update UI
  this.hud.update();
}
```

### 3.3 Pool System

```typescript
interface Pool {
  id: string;
  name: string;
  apy: number;              // 8% to 420%
  riskLevel: 'safe' | 'medium' | 'degen';
  deposited: number;        // Player's stake
  isRugged: boolean;
  hasAudit: boolean;        // Protected from exploits
  isPumping: boolean;       // Temporary 2x bonus

  // Computed
  yieldPerSecond: number;   // deposited * (apy / 365 / 24 / 60 / 60)
}

// Pool configurations (data/pools.ts)
const POOLS: PoolConfig[] = [
  { id: 'stable', name: 'StableYield', apy: 8, risk: 'safe' },
  { id: 'blue', name: 'BlueChip', apy: 25, risk: 'safe' },
  { id: 'growth', name: 'GrowthFi', apy: 69, risk: 'medium' },
  { id: 'yield', name: 'YieldMax', apy: 150, risk: 'medium' },
  { id: 'degen', name: 'DegenPool', apy: 300, risk: 'degen' },
  { id: 'moon', name: 'MoonShot', apy: 420, risk: 'degen' },
];
```

### 3.4 RNG Event System

```typescript
interface RNGEvent {
  type: 'rug' | 'exploit' | 'whale' | 'gas' | 'pump';
  weight: number;           // Probability weight
  targetPool?: string;      // Which pool affected
  magnitude: number;        // Severity 0-1
  duration?: number;        // For temporary effects (ms)
  canBlock?: boolean;       // Can audit/insurance prevent?
}

// Event weights (data/events.ts)
const EVENT_WEIGHTS = {
  rug: 15,      // 15% - Pool drains 100%
  exploit: 20,  // 20% - Pool drains 50% (audit blocks)
  whale: 25,    // 25% - All yields -30% for 60s
  gas: 30,      // 30% - Actions cost 3x for 30s
  pump: 10,     // 10% - Random pool 2x for 30s
};

// RNG Engine logic
class RNGEngine {
  roll(): RNGEvent | null {
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const [type, weight] of Object.entries(EVENT_WEIGHTS)) {
      cumulative += weight;
      if (rand < cumulative) {
        return this.createEvent(type as EventType);
      }
    }
    return null;
  }

  private createEvent(type: EventType): RNGEvent {
    const targetPool = this.selectTargetPool(type);
    return {
      type,
      weight: EVENT_WEIGHTS[type],
      targetPool,
      magnitude: Math.random(),
      duration: type === 'whale' || type === 'gas' || type === 'pump' ? 60000 : undefined,
      canBlock: type === 'exploit',
    };
  }
}
```

### 3.5 Halving System

```typescript
class HalvingTimer {
  private intervalMs = 5 * 60 * 1000;  // 5 minutes
  private elapsed = 0;
  private halvingCount = 0;

  update(delta: number) {
    this.elapsed += delta;
  }

  shouldHalve(): boolean {
    if (this.elapsed >= this.intervalMs) {
      this.elapsed = 0;
      this.halvingCount++;
      return true;
    }
    return false;
  }

  getMultiplier(): number {
    return Math.pow(0.5, this.halvingCount);  // 1, 0.5, 0.25, 0.125...
  }

  getTimeRemaining(): number {
    return this.intervalMs - this.elapsed;
  }
}
```

### 3.6 Save System

```typescript
interface SaveData {
  version: number;
  portfolio: number;
  pools: Pool[];
  items: { audits: number; insurance: number };
  stats: {
    rugsEaten: number;
    highestPortfolio: number;
    gamesPlayed: number;
    totalTimePlayed: number;
    fastestWin: number | null;
  };
  currentRun: {
    startTime: number;
    halvingCount: number;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}

class SaveManager {
  private key = 'degen-academy-save';

  save(data: SaveData): void {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  load(): SaveData | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}
```

---

## 4. Data Models

### 4.1 Core Types (src/types/game.ts)

```typescript
// Portfolio & Economy
type Currency = number;  // Virtual dollars

// Pool Types
type RiskLevel = 'safe' | 'medium' | 'degen';

interface Pool {
  id: string;
  name: string;
  apy: number;
  riskLevel: RiskLevel;
  deposited: Currency;
  isRugged: boolean;
  hasAudit: boolean;
  isPumping: boolean;
  pumpEndTime?: number;
}

// Events
type EventType = 'rug' | 'exploit' | 'whale' | 'gas' | 'pump';

interface GameEvent {
  id: string;
  type: EventType;
  targetPoolId?: string;
  magnitude: number;
  timestamp: number;
  blocked: boolean;
}

// Items
interface Items {
  audits: number;     // Blocks exploits, $500 each
  insurance: number;  // Reduces whale damage 50%, $200 each
}

// Game State
interface GameState {
  portfolio: Currency;
  pools: Pool[];
  items: Items;
  halvingMultiplier: number;
  gasMultiplier: number;  // 1x normal, 3x during gas spike
  isGameOver: boolean;
  isVictory: boolean;
  currentRun: {
    startTime: number;
    elapsed: number;
  };
}

// Leaderboard (v2)
interface LeaderboardEntry {
  id: string;
  playerName: string;
  finalPortfolio: Currency;
  timeToWin: number;  // milliseconds
  rugsEaten: number;
  halvings: number;
  timestamp: number;
}
```

---

## 5. UI Components

### 5.1 Main HUD Layout

```
┌─────────────────────────────────────────────────────────────┐
│  DEGEN ACADEMY 🎓              💰 $12,847    ⏱️ 4:32       │
│                                Portfolio    Next Halving    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐ │
│   │   StableYield │  │    BlueChip   │  │    GrowthFi   │ │
│   │     🟢 8%     │  │    🟢 25%     │  │    🟡 69%     │ │
│   │    $2,400     │  │    $5,000     │  │    $1,000     │ │
│   │ +$0.02/sec    │  │  +$0.04/sec   │  │  +$0.02/sec   │ │
│   │  [DEPOSIT]    │  │   [DEPOSIT]   │  │   [DEPOSIT]   │ │
│   │  [WITHDRAW]   │  │   [WITHDRAW]  │  │   [WITHDRAW]  │ │
│   └───────────────┘  └───────────────┘  └───────────────┘ │
│                                                             │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐ │
│   │    YieldMax   │  │   DegenPool   │  │    MoonShot   │ │
│   │    🟡 150%    │  │    🔴 300%    │  │    🔴 420%    │ │
│   │    $3,000     │  │    $1,000     │  │      $447     │ │
│   │ +$0.14/sec    │  │  +$0.10/sec   │  │  +$0.06/sec   │ │
│   │  [DEPOSIT]    │  │   [DEPOSIT]   │  │   [DEPOSIT]   │ │
│   │  [WITHDRAW]   │  │   [WITHDRAW]  │  │   [WITHDRAW]  │ │
│   └───────────────┘  └───────────────┘  └───────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🛡️ Audits: 2 [$500]    🏥 Insurance: 1 [$200]    ⛽ Gas: 1x│
│      [BUY]                   [BUY]                          │
├─────────────────────────────────────────────────────────────┤
│  💬 Ralph: "420% APY? Seems legit. What could go wrong?" 🐕 │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Event Toast (appears on screen)

```
┌─────────────────────────────────────┐
│  🚨 RUG PULL ALERT!                 │
│  DegenPool has been RUGGED!         │
│  You lost: $3,000                   │
│                                     │
│  💬 "Should've diversified, fren"   │
└─────────────────────────────────────┘
```

### 5.3 Death Screen

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         💀                                  │
│                                                             │
│                  YOU GOT REKT                              │
│                                                             │
│            "The real rug was the friends                   │
│             we lost along the way"                         │
│                                                             │
│              Final Portfolio: $0.69                        │
│              Time Survived: 7:42                           │
│              Rugs Eaten: 6                                 │
│              Halvings Survived: 1                          │
│                                                             │
│   ┌─────────────────┐       ┌─────────────────┐           │
│   │   TRY AGAIN 🔄  │       │  SHARE THE L 🐦  │           │
│   └─────────────────┘       └─────────────────┘           │
│                                                             │
│   💬 Ralph: "Skill issue tbh. JK, markets are hard." 🐕    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Hours 1-2) ⏱️

```
[x] Project setup
    ├── npm create vite@latest degen-academy -- --template vanilla-ts
    ├── npm install phaser
    ├── npm install -D tailwindcss postcss autoprefixer
    ├── Configure vite.config.ts
    └── Setup folder structure

[ ] Boot Scene
    ├── Phaser game initialization
    ├── Asset loading (placeholder graphics OK)
    └── Progress bar

[ ] Basic Game Scene
    ├── 6 pool cards (HTML overlay or Phaser UI)
    ├── Portfolio display
    └── Basic click handlers
```

### Phase 2: Core Mechanics (Hours 3-4) ⏱️

```
[ ] Pool System
    ├── Deposit/withdraw logic
    ├── APY calculations
    └── Risk level display

[ ] Yield Engine
    ├── Per-second yield accumulation
    ├── Portfolio updates
    └── Visual tick feedback

[ ] Halving Timer
    ├── 5-minute countdown
    ├── Halving execution
    └── Visual/audio warning
```

### Phase 3: RNG & Items (Hours 5-6) ⏱️

```
[ ] RNG Engine
    ├── Event probability system
    ├── 5 event types
    └── Event execution

[ ] Item System
    ├── Audit purchase
    ├── Insurance purchase
    ├── Effect application

[ ] Event Toasts
    ├── Toast UI component
    ├── Event notifications
    └── Ralph comments
```

### Phase 4: Win/Lose & Polish (Hours 7-8) ⏱️

```
[ ] End Conditions
    ├── Win screen ($1M)
    ├── Death screen ($0)
    └── Stats display

[ ] Save System
    ├── LocalStorage save
    ├── Auto-save on events
    └── Load on start

[ ] Polish
    ├── Sound effects
    ├── Twitter share button
    └── Final balancing

[ ] SHIP IT! 🚀
```

---

## 7. Key Technical Decisions

### Decision 1: Phaser UI vs HTML Overlay
**Choice:** Hybrid - HTML overlay for menus/modals, Phaser for game elements
**Why:** HTML/Tailwind is faster to build for complex UI, Phaser handles game graphics

### Decision 2: Per-Second vs Per-Frame Yields
**Choice:** Per-second yields with visual interpolation
**Why:** Cleaner math, less floating point drift, easier to debug

### Decision 3: Client-Only MVP
**Choice:** No backend for Day 1, LocalStorage only
**Why:** Ship fast, add leaderboards later with Supabase

### Decision 4: Sound Approach
**Choice:** Phaser built-in audio system
**Why:** Already have Phaser, no need for Howler.js dependency

### Decision 5: Pixel Art vs Emoji/Simple Graphics
**Choice:** Start with emoji/simple shapes, add pixel art later
**Why:** Ship fast, art can be upgraded without code changes

---

## 8. Game Balance Constants

```typescript
// src/data/constants.ts

export const GAME_CONSTANTS = {
  // Starting conditions
  STARTING_PORTFOLIO: 10_000,
  WIN_PORTFOLIO: 1_000_000,

  // Halving
  HALVING_INTERVAL_MS: 5 * 60 * 1000,  // 5 minutes

  // RNG timing
  RNG_CHECK_INTERVAL_MS: 45_000,  // Check every 45 seconds
  RNG_VARIANCE_MS: 15_000,        // ±15 seconds randomness

  // Event probabilities (must sum to 100)
  EVENT_WEIGHTS: {
    rug: 15,
    exploit: 20,
    whale: 25,
    gas: 30,
    pump: 10,
  },

  // Event effects
  EXPLOIT_DAMAGE: 0.5,      // 50% of pool
  WHALE_YIELD_REDUCTION: 0.3,  // -30% yields
  WHALE_DURATION_MS: 60_000,
  GAS_MULTIPLIER: 3,
  GAS_DURATION_MS: 30_000,
  PUMP_MULTIPLIER: 2,
  PUMP_DURATION_MS: 30_000,

  // Item costs
  AUDIT_COST: 500,
  INSURANCE_COST: 200,

  // Item effects
  INSURANCE_DAMAGE_REDUCTION: 0.5,  // Reduces whale damage by 50%

  // Deposit limits
  MIN_DEPOSIT: 100,
  DEPOSIT_INCREMENT: 100,
};
```

---

## 9. Getting Started Commands

```bash
# 1. Create project
npm create vite@latest degen-academy -- --template vanilla-ts
cd degen-academy

# 2. Install dependencies
npm install phaser
npm install -D tailwindcss postcss autoprefixer

# 3. Initialize Tailwind
npx tailwindcss init -p

# 4. Create folder structure
mkdir -p src/{scenes,systems,entities,ui,data,types}
mkdir -p public/assets/{images,audio}/{pools,ui,effects,sfx,music}

# 5. Start development
npm run dev
```

---

## 10. File Templates

### main.ts (Entry Point)

```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { DeathScene } from './scenes/DeathScene';
import { WinScene } from './scenes/WinScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [BootScene, MenuScene, GameScene, DeathScene, WinScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
```

### GameScene.ts (Core Game)

```typescript
import Phaser from 'phaser';
import { PoolManager } from '../systems/PoolManager';
import { YieldEngine } from '../systems/YieldEngine';
import { RNGEngine } from '../systems/RNGEngine';
import { HalvingTimer } from '../systems/HalvingTimer';
import { SaveManager } from '../systems/SaveManager';
import { GAME_CONSTANTS } from '../data/constants';

export class GameScene extends Phaser.Scene {
  private portfolio: number = GAME_CONSTANTS.STARTING_PORTFOLIO;
  private poolManager!: PoolManager;
  private yieldEngine!: YieldEngine;
  private rngEngine!: RNGEngine;
  private halvingTimer!: HalvingTimer;
  private saveManager!: SaveManager;

  private lastYieldTick: number = 0;
  private lastRNGCheck: number = 0;
  private nextRNGInterval: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Initialize systems
    this.poolManager = new PoolManager(this);
    this.yieldEngine = new YieldEngine(this.poolManager);
    this.rngEngine = new RNGEngine(this.poolManager);
    this.halvingTimer = new HalvingTimer();
    this.saveManager = new SaveManager();

    // Load or start fresh
    const save = this.saveManager.load();
    if (save) {
      this.loadSave(save);
    }

    // Setup UI
    this.createUI();

    // Set initial RNG interval
    this.resetRNGInterval();
  }

  update(time: number, delta: number) {
    // Yield tick (every 1 second)
    if (time - this.lastYieldTick >= 1000) {
      const yields = this.yieldEngine.tick(this.halvingTimer.getMultiplier());
      this.portfolio += yields;
      this.lastYieldTick = time;
      this.updatePortfolioDisplay();
    }

    // RNG check
    if (time - this.lastRNGCheck >= this.nextRNGInterval) {
      const event = this.rngEngine.roll();
      if (event) {
        this.executeEvent(event);
      }
      this.lastRNGCheck = time;
      this.resetRNGInterval();
    }

    // Halving
    this.halvingTimer.update(delta);
    if (this.halvingTimer.shouldHalve()) {
      this.onHalving();
    }

    // Win/Lose checks
    if (this.portfolio <= 0) {
      this.scene.start('DeathScene', { portfolio: 0, /* stats */ });
    }
    if (this.portfolio >= GAME_CONSTANTS.WIN_PORTFOLIO) {
      this.scene.start('WinScene', { portfolio: this.portfolio, /* stats */ });
    }

    // Update UI
    this.updateHUD();
  }

  private resetRNGInterval() {
    const base = GAME_CONSTANTS.RNG_CHECK_INTERVAL_MS;
    const variance = GAME_CONSTANTS.RNG_VARIANCE_MS;
    this.nextRNGInterval = base + (Math.random() * variance * 2 - variance);
  }

  // ... more methods
}
```

---

## 11. Spawner Skills for Building

| Phase | Spawner Skill | What It Provides |
|-------|---------------|------------------|
| Setup | `TypeScript Strict Mode` | Type definitions, strict config |
| Game Logic | `Game Dev Patterns` | State machines, game loops |
| UI | `Tailwind CSS UI` | Rapid UI styling |
| Audio | `Web Audio Patterns` | Sound management |
| Storage | `LocalStorage Patterns` | Save/load reliability |
| Polish | `Animation Patterns` | Juicy feedback |
| Deploy | `Vercel Deployment` | Ship fast |
| v2 Backend | `Supabase Backend` | Auth + leaderboards |

---

## Ready to Build! 🚀

This architecture is scoped for a **1-day build**. The core game loop can be functional in 4 hours, with polish taking the remaining time.

**Key principle:** Ship the core loop first, then add juice.

---

*Architecture by Ralph @ IdeaRalph | January 22, 2026*
