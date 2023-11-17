import { z } from 'zod';
import { TFiso } from './fisoSchema';

export {
  TProject,
  TRoadmap,
  TSocials,
  TTeam,
  TTokenomic,
  TTokenomics,
  TWhitelist,
  TWhitelistSignup
};

const TSocials = z.object({
  id: z.number().optional(),
  telegram: z.string().optional(),
  twitter: z.string().optional(),
  discord: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
});

const TRoadmap = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string(),
  date: z.date(),
});

const TTeam = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string(),
  profileImgUrl: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
});

const TTokenomic = z.object({
  id: z.number().optional(),
  name: z.string(),
  amount: z.number(),
  value: z.string().optional(),
  tge: z.string().optional(),
  freq: z.string().optional(),
  length: z.string().optional(),
  lockup: z.string().optional(),
});

const TTokenomics = z.object({
  id: z.number().optional(),
  tokenName: z.string(),
  totalTokens: z.number(),
  tokenTicker: z.string(),
  tokenomics: z.array(TTokenomic),
});

const TWhitelistSignup = z.object({
  id: z.string(),
  name: z.string(),
  amountRequested: z.string(),
  notes: z.string().optional(),
  whitelist_slug: z.string(),
  user_id: z.string()
});

const TWhitelist = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  maxPerSignup: z.number().optional(),
  hardCap: z.number().optional(),
  externalLink: z.string().optional(),
  ergoProofs: z.boolean()
});

const TProject = z.object({
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string(),
  whitepaperLink: z.string().optional(),
  description: z.string(),
  blockchains: z.array(z.string()),
  fundsRaised: z.number().optional(),
  bannerImgUrl: z.string(),
  avatarImgUrl: z.string(),
  isLaunched: z.boolean(),
  isDraft: z.boolean(),
  frontPage: z.boolean(),
  socials: TSocials,
  roadmap: z.array(TRoadmap),
  team: z.array(TTeam),
  tokenomics: TTokenomics,
  whitelists: z.array(TWhitelist),
  fisos: z.array(TFiso)
});





