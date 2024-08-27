import { z } from 'zod';
import { ZAcceptedCurrency, ZContributionRound } from "./zod-schemas/contributionSchema";

declare global {
  type TContributionRound = z.infer<typeof ZContributionRound>;
  type TAcceptedCurrency = z.infer<typeof ZAcceptedCurrency>;
  type TContributionRoundForm = {
    id: number;
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
    recipientAddress: string | null;
    restrictedCountries: string[];
    saleTerms: string | null; // JSON array with object { header: string; bodyText: string; }
    acceptedCurrencies: TAcceptedCurrency[];
  };
}