import axios from 'axios';

/**
 * Fetch pool weight data for a specific address.
 * 
 * @param {string} address The address to check pool weight.
 * @returns {Promise<IPoolWeightDataItem | undefined>} The pool weight data or undefined if not found.
 */
export async function checkPoolWeight(address: string) {
  try {
    const response = await axios.post('https://api.coinecta.fi/stake/snapshot', [address], {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

    const stakeData: IPoolWeightDataItem[] = response.data.data;

    return stakeData[0];
  } catch (error) {
    console.error(`Error fetching pool weights for address: ${address}`, error);
    throw error;
  }
}