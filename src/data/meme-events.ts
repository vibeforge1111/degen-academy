// Meme coin event data - MAXIMUM VARIETY
import type { SocialAuthor, MemeEventType } from '../types/meme';

// ============================================
// TOKEN NAME GENERATOR
// ============================================

const TOKEN_PREFIXES = [
  'PEPE', 'DOGE', 'SHIB', 'FLOKI', 'WOJAK', 'CHAD', 'GIGA', 'BASED',
  'MOON', 'ROCKET', 'LAMBO', 'APE', 'FROG', 'CAT', 'DOG', 'ELON',
  'TRUMP', 'BIDEN', 'ANIME', 'MEME', 'DEGEN', 'TURBO', 'SIGMA', 'ALPHA',
  'BETA', 'GAMMA', 'OMEGA', 'MEGA', 'ULTRA', 'SUPER', 'HYPER', 'GROK'
];

const TOKEN_SUFFIXES = [
  'INU', 'COIN', 'TOKEN', 'MOON', 'ROCKET', 'PUMP', 'WIF', 'HAT',
  '2.0', '3.0', 'PLUS', 'MAX', 'PRO', 'GOLD', 'DIAMOND', 'CLASSIC',
  'SWAP', 'FI', 'DAO', 'VERSE', 'WORLD', 'LAND', 'AI', 'GPT'
];

const TOKEN_EMOJIS = [
  '🐸', '🐕', '🚀', '🌙', '💎', '🦍', '🐱', '🔥', '⚡', '🎮',
  '🤖', '👽', '🦄', '🐳', '🦊', '🐻', '🐂', '🌈', '💀', '🎰'
];

export function generateTokenName(): { name: string; ticker: string; emoji: string } {
  const prefix = TOKEN_PREFIXES[Math.floor(Math.random() * TOKEN_PREFIXES.length)];
  const suffix = Math.random() > 0.5
    ? TOKEN_SUFFIXES[Math.floor(Math.random() * TOKEN_SUFFIXES.length)]
    : '';
  const emoji = TOKEN_EMOJIS[Math.floor(Math.random() * TOKEN_EMOJIS.length)];

  const name = suffix ? `${prefix}${suffix}` : prefix;
  const ticker = `$${name.slice(0, 6).toUpperCase()}`;

  return { name, ticker, emoji };
}

// ============================================
// AUTHORS - Many different personas
// ============================================

