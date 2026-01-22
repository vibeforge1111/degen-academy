// Pool configurations for DEGEN ACADEMY

import type { PoolConfig, Pool } from '../types/game.ts';

export const POOL_CONFIGS: PoolConfig[] = [
  { id: 'stable', name: 'StableYield', emoji: '🏦', logo: '/pool-stable.png', apy: 8, riskLevel: 'safe' },
  { id: 'blue', name: 'BlueChip', emoji: '💎', logo: '/pool-blue.png', apy: 25, riskLevel: 'safe' },
  { id: 'growth', name: 'GrowthFi', emoji: '📈', logo: '/pool-growth.png', apy: 69, riskLevel: 'medium' },
  { id: 'yield', name: 'YieldMax', emoji: '💰', logo: '/pool-yield.png', apy: 150, riskLevel: 'medium' },
  { id: 'degen', name: 'DegenPool', emoji: '🎰', logo: '/pool-degen.png', apy: 300, riskLevel: 'degen' },
  { id: 'moon', name: 'MoonShot', emoji: '🚀', logo: '/pool-moon.png', apy: 420, riskLevel: 'degen' },
];

export function createInitialPools(): Pool[] {
  return POOL_CONFIGS.map(config => ({
    ...config,
    deposited: 0,
    isRugged: false,
    hasAudit: false,
    isLeveraged: false,
    isPumping: false,
    pumpEndTime: null,
  }));
}

export function getRiskEmoji(riskLevel: Pool['riskLevel']): string {
  switch (riskLevel) {
    case 'safe': return '🟢';
    case 'medium': return '🟡';
    case 'degen': return '🔴';
  }
}

export function getRiskLabel(riskLevel: Pool['riskLevel']): string {
  switch (riskLevel) {
    case 'safe': return 'SAFE';
    case 'medium': return 'MEDIUM';
    case 'degen': return 'DEGEN';
  }
}
