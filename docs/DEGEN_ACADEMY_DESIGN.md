# DEGEN ACADEMY - Design Specification

> **Vibe: Bold & Colorful + Clean & Minimal**
> Punchy visuals, vibrant colors, but organized and uncluttered

---

## 1. Target Audience Analysis

**Primary Users:**
- Crypto-curious Gen Z (18-28)
- Ex-degens who miss the dopamine
- Idle game enthusiasts
- Streamers/content creators

**What They Value:**
- Memes and humor
- Instant gratification
- Shareable moments
- Clean UX despite chaotic gameplay
- Numbers going up (or hilariously down)

**Design Implications:**
- Bold colors that pop on streams
- Clean layouts so gameplay is readable
- Meme-able death screens
- Satisfying visual feedback
- Mobile-friendly (stream viewers on phones)

---

## 2. Design Inspiration

| Site | Why Our Audience Loves It | What to Borrow |
|------|---------------------------|----------------|
| **Polymarket** | Clean trading UI, bold greens/reds | Portfolio display, number formatting |
| **pump.fun** | Degen energy, meme culture | Card layouts, bold typography |
| **Cookie Clicker** | Idle game clarity, satisfying clicks | Number animations, upgrade layout |
| **Uniswap** | Clean DeFi UI, purple/pink palette | Pool cards, action buttons |
| **Duolingo** | Gamification, playful mascot | Ralph's personality, achievements |

---

## 3. Color Palette

### Primary Colors
```css
/* Bold & Vibrant - Crypto Energy */
--primary: #8B5CF6;           /* Electric Purple - main brand */
--primary-hover: #7C3AED;     /* Darker purple for hover */
--primary-active: #6D28D9;    /* Even darker for active */

--secondary: #F59E0B;         /* Amber Gold - yields, money */
--secondary-hover: #D97706;

--accent: #06B6D4;            /* Cyan - highlights, pumps */
```

### Semantic Colors
```css
/* Feedback Colors - Clear Signals */
--success: #10B981;           /* Emerald - gains, pumps */
--success-bg: #10B98120;      /* 20% opacity for backgrounds */

--danger: #EF4444;            /* Red - rugs, losses */
--danger-bg: #EF444420;

--warning: #F59E0B;           /* Amber - gas spikes, alerts */
--warning-bg: #F59E0B20;

--info: #3B82F6;              /* Blue - neutral info */
```

### Background & Surface
```css
/* Clean & Dark - Easy on Eyes */
--bg-primary: #0F0F1A;        /* Deep space - main background */
--bg-secondary: #1A1A2E;      /* Slightly lighter - cards */
--bg-tertiary: #252542;       /* Hover states, borders */

--surface: #1E1E32;           /* Card backgrounds */
--surface-hover: #2A2A45;     /* Card hover */

--border: #3D3D5C;            /* Subtle borders */
--border-focus: #8B5CF6;      /* Focus rings - primary */
```

### Text Colors
```css
/* High Contrast for Readability */
--text-primary: #FFFFFF;      /* Headlines, important */
--text-secondary: #A1A1AA;    /* Body text, descriptions */
--text-muted: #71717A;        /* Labels, hints */
--text-inverse: #0F0F1A;      /* Text on light backgrounds */
```

### Pool Risk Colors
```css
/* Visual Risk Indicators */
--risk-safe: #10B981;         /* Green - 8-25% APY */
--risk-medium: #F59E0B;       /* Amber - 50-150% APY */
--risk-degen: #EF4444;        /* Red - 200-420% APY */
```

---

## 4. Typography

### Font Stack
```css
/* Primary: Inter - Clean, modern, great for numbers */
--font-primary: 'Inter', system-ui, -apple-system, sans-serif;

/* Mono: JetBrains Mono - For numbers, yields, portfolio */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Display: Space Grotesk - Bold headlines, impact */
--font-display: 'Space Grotesk', var(--font-primary);
```