export const AUTHORS: Record<string, SocialAuthor[]> = {
  kol: [
    { name: 'CryptoGuru', handle: '@CryptoGuru', avatar: '🧙', type: 'kol', followers: '1.2M', verified: true },
    { name: 'MoonBoi', handle: '@MoonBoi69', avatar: '🌙', type: 'kol', followers: '890K', verified: true },
    { name: 'DeFi Dave', handle: '@DeFiDave', avatar: '📊', type: 'kol', followers: '2.1M', verified: true },
    { name: 'Crypto Wendy', handle: '@CryptoWendyO', avatar: '👩', type: 'kol', followers: '750K', verified: true },
    { name: 'The Wolf', handle: '@CryptoWolf', avatar: '🐺', type: 'kol', followers: '1.5M', verified: true },
    { name: 'Altcoin Daily', handle: '@AltcoinDaily', avatar: '📈', type: 'kol', followers: '3.2M', verified: true },
    { name: 'Degen Spartan', handle: '@DegenSpartan', avatar: '⚔️', type: 'kol', followers: '600K', verified: true },
    { name: 'Based Zeus', handle: '@BasedZeus', avatar: '⚡', type: 'kol', followers: '420K', verified: true },
    { name: 'Cobie', handle: '@coaborgie', avatar: '🎭', type: 'kol', followers: '890K', verified: true },
    { name: 'GCR', handle: '@GCRClassic', avatar: '🎯', type: 'kol', followers: '500K', verified: true },
  ],
  whale: [
    { name: 'Whale Alert', handle: '@whale_alert', avatar: '🐋', type: 'whale', followers: '2.5M', verified: true },
    { name: 'Unknown Wallet', handle: '@0x7a3...f9d2', avatar: '💰', type: 'whale', followers: '0', verified: false },
    { name: 'Smart Money', handle: '@SmartMoneyTracker', avatar: '🧠', type: 'whale', followers: '340K', verified: true },
    { name: 'Whale Watcher', handle: '@WhaleWatcher', avatar: '👀', type: 'whale', followers: '180K', verified: false },
    { name: 'Big Fish', handle: '@0xBigFish', avatar: '🐟', type: 'whale', followers: '50K', verified: false },
  ],
  dev: [
    { name: 'Dev Team', handle: '@OfficialDev', avatar: '👨‍💻', type: 'dev', followers: '25K', verified: true },
    { name: 'Anon Dev', handle: '@AnonBuilder', avatar: '🥷', type: 'dev', followers: '5K', verified: false },
    { name: 'Based Dev', handle: '@BasedDev420', avatar: '🔧', type: 'dev', followers: '12K', verified: false },
    { name: 'CTO', handle: '@ProjectCTO', avatar: '🛠️', type: 'dev', followers: '8K', verified: true },
  ],
  anon: [
    { name: 'anon', handle: '@anon42069', avatar: '🎭', type: 'anon', followers: '500', verified: false },
    { name: 'fren', handle: '@wagmifren', avatar: '🤝', type: 'anon', followers: '1.2K', verified: false },
    { name: 'degen', handle: '@degentrades', avatar: '🎰', type: 'anon', followers: '3K', verified: false },
    { name: 'ape', handle: '@apinghard', avatar: '🦍', type: 'anon', followers: '800', verified: false },
    { name: 'ser', handle: '@sertothemoon', avatar: '🌙', type: 'anon', followers: '2.1K', verified: false },
    { name: 'ngmi', handle: '@probablyngmi', avatar: '😭', type: 'anon', followers: '600', verified: false },
    { name: 'chad', handle: '@gigachad_eth', avatar: '💪', type: 'anon', followers: '4.2K', verified: false },
    { name: 'lurker', handle: '@silentwatcher', avatar: '👁️', type: 'anon', followers: '150', verified: false },
  ],
  newbie: [
    { name: 'CryptoNewbie', handle: '@JustStartedCrypto', avatar: '🐣', type: 'newbie', followers: '50', verified: false },
    { name: 'FirstTimeBuyer', handle: '@MyFirstAltcoin', avatar: '😅', type: 'newbie', followers: '20', verified: false },
    { name: 'WhatIsGas', handle: '@ConfusedTrader', avatar: '❓', type: 'newbie', followers: '100', verified: false },
    { name: 'ToTheMoon', handle: '@ImGonnaBeRich', avatar: '🤑', type: 'newbie', followers: '75', verified: false },
  ],
  news: [
    { name: 'CoinDesk', handle: '@CoinDesk', avatar: '📰', type: 'news', followers: '5.2M', verified: true },
    { name: 'The Block', handle: '@TheBlock__', avatar: '📱', type: 'news', followers: '1.8M', verified: true },
    { name: 'Decrypt', handle: '@decaborrypt', avatar: '🔓', type: 'news', followers: '900K', verified: true },
    { name: 'CryptoNews', handle: '@ABORC', avatar: '📡', type: 'news', followers: '2.1M', verified: true },
    { name: 'DL News', handle: '@DaborLNews', avatar: '📋', type: 'news', followers: '400K', verified: true },
  ],
  celebrity: [
    { name: 'Elon', handle: '@elonmusk', avatar: '🚀', type: 'celebrity', followers: '180M', verified: true },
    { name: 'Snoop', handle: '@SnoopDogg', avatar: '🎤', type: 'celebrity', followers: '20M', verified: true },
    { name: 'Paris Hilton', handle: '@ParisHilton', avatar: '💅', type: 'celebrity', followers: '8M', verified: true },
    { name: 'Mark Cuban', handle: '@mcuban', avatar: '🏀', type: 'celebrity', followers: '9M', verified: true },
    { name: 'Gary Vee', handle: '@garyvee', avatar: '🍷', type: 'celebrity', followers: '15M', verified: true },
  ],
  exchange: [
    { name: 'Binance', handle: '@binance', avatar: '🟡', type: 'exchange', followers: '12M', verified: true },
    { name: 'Coinbase', handle: '@coinbase', avatar: '🔵', type: 'exchange', followers: '8M', verified: true },
    { name: 'Kraken', handle: '@kaborrkenfx', avatar: '🐙', type: 'exchange', followers: '2M', verified: true },
    { name: 'KuCoin', handle: '@kaborucoin', avatar: '🟢', type: 'exchange', followers: '3M', verified: true },
    { name: 'Raydium', handle: '@RaydiumProtocol', avatar: '☀️', type: 'exchange', followers: '500K', verified: true },
  ],
  analyst: [
    { name: 'ChartMaster', handle: '@ChartMasterTA', avatar: '📉', type: 'analyst', followers: '250K', verified: true },
    { name: 'Fibonacci Fan', handle: '@FibonacciKing', avatar: '🔢', type: 'analyst', followers: '180K', verified: false },
    { name: 'Volume Profile', handle: '@VolumeGuru', avatar: '📊', type: 'analyst', followers: '90K', verified: false },
    { name: 'Elliott Wave', handle: '@WaveCounter', avatar: '🌊', type: 'analyst', followers: '120K', verified: true },
  ],
  fudder: [
    { name: 'FUD Factory', handle: '@FUDMachine', avatar: '😈', type: 'fudder', followers: '45K', verified: false },
    { name: 'Bear Market Bob', handle: '@BearMarketBob', avatar: '🐻', type: 'fudder', followers: '80K', verified: false },
    { name: 'Crypto Skeptic', handle: '@SkepticalOfAll', avatar: '🤔', type: 'fudder', followers: '60K', verified: false },
    { name: 'Rug Detector', handle: '@RugDetector', avatar: '🔍', type: 'fudder', followers: '120K', verified: true },
  ],
  bot: [
    { name: 'Trading Bot', handle: '@AutoTrader_Bot', avatar: '🤖', type: 'bot', followers: '10K', verified: false },
    { name: 'Sniper Bot', handle: '@SniperAlpha', avatar: '🎯', type: 'bot', followers: '5K', verified: false },
    { name: 'Copy Trade Bot', handle: '@CopyWhales', avatar: '📋', type: 'bot', followers: '25K', verified: false },
  ],
  scammer: [
    { name: 'Definitely Legit', handle: '@TotallyReal_Dev', avatar: '😇', type: 'scammer', followers: '500', verified: false },
    { name: 'Free Airdrop', handle: '@Free10000USD', avatar: '🎁', type: 'scammer', followers: '200', verified: false },
    { name: 'Fake Elon', handle: '@elooonmusk', avatar: '🚀', type: 'scammer', followers: '50', verified: false },
  ],
};

