import { z } from 'zod';

export const ZContributionRound = z.object({
  id: z.number().optional(),
  name: z.string(),
  saleType: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  tokenTicker: z.string(),
  tokenTarget: z.number(),
  currency: z.string(),
  price: z.number(),
  deposited: z.number(),
  projectName: z.string(),
  projectSlug: z.string(),
  whitelistSlug: z.string()
});