### Type Scale (1.25 ratio)
```css
/* Headlines - Space Grotesk, Bold */
--text-hero: 56px;      /* Game title, win/death screens */
--text-h1: 40px;        /* Section headers */
--text-h2: 32px;        /* Card titles */
--text-h3: 24px;        /* Subsections */

/* Body - Inter */
--text-lg: 18px;        /* Important body text */
--text-base: 16px;      /* Default body */
--text-sm: 14px;        /* Secondary info */
--text-xs: 12px;        /* Labels, captions */

/* Numbers - JetBrains Mono */
--text-portfolio: 48px; /* Main portfolio display */
--text-yield: 24px;     /* Pool APY */
--text-amount: 20px;    /* Deposited amounts */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 5. Spacing System (8pt Grid)

```css
--space-1: 4px;    /* Tight gaps */
--space-2: 8px;    /* Default internal */
--space-3: 12px;   /* Comfortable internal */
--space-4: 16px;   /* Between elements */
--space-5: 20px;   /* Component padding */
--space-6: 24px;   /* Section gaps */
--space-8: 32px;   /* Large gaps */
--space-10: 40px;  /* Section padding */
--space-12: 48px;  /* Major sections */
--space-16: 64px;  /* Page margins */
```

---

## 6. Component Specifications

### 6.1 Pool Card

```
┌─────────────────────────────────────┐
│  ● MoonShot                    🔴   │  ← Risk indicator dot + label
│                                     │
│         420%                        │  ← APY (huge, mono font)
│          APY                        │
│                                     │
│      $3,247.89                      │  ← Deposited amount
│    +$0.42/sec                       │  ← Yield rate (green)
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   DEPOSIT   │ │  WITHDRAW   │   │  ← Action buttons
│  └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘

Specs:
- Width: 280px (desktop), 100% (mobile)
- Height: auto
- Background: var(--surface)
- Border: 1px solid var(--border)
- Border-radius: 16px
- Padding: 24px
- Hover: border-color: var(--primary), shadow
```

**Pool Card States:**
| State | Visual Change |
|-------|---------------|
| Default | Standard appearance |
| Hover | Border glow (primary color), slight lift |
| Rugged | Red overlay, "RUGGED" stamp, greyed out |
| Pumping | Green glow, pulsing animation, "2X" badge |
| Has Audit | Shield icon badge |

### 6.2 Portfolio Display (Top Bar)

```
┌─────────────────────────────────────────────────────────────────┐
│  🎓 DEGEN ACADEMY        💰 $12,847.23        ⏱️ HALVING 4:32   │
│                              ↑ +2.4%             █████████░░    │
└─────────────────────────────────────────────────────────────────┘

Specs:
- Height: 72px
- Background: var(--bg-secondary)
- Position: sticky top
- Portfolio: 32px mono font, bold
- Change indicator: Green/red based on direction
- Halving: Countdown + progress bar
```

### 6.3 Action Buttons

**Primary Button (Deposit)**
```css
.btn-primary {
  background: var(--primary);
  color: white;
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.15s ease;
}
.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}
.btn-primary:active {
  background: var(--primary-active);
  transform: translateY(0);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Secondary Button (Withdraw)**
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
  /* Same sizing as primary */
}
.btn-secondary:hover {
  border-color: var(--primary);
  background: var(--primary)10;
}
```

**Danger Button (used in modals)**
```css
.btn-danger {
  background: var(--danger);
  color: white;
}
```

### 6.4 Event Toast

```
┌─────────────────────────────────────────┐
│  🚨 RUG PULL!                      ✕   │
│                                         │
│  DegenPool has been RUGGED!            │
│  Lost: $3,000.00                        │
│                                         │
│  💬 "Should've diversified, anon"       │
└─────────────────────────────────────────┘