// ============================================
// MESSAGE TEMPLATES - Tons of variety!
// ============================================

export const EVENT_MESSAGES: Record<MemeEventType, string[]> = {
  whale_buy: [
    "🐋 WHALE ALERT: {wallet} just bought {amount} worth of {ticker}!",
    "🚨 Smart money moving! {amount} buy on {ticker} from known whale wallet",
    "👀 Someone just aped {amount} into {ticker}. Bullish?",
    "💰 Massive bag acquired. {amount} of {ticker} just got scooped up",
    "🐋 Another whale enters. {amount} buy detected on {ticker}",
    "🔥 {wallet} loading up heavy on {ticker} - {amount} in one tx",
    "📈 Whale accumulation spotted: {amount} {ticker} bought",
    "🎯 Insider? {amount} buy on {ticker} from fresh wallet",
    "💎 Diamond hands whale just added {amount} more {ticker}",
    "🚀 Smart money alert: {wallet} buys {amount} {ticker}",
  ],
  whale_dump: [
    "🐋💨 WHALE DUMP: {wallet} just sold {amount} of {ticker}!",
    "⚠️ Large sell detected: {amount} {ticker} hitting the market",
    "📉 Whale exiting! {amount} dump incoming on {ticker}",
    "🚨 Someone just market sold {amount} of {ticker}",
    "💀 RIP. Whale just dumped {amount} {ticker} on your heads",
    "😰 {amount} sell wall just got filled on {ticker}",
    "🔴 Major distribution: {wallet} selling {amount} {ticker}",
    "📊 Whale taking profits - {amount} {ticker} sold",
    "⬇️ Big sell: {amount} {ticker} dumped by early holder",
    "🐻 Bear whale dumps {amount} {ticker}. Pain incoming.",
  ],
  kol_shill: [
    "This is the one. {ticker} is going to 100x. NFA but also FA. 🚀",
    "I've never been more bullish on anything. {ticker} to $1. Easy.",
    "Devs are based. Community is strong. {ticker} is inevitable.",
    "Just aped my entire portfolio into {ticker}. See you at Valhalla.",
    "The chart on {ticker} is screaming. This is the play.",
    "{ticker} has the best tokenomics I've seen in years. Loading up.",
    "If you're not in {ticker} right now, you're ngmi. Simple as.",
    "This is the next 1000x. {ticker} is still early. You're welcome.",
    "My sources say {ticker} is about to get a major listing. 👀",
    "Been researching {ticker} for weeks. This is it, fam. THE play.",
    "{ticker} community is the most based I've seen. Bullish AF.",
    "Chart looks identical to early PEPE. {ticker} sending it.",
    "Insiders are loading {ticker}. I'm following smart money.",
    "This might be the last time you see {ticker} at these prices.",
    "{ticker} dev just doxxed. Team is legit. Moon imminent.",
  ],
  kol_fud: [
    "Something feels off about {ticker}. Might sit this one out.",
    "Did anyone check the {ticker} contract? Looks sketchy to me.",
    "I'm out of {ticker}. Too many red flags. DYOR.",
    "The {ticker} team hasn't shipped anything in weeks. Concerned.",
    "{ticker} chart looking weak. Breaking down here is not good.",
    "Heard some stuff about {ticker} that I can't share. Be careful.",
    "Why is {ticker} dev wallet moving? Just asking questions.",
    "I was wrong about {ticker}. Selling my bag. Sorry.",
    "{ticker} liquidity is way too low for these prices. Careful.",
    "Something's brewing with {ticker}. Getting out while I can.",
  ],
  dev_update: [
    "🛠️ Major update dropping tomorrow. {ticker} holders get ready!",
    "Partnership announcement coming soon. Can't say more yet. 👀",
    "Just burned 10% of supply. {ticker} is more scarce now.",
    "New utility launching next week. {ticker} ecosystem growing.",
    "Audit completed! {ticker} is officially safe. LFG!",
    "CEX listing confirmed. Announcement coming in 48 hours.",
    "Staking is now live! Lock your {ticker} for rewards.",
    "Website V2 is live. Check out the new roadmap!",
    "Marketing campaign starting Monday. {ticker} going viral.",
    "Liquidity locked for 1 year. We're here for the long term.",
  ],
  dev_rug_signal: [
    "Taking a short break from socials. Dev stuff. BRB.",
    "Team wallet needs to cover some expenses. Normal stuff.",
    "Unlocking some tokens for marketing. Don't worry.",
    "Having some personal issues. Updates will slow down.",
    "Contract upgrade needed. Will require new token migration.",
    "Removing some liquidity temporarily for CEX listing deposit.",
    "Team member leaving the project. Everything is fine though.",
    "Need to restructure tokenomics. Details coming soon...",
    "Website going down for maintenance. Might take a while.",
    "Lost access to Twitter. Using backup account now.",
  ],
  exchange_listing: [
    "🚀 BREAKING: {ticker} to be listed on {exchange}! LFG!",
    "🔥 {exchange} just announced {ticker} listing! Moon mission!",
    "📢 Official: {ticker} x {exchange} listing confirmed!",
    "🎉 We made it! {ticker} going to {exchange}!",
    "💎 {exchange} listing incoming for {ticker}. This is huge!",
  ],
  exchange_delisting: [
    "⚠️ {exchange} reviewing {ticker} for potential delisting",
    "🚨 {ticker} trading suspended on {exchange} pending review",
    "📉 {exchange} announces {ticker} delisting effective next week",
    "😰 Regulatory concerns: {exchange} removing {ticker}",
  ],
  celebrity_mention: [
    "yo {ticker} looks fire ngl 👀🔥",
    "Just learned about {ticker}. Interesting project tbh.",
    "My team showed me {ticker}. Might have to look into this.",
    "Everyone asking me about {ticker} lately. What is this?",
    "{ticker}? Yeah I heard about it. Pretty cool concept.",
    "Someone gift me some {ticker} lol",
  ],
  celebrity_dump: [
    "Actually sold my {ticker}. Wasn't for me.",
    "I never actually bought {ticker}. That was a misunderstanding.",
    "My team invested in {ticker} without my knowledge. Selling.",
    "Taking profits on {ticker}. Was fun while it lasted!",
  ],
  hack_rumor: [
    "⚠️ Unconfirmed reports of {ticker} contract vulnerability",
    "🔓 Someone on Discord claims they found a {ticker} exploit",
    "🚨 Investigating potential security issue with {ticker}",
    "😱 Rumor: {ticker} might have a backdoor in the contract",
    "🔍 Security researcher looking into {ticker} contract...",
  ],
  partnership: [
    "🤝 {ticker} x [Major Brand] partnership announced!",
    "📢 Big collab incoming! {ticker} partnering with industry leader",
    "🔥 Strategic partnership confirmed for {ticker}!",
    "💼 {ticker} signs deal with Fortune 500 company!",
  ],
  airdrop_rumor: [
    "👀 Rumor: {ticker} airdrop coming for early holders",
    "🎁 Whispers of {ticker} rewarding diamond hands with airdrop",
    "📢 Unconfirmed: {ticker} snapshot happening soon?",
    "🚀 If you're holding {ticker}, you might want to keep holding...",
  ],
  liquidity_add: [
    "💧 Dev just added {amount} more liquidity to {ticker}!",
    "🔒 {amount} liquidity locked for {ticker}. Bullish!",
    "📈 LP just got boosted by {amount}. {ticker} getting serious.",
  ],
  liquidity_remove: [
    "⚠️ {amount} liquidity removed from {ticker} pool",
    "🚨 LP drain detected on {ticker}! {amount} gone!",
    "😰 Why did {ticker} liquidity just drop by {amount}?",
    "🔴 Liquidity rug? {amount} pulled from {ticker}",
  ],
  team_doxx: [
    "🎭 {ticker} dev just revealed their identity! Legit team confirmed.",
    "👤 Founder doxxed! {ticker} team is actually credible.",
    "📸 Team photos released. {ticker} is a real project!",
  ],
  competitor_fud: [
    "{ticker}? Lol that's just a copy of [better project]. NGMI.",
    "Why buy {ticker} when [competitor] does the same thing better?",
    "Devs behind {ticker} rugged their last project btw. Just saying.",
    "{ticker} is literally using stolen code. Do your research.",
  ],
  regulatory_fud: [
    "🏛️ SEC reportedly looking into {ticker} and similar tokens",
    "⚖️ New regulations could affect {ticker} trading",
    "🚨 Government crackdown rumors affecting {ticker}",
    "📋 {ticker} might be classified as unregistered security",
  ],
  organic_pump: [
    "Holy shit {ticker} is actually pumping! LFG! 🚀",
    "Who's buying {ticker}? Chart going vertical!",
    "{ticker} breaking out! Called it!",
    "The {ticker} pump is real! Get in while you can!",
    "Bro {ticker} won't stop. This is insane.",
    "Green candles everywhere on {ticker}! 📈",
  ],
  organic_dump: [
    "Why is {ticker} dumping? Anyone know something?",
    "{ticker} giving back gains. Weak hands selling.",
    "Paper hands panic selling {ticker}. Shaking out noobs.",
    "Red candle on {ticker}. Normal pullback or something more?",
    "{ticker} dump looking scary ngl",
  ],
  bot_activity: [
    "🤖 Unusual bot activity detected on {ticker}",
    "🎯 Sniper bots are all over {ticker} right now",
    "📊 Algo trading volume spiking on {ticker}",
    "⚡ MEV bots front-running {ticker} trades",
  ],
  newbie_fomo: [
    "OMG just found {ticker}! Is it too late to buy?? 😭",
    "Putting my savings into {ticker}! This is gonna change my life!",
    "Everyone says {ticker} is going to $1! Just bought!",
    "How do I buy {ticker}?? Need to get in before it moons!",
    "Is {ticker} the next Bitcoin?! I'm going all in!",
    "My cousin told me about {ticker}. Just aped everything!",
  ],
  diamond_hands: [
    "💎🙌 Not selling {ticker} until $1. Diamond hands baby.",
    "Held {ticker} through the dip. Still here. Still holding.",
    "They can't shake me out of {ticker}. I believe in this.",
    "{ticker} FUD won't work on me. Holding forever.",
    "Paper hands are selling {ticker}. I'm buying their bags.",
  ],
  paper_hands: [
    "Sorry guys I sold my {ticker}. Couldn't take it anymore 😭",
    "I paperhanded {ticker} and it's still pumping. FML.",
    "Sold {ticker} at the bottom. I'm so bad at this.",
    "Taking my L on {ticker} and moving on. GG.",
    "I panic sold {ticker}. Why am I like this.",
  ],
  black_swan: [
    "🦢 BREAKING: Major exchange just got hacked. Markets crashing.",
    "🚨 ALERT: Stablecoin depegging. Everything dumping.",
    "⚠️ Crypto whale found dead. Market in chaos.",
    "💀 BREAKING: Government banning crypto trading. Sell everything.",
    "🔴 EMERGENCY: Bridge exploit. Billions stolen. Market panic.",
    "😱 Major protocol just got drained. Trust no one.",
  ],
  rug_pull: [
    "💀 RIP {ticker}. Liquidity gone. Classic rug.",
    "🚨 {ticker} RUGGED! Dev pulled everything!",
    "It's over for {ticker}. Contract renounced after rug.",
    "😭 {ticker} rug confirmed. We got played.",
    "BREAKING: {ticker} team exit scammed. LP drained.",
    "GG {ticker} holders. Dev just rugged and deleted socials.",
    "This is why we can't have nice things. {ticker} = rugged.",
    "{ticker} officially dead. Another rug for the history books.",
  ],
};

