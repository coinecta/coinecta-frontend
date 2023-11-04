import axios from 'axios';

const blockfrostId = process.env.BLOCKFROST_PROJECT_ID

export const blockfrostAPI = axios.create({
  baseURL: 'https://cardano-mainnet.blockfrost.io/api/v0',
  headers: { 'project_id': blockfrostId }
});