Specs:
- Position: top-right, 24px from edges
- Width: 360px
- Background: var(--surface)
- Border-left: 4px solid (event color)
- Border-radius: 12px
- Animation: slide in from right, auto-dismiss 5s
- Shadow: large drop shadow for attention
```

**Toast Colors by Event:**
| Event | Border Color | Icon |
|-------|--------------|------|
| Rug Pull | var(--danger) | 🚨 |
| Exploit | var(--warning) | ⚠️ |
| Whale Dump | var(--warning) | 🐋 |
| Gas Spike | var(--warning) | ⛽ |
| Pump | var(--success) | 🚀 |

### 6.5 Item Shop Bar (Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ Audits: 2        🏥 Insurance: 1        ⛽ Gas: 1x          │
│     [$500 BUY]          [$200 BUY]                              │
└─────────────────────────────────────────────────────────────────┘

Specs:
- Height: 64px
- Background: var(--bg-secondary)
- Position: fixed bottom
- Items: Horizontal flex, evenly spaced
```

### 6.6 Ralph Chat Bubble

```
┌─────────────────────────────────────────────────────────────────┐
│  🐕 Ralph: "420% APY? Seems totally legit. WAGMI."              │
└─────────────────────────────────────────────────────────────────┘

Specs:
- Position: Above item bar
- Background: var(--surface)
- Border-radius: 12px 12px 0 0
- Padding: 16px 24px
- Font: 16px, italic for quotes
- Animation: Typewriter effect on new messages
```

---

## 7. Screen Designs

### 7.1 Main Game Screen

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎓 DEGEN ACADEMY              💰 $12,847.23           ⏱️ HALVING 4:32  │
│                                    ↑ +2.4%               █████████░░░   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│   │  ● StableYield  │  │  ● BlueChip     │  │  ● GrowthFi     │       │
│   │     🟢 SAFE     │  │    🟢 SAFE      │  │    🟡 MEDIUM    │       │
│   │                 │  │                 │  │                 │       │
│   │      8%         │  │      25%        │  │      69%        │       │
│   │      APY        │  │      APY        │  │      APY        │       │
│   │                 │  │                 │  │                 │       │
│   │   $2,400.00     │  │   $5,000.00     │  │   $1,000.00     │       │
│   │  +$0.02/sec     │  │  +$0.04/sec     │  │  +$0.02/sec     │       │
│   │                 │  │                 │  │                 │       │
│   │ [DEP]  [WITH]   │  │ [DEP]  [WITH]   │  │ [DEP]  [WITH]   │       │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘       │
│                                                                         │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│   │  ● YieldMax     │  │  ● DegenPool    │  │  ● MoonShot     │       │
│   │    🟡 MEDIUM    │  │    🔴 DEGEN     │  │    🔴 DEGEN     │       │
│   │                 │  │                 │  │                 │       │
│   │     150%        │  │     300%        │  │     420%        │       │
│   │      APY        │  │      APY        │  │      APY        │       │
│   │                 │  │                 │  │                 │       │
│   │   $3,000.00     │  │   $1,447.00     │  │     $0.00       │       │
│   │  +$0.14/sec     │  │  +$0.13/sec     │  │  +$0.00/sec     │       │
│   │                 │  │                 │  │                 │       │
│   │ [DEP]  [WITH]   │  │ [DEP]  [WITH]   │  │ [DEP]  [WITH]   │       │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘       │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  🐕 Ralph: "Nice diversification. JK you put 50% in MoonShot."         │
├─────────────────────────────────────────────────────────────────────────┤
│  🛡️ Audits: 2 [$500]      🏥 Insurance: 1 [$200]       ⛽ Gas: 1x      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Death Screen

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                              💀                                         │
│                                                                         │
│                        YOU GOT REKT                                     │
│                                                                         │
│                 "The real rug was the friends                          │
│                  we lost along the way"                                │
│                                                                         │
│           ┌─────────────────────────────────────┐                      │
│           │  Final Portfolio      $0.69         │                      │
│           │  Time Survived        7:42          │                      │
│           │  Rugs Eaten           6             │                      │
│           │  Halvings             1             │                      │
│           │  Best Pool            BlueChip      │                      │
│           └─────────────────────────────────────┘                      │
│                                                                         │
│        ┌───────────────────┐    ┌───────────────────┐                 │
│        │    TRY AGAIN 🔄   │    │   SHARE THE L 🐦   │                 │
│        └───────────────────┘    └───────────────────┘                 │
│                                                                         │
│   🐕 Ralph: "Skill issue tbh. JK, markets are hard. Touch grass."      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Specs:
- Background: var(--bg-primary) with subtle radial gradient (red tint)
- Skull: Large emoji or pixel art, 96px
- Headline: 56px, Space Grotesk, bold
- Quote: 20px, italic, text-secondary
- Stats card: var(--surface), centered
- Buttons: Side by side, 200px each
```

### 7.3 Win Screen

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           🎉 🎓 🎉                                      │
│                                                                         │
│                      YOU GRADUATED!                                     │
│                                                                         │
│                   "Ready to lose real money"                           │
│                                                                         │
│           ┌─────────────────────────────────────┐                      │
│           │  Final Portfolio   $1,247,892.00    │                      │
│           │  Time to Graduate      12:34        │                      │
│           │  Rugs Survived           8          │                      │
│           │  Halvings                2          │                      │
│           │  DeFi IQ              DEGEN         │                      │
│           └─────────────────────────────────────┘                      │
│                                                                         │
│        ┌───────────────────┐    ┌───────────────────┐                 │
│        │   PLAY AGAIN 🔄   │    │   FLEX ON X 🐦    │                 │
│        └───────────────────┘    └───────────────────┘                 │
│                                                                         │
│   🐕 Ralph: "You did it! Now go touch grass before trying IRL DeFi."   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Specs:
- Background: var(--bg-primary) with subtle radial gradient (purple/gold)
- Confetti animation on load
- Headline: 56px, gradient text (purple → gold)
- Sound: Celebration airhorns
```

