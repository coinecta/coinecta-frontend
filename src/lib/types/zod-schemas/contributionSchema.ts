import { z } from 'zod';

export const ZAcceptedCurrency = z.object({
  id: z.string().optional(),
  receiveAddress: z.string(),
  currency: z.string(),
  blockchain: z.string(),
  contributionRoundId: z.number()
})

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
  whitelistSlug: z.string().nullable().optional(),
  recipientAddress: z.string().nullable().optional(),
  restrictedCountries: z.array(z.string()),
  saleTerms: z.string().nullable().optional(),
  acceptedCurrencies: z.array(ZAcceptedCurrency)
});

export const ZPoolWeightItem = z.object({
  address: z.string(),
  uniqueNfts: z.number(),
  totalStake: z.string(),
  cummulativeWeight: z.number()
})

export const ZPoolWeightAPI = z.object({
  data: z.array(ZPoolWeightItem),
  totalStakers: z.number(),
  totalStake: z.string(),
  totalCummulativeWeight: z.string()
})