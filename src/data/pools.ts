// Pool configurations for DEGEN ACADEMY

import type { PoolConfig, Pool } from '../types/game.ts';

export const POOL_CONFIGS: PoolConfig[] = [
  { id: 'stable', name: 'StableYield', emoji: '🏦', apy: 8, riskLevel: 'safe' },
  { id: 'blue', name: 'BlueChip', emoji: '💎', apy: 25, riskLevel: 'safe' },
  { id: 'growth', name: 'GrowthFi', emoji: '📈', apy: 69, riskLevel: 'medium' },
  { id: 'yield', name: 'YieldMax', emoji: '💰', apy: 150, riskLevel: 'medium' },
  { id: 'degen', name: 'DegenPool', emoji: '🎰', apy: 300, riskLevel: 'degen' },
  { id: 'moon', name: 'MoonShot', emoji: '🚀', apy: 420, riskLevel: 'degen' },
];

export function createInitialPools(): Pool[] {
  return POOL_CONFIGS.map(config => ({
    ...config,
    deposited: 0,
    isRugged: false,
    hasAudit: false,
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