### 7.4 Menu Screen

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        🎓 DEGEN ACADEMY                                 │
│                                                                         │
│                  "Learn DeFi by getting rekt"                          │
│                                                                         │
│                                                                         │
│                    ┌─────────────────────┐                             │
│                    │      ▶ PLAY         │                             │
│                    └─────────────────────┘                             │
│                                                                         │
│                    ┌─────────────────────┐                             │
│                    │    📊 LEADERBOARD   │                             │
│                    └─────────────────────┘                             │
│                                                                         │
│                    ┌─────────────────────┐                             │
│                    │    ⚙️ SETTINGS      │                             │
│                    └─────────────────────┘                             │
│                                                                         │
│                                                                         │
│                         🐕 Ralph                                        │
│               "Ready to learn the hard way?"                           │
│                                                                         │
│                     🔊 Sound: ON    🎵 Music: ON                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Animations & Feedback

### 8.1 Micro-interactions

| Action | Animation | Duration |
|--------|-----------|----------|
| Button hover | Scale 1.02, shadow increase | 150ms |
| Button click | Scale 0.98, then back | 100ms |
| Deposit | Pool card pulse green | 300ms |
| Withdraw | Pool card pulse amber | 300ms |
| Yield tick | Number count up smoothly | 100ms |
| Portfolio update | Number animate to new value | 200ms |

### 8.2 Event Animations

| Event | Animation |
|-------|-----------|
| Rug Pull | Pool card shakes, explodes into pieces, red flash |
| Exploit | Shield blocks it (if audit), card cracks if not |
| Whale Dump | Blue wave washes over screen |
| Gas Spike | Orange pulse on gas indicator |
| Pump | Pool card glows green, floats up slightly |
| Halving | Screen flash, all yields animate down 50% |

