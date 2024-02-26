import { mapAxiosErrorToTRPCError } from '@server/utils/mapErrors';
import { TRPCError } from '@trpc/server';
import axios from 'axios';

const xerberusAPI = axios.create({
  baseURL: 'https://api.xerberus.io/public/v1',
  headers: {
    'x-api-key': process.env.XERBERUS_API_KEY || '',
    'x-user-email': process.env.XERBERUS_EMAIL || '',
  },
});

export type ScoreKey = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D';

export interface GrowthThermometerData {
  growthScore: string;
  growthCardURL: string;
}

export interface RadarChartDataScores {
  overallRiskScore: ScoreKey;
  priceScore: ScoreKey;
  liquidityScore: ScoreKey;
  networkScore: ScoreKey;
}

export interface RadarChartData {
  scores: RadarChartDataScores;
  radarCardURL: string;
}

export interface HistoryDataEntry {
  line1: string;
  line2: string;
  date: string;
}

export interface HistoryCardDetails {
  title: string;
  rating: string;
  y_axis: string;
  x_axis: string;
  name1: string;
  name2: string;
  description: string;
}

export interface HistoryCardData {
  data: HistoryDataEntry[];
  details: HistoryCardDetails;
  historyCardURL: string;
}

export interface TokenDataResponse {
  status: string;
  data: {
    token: string;
    growthThermometerData: GrowthThermometerData;
    radarChartData: RadarChartData;
    historyCardData: HistoryCardData;
  };
}

export const getTokenInfo = async (token: string): Promise<TokenDataResponse> => {
  try {
    const response = await xerberusAPI.get(`/token/info?token=${token}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw mapAxiosErrorToTRPCError(error);
    }
    else {
      console.error(error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'An unknown error occurred' });
    }
  }
}