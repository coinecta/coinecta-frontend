import { z } from 'zod';
import { ZContributionRound } from "./zod-schemas/contributionSchema";

declare global {
  type TContributionRound = z.infer<typeof ZContributionRound>;
  type TContributionRoundForm = {
    name: string;
    saleType: string;
    startDate: string; // Use string for simplicity in handling date input
    endDate: string;
    tokenTicker: string;
    tokenTarget: number;
    currency: string;
    price: number;
    deposited: number;
    projectName: string;
    projectSlug: string;
    whitelistSlug: string | null | undefined;
  };
}