### 8.3 Screen Transitions

| Transition | Animation |
|------------|-----------|
| Menu → Game | Fade + slight zoom in |
| Game → Death | Screen cracks, falls apart |
| Game → Win | Confetti explosion, zoom to center |
| Any → Menu | Fade out/in |

---

## 9. Sound Design Reference

| Event | Sound Type | Vibe |
|-------|------------|------|
| Background | Lo-fi beats | Chill, focus |
| Deposit | Coin clink | Satisfying |
| Withdraw | Cash register | Rewarding |
| Yield tick | Soft cha-ching | Subtle dopamine |
| Halving warning | Alarm beeps | Urgency |
| Halving execute | Womp womp | Dramatic |
| Rug pull | Record scratch + explosion | Comedic tragedy |
| Exploit blocked | Shield clang | Victorious |
| Pump | Rocket whoosh | Exciting |
| Win | Airhorn + confetti | Celebration |
| Death | Sad trombone | Funny |
| Ralph speaks | Subtle bark/woof | Personality |

---

## 10. Tailwind Config

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          active: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
        },
        accent: '#06B6D4',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',

        bg: {
          primary: '#0F0F1A',
          secondary: '#1A1A2E',
          tertiary: '#252542',
        },
        surface: {
          DEFAULT: '#1E1E32',
          hover: '#2A2A45',
        },
        border: {
          DEFAULT: '#3D3D5C',
          focus: '#8B5CF6',
        },

        risk: {
          safe: '#10B981',
          medium: '#F59E0B',
          degen: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': ['56px', { lineHeight: '1.1', fontWeight: '700' }],
        'portfolio': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'yield': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '16px',
        'button': '10px',
        'input': '8px',
      },
      animation: {
        'pulse-green': 'pulse-green 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 2s ease-in-out infinite',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(16, 185, 129, 0.3)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 11. Asset List (Day 1 MVP)

### Placeholder-Friendly (Can use emoji/CSS first)
| Asset | Placeholder | Final (Post-Day 1) |
|-------|-------------|-------------------|
| Pool icons | Emoji (🟢🟡🔴) | Pixel art icons |
| Ralph | 🐕 emoji | Animated pixel dog |
| Rug explosion | CSS shake + fade | Particle effect |
| Confetti | CSS animation | Canvas particles |
| Buttons | Tailwind styled | Custom pixel buttons |

### Required Day 1
- [ ] Background color/gradient
- [ ] Google Fonts (Inter, Space Grotesk, JetBrains Mono)
- [ ] Sound effects (can use freesound.org)
- [ ] Lo-fi background music (royalty-free)

---

## 12. Mobile Responsive Notes

### Breakpoints
```css
/* Mobile first */
sm: 640px   /* Large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

### Mobile Layout (< 768px)
- Pool grid: 1 column (stacked cards)
- Top bar: Simplified (portfolio only, halving in card)
- Item bar: Horizontal scroll or icons only
- Toasts: Full width at top

### Tablet Layout (768px - 1024px)
- Pool grid: 2 columns
- All elements visible

### Desktop Layout (> 1024px)
- Pool grid: 3 columns (as designed)
- Full experience

---

## Design Summary

**Target Audience:** Crypto-curious gamers, ex-degens, idle game fans
**Vibe:** Bold & Colorful + Clean (vibrant but organized)
**Inspiration:** Polymarket (clean), pump.fun (degen energy), Cookie Clicker (satisfying)

**Color Story:**
- Purple (#8B5CF6) = Brand, actions, progress
- Gold (#F59E0B) = Money, yields, rewards
- Red (#EF4444) = Danger, rugs, losses
- Green (#10B981) = Success, gains, safe

**Typography:**
- Space Grotesk for bold headlines
- Inter for clean body text
- JetBrains Mono for numbers (satisfying!)

---

*Design by Ralph @ IdeaRalph | January 22, 2026*
