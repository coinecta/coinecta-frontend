import {
  TProject as ZodProject,
  TRoadmap as ZodRoadmap,
  TSocials as ZodSocials,
  TTeam as ZodTeam,
  TTokenomic as ZodTokenomic,
  TTokenomics as ZodTokenomics,
  TWhitelist as ZodWhitelist,
  TWhitelistSignup as ZodWhitelistSignup
} from '@lib/types/zod-schemas/projectSchema';
import { z } from 'zod';

declare global {
  type TTokenomic = z.infer<typeof ZodTokenomic>;
  type TTokenomics = z.infer<typeof ZodTokenomics>;
  type TTeam = z.infer<typeof ZodTeam>;
  type TRoadmap = z.infer<typeof ZodRoadmap>;
  type TWhitelist = z.infer<typeof ZodWhitelist>;
  type TWhitelistSignup = z.infer<typeof ZodWhitelistSignup>;
  type TSocials = z.infer<typeof ZodSocials>;
  type TProject = z.infer<typeof ZodProject>;

  interface IProjectDetails {
    title: string;
    tagline: string;
    imageUrl: string;
    category: string;
    status: "Complete" | "Upcoming";
    blockchains: string[];
  }
}