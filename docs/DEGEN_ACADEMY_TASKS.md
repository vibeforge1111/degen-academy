# DEGEN ACADEMY - Build Tasks

> **Goal:** Ship a playable game in ONE stream session
> **Date:** January 22, 2026
> **Stream:** LIVE BUILD

---

## Skills Loaded

| Skill | Purpose |
|-------|---------|
| TypeScript Strict Mode | Type safety, no `any`, proper generics |
| Game Development | Game loop, state machines, performance |
| Tailwind CSS UI | Styling, responsive, dark mode |
| Frontend Engineering | Component patterns, state management |

---

## Build Phases Overview

| Phase | Time | Focus | Status |
|-------|------|-------|--------|
| **Phase 1** | Hours 1-2 | Foundation & Setup | `[ ]` |
| **Phase 2** | Hours 3-4 | Core Game Mechanics | `[ ]` |
| **Phase 3** | Hours 5-6 | RNG & Items | `[ ]` |
| **Phase 4** | Hours 7-8 | Polish & Ship | `[ ]` |

---

## Phase 1: Foundation & Setup (Hours 1-2)

### P0 - Critical Path

- [ ] **1.1** Create Vite + TypeScript project
  ```bash
  npm create vite@latest degen-academy -- --template vanilla-ts
  cd degen-academy
  ```

- [ ] **1.2** Install dependencies
  ```bash
  npm install phaser
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

- [ ] **1.3** Setup folder structure
  ```
  src/
  ├── main.ts
  ├── config.ts
  ├── scenes/
  ├── systems/
  ├── entities/
  ├── ui/
  ├── data/
  └── types/
  ```

- [ ] **1.4** Configure TypeScript strict mode
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitReturns": true
    }
  }
  ```

- [ ] **1.5** Setup Tailwind with design tokens
  - Copy colors from DESIGN.md
  - Add fonts (Inter, Space Grotesk, JetBrains Mono)

- [ ] **1.6** Create Phaser game config
  - 1280x720 resolution
  - Scale mode: FIT
  - Background: #0F0F1A

- [ ] **1.7** Create BootScene
  - Show loading bar
  - Load placeholder assets

- [ ] **1.8** Verify game runs
  - `npm run dev`
  - See Phaser canvas
  - No console errors

### Checkpoint 1 ✓
> Game boots, shows loading, TypeScript strict, Tailwind ready

---

## Phase 2: Core Game Mechanics (Hours 3-4)

### P0 - Critical Path

- [ ] **2.1** Define core types (`src/types/game.ts`)
  ```typescript
  interface Pool { id, name, apy, deposited, isRugged, ... }
  interface GameState { portfolio, pools, items, ... }
  type RiskLevel = 'safe' | 'medium' | 'degen'
  ```

- [ ] **2.2** Create pool data (`src/data/pools.ts`)
  - 6 pools: StableYield (8%), BlueChip (25%), GrowthFi (69%), YieldMax (150%), DegenPool (300%), MoonShot (420%)
  - Risk levels assigned

- [ ] **2.3** Create constants (`src/data/constants.ts`)
  - STARTING_PORTFOLIO: 10,000
  - WIN_PORTFOLIO: 1,000,000
  - HALVING_INTERVAL: 5 minutes
  - Event weights

- [ ] **2.4** Build PoolManager system
  - Store pool states
  - Handle deposits/withdrawals
  - Calculate yields per second

- [ ] **2.5** Build YieldEngine system
  - tick() method for yields
  - Apply halving multiplier
  - Update portfolio

- [ ] **2.6** Build HalvingTimer system
  - 5-minute countdown
  - shouldHalve() check
  - getMultiplier() (0.5^n)

- [ ] **2.7** Create GameScene
  - Initialize systems
  - Game loop in update()
  - Yield tick every 1 second

- [ ] **2.8** Create basic UI
  - Portfolio display (top)
  - 6 pool cards (grid)
  - Deposit/withdraw buttons

- [ ] **2.9** Wire up click handlers
  - Deposit modal/action
  - Withdraw action
  - Update displays

### Checkpoint 2 ✓
> Pools work, yields accumulate, halving timer counts down

---

## Phase 3: RNG & Items (Hours 5-6)

### P0 - Critical Path

- [ ] **3.1** Create event types (`src/types/events.ts`)
  ```typescript
  type EventType = 'rug' | 'exploit' | 'whale' | 'gas' | 'pump'
  interface GameEvent { type, targetPoolId, magnitude, ... }
  ```

