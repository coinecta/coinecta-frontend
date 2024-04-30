import axios from 'axios';

// Function to get the block time by hash
export async function getBlockTime(blockHash: string): Promise<number> {
  try {
    const apiUrl = `https://cardano-mainnet.blockfrost.io/api/v0/blocks/${blockHash}`;
    const response = await axios.get<BlockDetails>(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'project_id': 'mainnetsxoOGeKAZMn8sLkno5bQIxnUol7pS9gZ'
      }
    });

    // Return the block time
    return response.data.time;
  } catch (error) {
    console.error('Failed to fetch block details', error);
    throw error;
  }
}