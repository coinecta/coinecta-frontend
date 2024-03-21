import { TProject } from "@lib/types/zod-schemas/projectSchema";
import {
  ContributionRound,
  Project,
  Roadmap,
  Socials,
  Team,
  Tokenomic,
  Tokenomics,
  Whitelist
} from "@prisma/client";
import { z } from "zod";

interface TokenomicsWithRelations extends Tokenomics {
  tokenomics: Tokenomic[]
}

// interface FisoWithRelations extends Fiso {
//   approvedStakepools: FisoApprovedStakePool[];
//   spoSignups: SpoSignups[];
// }

interface ProjectWithRelations extends Project {
  socials: Socials | null;
  roadmap: Roadmap[];
  team: Team[];
  tokenomics: TokenomicsWithRelations | null;
  whitelists: Whitelist[];
  contributionRounds: ContributionRound[];
  // fisos: FisoWithRelations[];
}

export const mapFullProjectFromDb = (projectDb: ProjectWithRelations | null): z.infer<typeof TProject> | undefined => {
  if (!projectDb) {
    return undefined;
  }

  // Map Socials
  const socials = projectDb.socials
    ? projectDb.socials
    : {};

  // Map Roadmaps
  const roadmaps = projectDb.roadmap.map(roadmap => ({
    id: roadmap.id,
    name: roadmap.name,
    description: roadmap.description,
    date: roadmap.date,
  }));

  // Map Teams
  const teams = projectDb.team.map(team => ({
    id: team.id,
    name: team.name,
    description: team.description,
    profileImgUrl: team.profileImgUrl || '',
    twitter: team.twitter || '',
    linkedin: team.linkedin || '',
  }));

  // Map Tokenomics and Tokenomic
  const tokenomics = projectDb.tokenomics ? {
    id: projectDb.tokenomics.id,
    tokenName: projectDb.tokenomics.tokenName,
    totalTokens: projectDb.tokenomics.totalTokens,
    tokenTicker: projectDb.tokenomics.tokenTicker,
    tokenPolicyId: projectDb.tokenomics.policyId || '',
    tokenomics: projectDb.tokenomics.tokenomics.map(tokenomic => ({
      name: tokenomic.name,
      amount: tokenomic.amount,
      value: tokenomic.value || '',
      tge: tokenomic.tge || '',
      freq: tokenomic.freq || '',
      length: tokenomic.length || '',
      lockup: tokenomic.lockup || '',
      walletAddress: tokenomic.walletAddress || '',
    })),
  } : { // default empty object if tokenomics is null
    tokenName: '',
    totalTokens: 0,
    tokenTicker: '',
    tokenPolicyId: '',
    tokenomics: [],
  };

  // Map Whitelists
  const whitelists = projectDb.whitelists.map(whitelist => ({
    id: whitelist.id,
    name: whitelist.name,
    slug: whitelist.slug,
    startDateTime: whitelist.startDateTime,
    endDateTime: whitelist.endDateTime,
    maxPerSignup: whitelist.maxPerSignup || 0,
    hardCap: whitelist.hardCap || 0,
    externalLink: whitelist.externalLink || '',
    ergoProofs: whitelist.ergoProofs
  }));


  // Map Contribution Rounds
  const contributionRounds = projectDb.contributionRounds.map(contributionRound => ({
    ...contributionRound
  }));

  // Combine everything into a project
  const project: z.infer<typeof TProject> = {
    name: projectDb.name,
    slug: projectDb.slug,
    shortDescription: projectDb.shortDescription,
    whitepaperLink: projectDb.whitepaperLink || '',
    description: projectDb.description,
    blockchains: projectDb.blockchains,
    fundsRaised: projectDb.fundsRaised || 0,
    bannerImgUrl: projectDb.bannerImgUrl,
    avatarImgUrl: projectDb.avatarImgUrl,
    isLaunched: projectDb.isLaunched,
    isDraft: projectDb.isDraft,
    frontPage: projectDb.frontPage,
    socials,
    roadmap: roadmaps,
    team: teams,
    tokenomics,
    whitelists,
    contributionRounds,
    fisos: []
  };

  return project;
}

export const mapFisoObject = (fisoData: any) => {
  // // Map Fisos
  const fisos: TFiso[] = fisoData.map((fiso: any) => ({
    id: fiso.id,
    tokenAmount: fiso.tokenAmount,
    tokenName: fiso.tokenName,
    tokenTicker: fiso.tokenTicker,
    startEpoch: fiso.startEpoch,
    endEpoch: fiso.endEpoch,
    projectSlug: fiso.projectSlug,
    approvedStakepools: fiso.approvedStakepools.map((pool: any) => ({
      poolId: pool.poolId,
      startEpoch: pool.startEpoch,
      endEpoch: pool.endEpoch
    })) || [],
    spoSignups: fiso.spoSignups.map((signup: any) => ({
      poolId: signup.poolId,
      operatorName: signup.operatorName || '',
      operatorEmail: signup.operatorEmail || '',
      operatorTwitter: signup.operatorTwitter || '',
      operatorDiscord: signup.operatorDiscord || '',
      operatorTelegram: signup.operatorTelegram || '',
    })) || [],
    totalStakeEpoch: fiso.totalStakeEpoch || undefined,
  }));
  return fisos
}