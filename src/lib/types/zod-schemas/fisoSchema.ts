import { z } from 'zod';

const TFisoApprovedStakePool = z.object({
  poolId: z.string(),
  startEpoch: z.number(),
  endEpoch: z.number(),
});

const ZodSpoSignups = z.object({
  poolId: z.string(),
  operatorName: z.string().nullable(),
  operatorEmail: z.string().nullable(),
  operatorTwitter: z.string().nullable(),
  operatorDiscord: z.string().nullable(),
  operatorTelegram: z.string().nullable(),
  // fisos will be defined later
});

const TFiso = z.object({
  id: z.number().optional(),
  tokenAmount: z.number(),
  tokenName: z.string(),
  tokenTicker: z.string(),
  startEpoch: z.number(),
  endEpoch: z.number(),
  approvedStakepools: z.array(TFisoApprovedStakePool).optional(),
  totalStakeEpoch: z.any().optional(),
  spoSignups: z.array(ZodSpoSignups),
});

const TSpoSignups = ZodSpoSignups.extend({
  fisos: z.array(TFiso),
});

const TStakepool = z.object({
  pool_id: z.string(),
  hex: z.string().optional(),
  url: z.string().optional(),
  hash: z.string().optional(),
  ticker: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  homepage: z.string().optional(),
});

export { TFiso, TFisoApprovedStakePool, TSpoSignups, TStakepool };