- [ ] **3.2** Build RNGEngine system
  - Weighted random selection
  - Event creation logic
  - Target pool selection (favor high APY)

- [ ] **3.3** Implement rug pull event
  - Pool drains to 0
  - Mark pool as rugged
  - Portfolio loss

- [ ] **3.4** Implement exploit event
  - Pool drains 50%
  - Blocked by audit

- [ ] **3.5** Implement whale dump event
  - All yields -30% for 60s
  - Insurance reduces damage

- [ ] **3.6** Implement gas spike event
  - Actions cost 3x for 30s

- [ ] **3.7** Implement pump event
  - Random pool 2x for 30s

- [ ] **3.8** Build ItemManager system
  - Track audits & insurance count
  - Apply effects

- [ ] **3.9** Create item shop UI
  - Audit button ($500)
  - Insurance button ($200)
  - Show counts

- [ ] **3.10** Create EventToast UI
  - Toast notifications
  - Color by event type
  - Auto-dismiss

### Checkpoint 3 ✓
> RNG events fire, items work, toasts show

---

## Phase 4: Polish & Ship (Hours 7-8)

### P0 - Critical Path

- [ ] **4.1** Implement win condition
  - Check portfolio >= $1M
  - Transition to WinScene

- [ ] **4.2** Implement lose condition
  - Check portfolio <= $0
  - Transition to DeathScene

- [ ] **4.3** Create DeathScene
  - Skull emoji/graphic
  - Funny death message
  - Stats display
  - Try Again button
  - Share button

- [ ] **4.4** Create WinScene
  - Graduation theme
  - Confetti (CSS or canvas)
  - Stats display
  - Play Again button
  - Share button

- [ ] **4.5** Create MenuScene
  - Game title
  - Play button
  - Settings (sound toggle)

- [ ] **4.6** Build SaveManager system
  - Save to LocalStorage
  - Load on start
  - Auto-save on events

- [ ] **4.7** Add Ralph comments
  - Array of quotes per situation
  - Display in chat bubble
  - Typewriter effect (optional)

### P1 - Should Have

- [ ] **4.8** Add sound effects
  - Deposit sound
  - Withdraw sound
  - Rug alert
  - Win fanfare
  - Death sound

- [ ] **4.9** Add background music
  - Lo-fi beats (royalty free)
  - Toggle control

- [ ] **4.10** Twitter share integration
  - Generate share text
  - Open Twitter intent URL

### P2 - Nice to Have

- [ ] **4.11** Visual polish
  - Pool card hover effects
  - Number animations
  - Screen transitions

- [ ] **4.12** Mobile responsive
  - Stack pools on mobile
  - Touch-friendly buttons

### Checkpoint 4 ✓
> Game is playable start to finish, can win/lose, can share

---

## Ship Checklist

Before going live:

- [ ] No console errors
- [ ] Win condition works
- [ ] Lose condition works
- [ ] Save/load works
- [ ] Twitter share works
- [ ] Sounds don't crash (if enabled)
- [ ] Mobile doesn't break
- [ ] Fun to play for 5 minutes

---

## Deploy

```bash
# Build
npm run build

# Deploy to Vercel
npx vercel --prod
```

---

## Post-Stream (Future)

- [ ] Leaderboard (Supabase)
- [ ] More Ralph quotes
- [ ] Achievement system
- [ ] Historical scenarios
- [ ] Pixel art assets
- [ ] Real token integration (for top players)

---

## Quick Reference

### File Locations

| What | Where |
|------|-------|
| Game entry | `src/main.ts` |
| Phaser config | `src/config.ts` |
| Core types | `src/types/game.ts` |
| Pool data | `src/data/pools.ts` |
| Constants | `src/data/constants.ts` |
| Ralph quotes | `src/data/ralph-quotes.ts` |
| Main game | `src/scenes/GameScene.ts` |
| Game systems | `src/systems/*.ts` |

### Key Commands

```bash
# Dev server
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit

# Deploy
npx vercel --prod
```

### Design Tokens

```css
Primary: #8B5CF6
Secondary: #F59E0B
Success: #10B981
Danger: #EF4444
Background: #0F0F1A
Surface: #1E1E32
```

---

**LET'S BUILD!** 🚀

*Track progress by checking off tasks as you complete them.*
