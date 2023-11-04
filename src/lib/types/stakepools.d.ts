import {
  TFiso as ZodFiso,
  TFisoApprovedStakePool as ZodFisoApprovedStakePool,
  TStakepool as ZodStakepool
} from '@lib/types/zod-schemas/fisoSchema';
import { z } from 'zod';

declare global {
  type TFiso = z.infer<typeof ZodFiso>;
  type TFisoApprovedStakePool = z.infer<typeof ZodFisoApprovedStakePool>;
  type TSpoSignups = {
    id: number;
    poolId: string;
    operatorName?: string;
    operatorEmail?: string;
    operatorTwitter?: string;
    operatorDiscord?: string;
    operatorTelegram?: string;
    fisos: TFiso[]
  };
  type TStakepool = z.infer<typeof ZodStakepool>;

  type TStakepoolStats = {
    id: number;
    hex: string;
    owners: string[];
    pool_id: string;
    vrf_key: string;
    live_size: number;
    created_at: Date;
    fixed_cost: string;
    live_stake: string;
    retirement: any[];
    updated_at: Date;
    active_size: number;
    live_pledge: string;
    margin_cost: number;
    active_stake: string;
    blocks_epoch: number;
    registration: string[];
    blocks_minted: number;
    reward_account: string;
    declared_pledge: string;
    live_delegators: number;
    live_saturation: number;
  };

  type TStakePoolWithStats = {
    id: number;
    pool_id: string;
    hex?: string;
    url?: string;
    hash?: string;
    ticker?: string;
    name?: string;
    description?: string;
    homepage?: string;
    stats: TStakepoolStats;
    spoSignups: TSpoSignups?;
  }

  type TFullStakePool = {
    id: number;
    pool_id: string;
    hex: string;
    url: string;
    hash: string;
    ticker: string;
    name: string;
    description: string;
    homepage: string;
    stats: TStakepoolStats;
    history: TStakepoolHistory[];
    fisoPools: TFisoApprovedStakePool[];
    SpoSignups: TSpoSignups[];
  }

  type TUserStakeHistory = {
    active_epoch: number;
    amount: string;
    pool_id: string;
  }

  type TStakepoolHistory = {
    epoch: number;
    blocks: number;
    active_stake: string;
    active_size: number;
    delegators_count: number;
    rewards: string;
    fees: string;
  }
}