// ============================================
// EVENT CONFIGURATION
// ============================================

export interface EventConfig {
  type: MemeEventType;
  probability: number;      // Base probability per tick
  priceImpact: [number, number]; // Min/max price change %
  authorTypes: string[];    // Which author types can post this
  minPhaseTime: number;     // Minimum seconds into game before this can happen
  maxPhaseTime: number;     // Maximum time (after this, won't happen)
}

export const EVENT_CONFIGS: EventConfig[] = [
  // Common events - happen frequently
  { type: 'organic_pump', probability: 0.08, priceImpact: [3, 12], authorTypes: ['anon', 'kol'], minPhaseTime: 0, maxPhaseTime: 999 },
  { type: 'organic_dump', probability: 0.07, priceImpact: [-10, -3], authorTypes: ['anon', 'fudder'], minPhaseTime: 5, maxPhaseTime: 999 },
  { type: 'kol_shill', probability: 0.06, priceImpact: [5, 20], authorTypes: ['kol'], minPhaseTime: 3, maxPhaseTime: 999 },
  { type: 'kol_fud', probability: 0.04, priceImpact: [-15, -5], authorTypes: ['kol', 'fudder'], minPhaseTime: 10, maxPhaseTime: 999 },
  { type: 'newbie_fomo', probability: 0.05, priceImpact: [2, 8], authorTypes: ['newbie'], minPhaseTime: 5, maxPhaseTime: 999 },

  // Whale events - moderate frequency
  { type: 'whale_buy', probability: 0.04, priceImpact: [10, 35], authorTypes: ['whale'], minPhaseTime: 5, maxPhaseTime: 999 },
  { type: 'whale_dump', probability: 0.035, priceImpact: [-30, -10], authorTypes: ['whale'], minPhaseTime: 15, maxPhaseTime: 999 },

  // Dev events
  { type: 'dev_update', probability: 0.025, priceImpact: [5, 15], authorTypes: ['dev'], minPhaseTime: 10, maxPhaseTime: 999 },
  { type: 'dev_rug_signal', probability: 0.02, priceImpact: [-8, -2], authorTypes: ['dev'], minPhaseTime: 20, maxPhaseTime: 999 },

  // Big events - rare but impactful
  { type: 'exchange_listing', probability: 0.008, priceImpact: [30, 80], authorTypes: ['exchange', 'news'], minPhaseTime: 15, maxPhaseTime: 60 },
  { type: 'celebrity_mention', probability: 0.01, priceImpact: [15, 40], authorTypes: ['celebrity'], minPhaseTime: 10, maxPhaseTime: 999 },
  { type: 'partnership', probability: 0.01, priceImpact: [20, 50], authorTypes: ['dev', 'news'], minPhaseTime: 15, maxPhaseTime: 999 },

  // Negative big events
  { type: 'hack_rumor', probability: 0.015, priceImpact: [-25, -10], authorTypes: ['analyst', 'fudder', 'news'], minPhaseTime: 15, maxPhaseTime: 999 },
  { type: 'regulatory_fud', probability: 0.01, priceImpact: [-20, -8], authorTypes: ['news'], minPhaseTime: 20, maxPhaseTime: 999 },
  { type: 'liquidity_remove', probability: 0.02, priceImpact: [-35, -15], authorTypes: ['whale'], minPhaseTime: 25, maxPhaseTime: 999 },

  // Sentiment
  { type: 'diamond_hands', probability: 0.03, priceImpact: [2, 8], authorTypes: ['anon'], minPhaseTime: 15, maxPhaseTime: 999 },
  { type: 'paper_hands', probability: 0.03, priceImpact: [-6, -2], authorTypes: ['anon'], minPhaseTime: 10, maxPhaseTime: 999 },

  // Technical
  { type: 'bot_activity', probability: 0.02, priceImpact: [-5, 5], authorTypes: ['bot', 'analyst'], minPhaseTime: 5, maxPhaseTime: 999 },

  // Rare events
  { type: 'black_swan', probability: 0.005, priceImpact: [-50, -20], authorTypes: ['news'], minPhaseTime: 30, maxPhaseTime: 999 },
  { type: 'team_doxx', probability: 0.008, priceImpact: [10, 25], authorTypes: ['dev', 'news'], minPhaseTime: 20, maxPhaseTime: 50 },
  { type: 'airdrop_rumor', probability: 0.012, priceImpact: [8, 20], authorTypes: ['anon', 'kol'], minPhaseTime: 15, maxPhaseTime: 999 },

  // End game events
  { type: 'rug_pull', probability: 0.03, priceImpact: [-95, -80], authorTypes: ['dev', 'whale', 'news'], minPhaseTime: 30, maxPhaseTime: 999 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getRandomAuthor(authorType: string): SocialAuthor {
  const authors = AUTHORS[authorType] || AUTHORS.anon;
  return authors[Math.floor(Math.random() * authors.length)];
}

export function getRandomMessage(eventType: MemeEventType, ticker: string): string {
  const messages = EVENT_MESSAGES[eventType];
  let message = messages[Math.floor(Math.random() * messages.length)];

  // Replace placeholders
  message = message.replace(/{ticker}/g, ticker);
  message = message.replace(/{wallet}/g, `0x${Math.random().toString(16).slice(2, 8)}...`);
  message = message.replace(/{amount}/g, `$${(Math.random() * 100 + 10).toFixed(0)}K`);
  message = message.replace(/{exchange}/g, ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Bybit'][Math.floor(Math.random() * 5)]);

  return message;
}

export function getRandomPriceImpact(config: EventConfig): number {
  const [min, max] = config.priceImpact;
  return min + Math.random() * (max - min);
}
