import { Prisma } from '@prisma/client';
import { prisma } from '@server/prisma';
import axios from 'axios';
import Error from 'next/error';
import { blockfrostAPI } from './blockfrostApi';

const EPOCHS_PER_PAGE = 100; // blockfrost api max

type Fiso = ({
  approvedStakepools: {
    id: number;
    startEpoch: number;
    endEpoch: number;
    fisoId: number;
    poolId: string;
  }[];
} & {
  id: number;
  tokenAmount: number;
  tokenName: string;
  tokenTicker: string;
  startEpoch: number;
  endEpoch: number;
  projectSlug: string;
  totalStakeEpoch: Prisma.JsonValue;
}) | null


export const calculatePageRange = (startEpoch: number, endEpoch: number, currentEpoch: number): [number, number] => {
  // Ensure the endEpoch doesn't exceed the currentEpoch
  const adjustedEndEpoch = Math.min(endEpoch, currentEpoch);

  // Calculate the distance from the current epoch to the start and end epochs
  const distanceToStart = currentEpoch - startEpoch;
  const distanceToEnd = currentEpoch - adjustedEndEpoch;

  // Calculate the page numbers, considering we are counting backwards and each page contains EPOCHS_PER_PAGE epochs
  // We use Math.floor for the startPage because we are counting backwards, so the start of the range is actually when we hit the epoch number
  // We use Math.ceil for the endPage to ensure we include the entire range of epochs needed
  const startPage = Math.floor(distanceToEnd / EPOCHS_PER_PAGE) + 1;
  const endPage = Math.ceil(distanceToStart / EPOCHS_PER_PAGE); // We don't add 1 here because we want this page to be included

  return [startPage, endPage];
};

const hasStakePoolHistory = async (poolId: string, startEpoch: number, endEpoch: number): Promise<TStakepoolHistory[]> => {
  const stakePoolHistory = await prisma.stakepoolHistory.findMany({
    where: {
      pool_id: poolId,
      epoch: {
        gte: startEpoch,
        lte: endEpoch,
      },
    },
  });
  return stakePoolHistory
};

const fetchPoolHistory = async (poolId: string, startEpoch: number, endEpoch: number, currentEpoch: number) => {
  let allPoolHistory: TStakepoolHistory[] = [];

  const [startPage, endPage] = calculatePageRange(startEpoch, endEpoch, currentEpoch);

  for (let currentPage = startPage; currentPage <= endPage; currentPage++) {
    const response = await blockfrostAPI.get(`/pools/${poolId}/history`, {
      params: { page: currentPage, order: 'desc' } // 'desc' because we are counting backwards from the current epoch
    });
    const data: TStakepoolHistory[] = response.data;
    allPoolHistory.push(...data);
  }

  const dbEntries = allPoolHistory.map(entry => ({
    ...entry,
    pool_id: poolId,
  }));

  await prisma.stakepoolHistory.createMany({ data: dbEntries, skipDuplicates: true, });

  // Filter data for relevant epochs
  const relevantData = allPoolHistory.filter(entry =>
    entry.epoch >= startEpoch && entry.epoch <= endEpoch
  );

  return relevantData;
};

const fetchUserStakeHistory = async (userStakeAddress: string, startEpoch: number, endEpoch: number, currentEpoch: number) => {
  let allStakeHistory: TUserStakeHistory[] = [];

  const [startPage, endPage] = calculatePageRange(startEpoch, endEpoch, currentEpoch);

  for (let currentPage = startPage; currentPage <= endPage; currentPage++) {
    try {
      const response = await blockfrostAPI.get(`/accounts/${userStakeAddress}/history`, {
        params: { page: currentPage, order: 'desc' } // 'desc' because we are counting backwards
      });
      const data: TUserStakeHistory[] = response.data;
      allStakeHistory.push(...data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Handle 404 error gracefully, assuming stake address is unregistered
        console.log(`Page not found for user stake address: ${userStakeAddress}, page: ${currentPage}. Assuming no history for this page.`);
        continue;
      }
      // Re-throw the error if it's not a 404
      throw error;
    }
  }

  const dbEntries = [];
  const returnedEntries = [];

  // Add database entries for all historyEntries before currentEpoch (including empty entries)
  for (let epoch = currentEpoch - 100; epoch <= currentEpoch; epoch++) {
    const historyEntry = allStakeHistory.find(entry => entry.active_epoch === epoch);

    let dbEntry = {
      active_epoch: epoch,
      amount: historyEntry ? historyEntry.amount : '',
      pool_id: historyEntry ? historyEntry.pool_id : '',
      user_reward_address: userStakeAddress,
    };

    dbEntries.push(dbEntry);

    // Additionally, check if the epoch is within the return range
    if (epoch >= startEpoch && epoch <= endEpoch) {
      returnedEntries.push(dbEntry);
    }
  }

  // Insert the fetched data into the database
  await prisma.userStakeHistory.createMany({
    data: dbEntries,
    skipDuplicates: true, // This ensures that we only insert new records and skip any duplicates
  });

  // Only return entries within the specified range (startEpoch to the lesser of currentEpoch or endEpoch)
  return returnedEntries;
};

const isTotalStakePerEpochArray = (data: any): data is TotalStakePerEpoch[] => {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'epoch' in item &&
    typeof item.epoch === 'number' &&
    'totalStake' in item &&
    typeof item.totalStake === 'number'
  );
}

const checkTotalStake = async (
  fiso: Fiso,
  startEpoch: number,
  endEpoch: number,
  currentEpoch: number,
  approvedFisoStakePools: {
    id: number;
    startEpoch: number;
    endEpoch: number;
    fisoId: number;
    poolId: string;
  }[]
) => {
  if (fiso) {
    let epochStakes: TotalStakePerEpoch[] = []
    // validate data to make typescript happy
    if (isTotalStakePerEpochArray(fiso?.totalStakeEpoch)) epochStakes = fiso.totalStakeEpoch;

    const currentEpochMinus = currentEpoch - 1 // stake pool history won't include the current epoch so subtract 1
    const finalEndEpoch = Math.min(currentEpochMinus, endEpoch);
    const totalEpochsExpected = finalEndEpoch - startEpoch + 1;

    // console.log(`currentEpochMinus: ${currentEpochMinus}`)
    // console.log(`finalEndEpoch: ${finalEndEpoch}`)
    // console.log(`totalEpochsExpected: ${totalEpochsExpected}`)
    // console.log(`epochStakes.length: ${epochStakes.length}`)

    // If the data is already complete, return it
    if (epochStakes.length === totalEpochsExpected) {
      return epochStakes;
    }

    // If there are missing data, determine the missing epochs
    const existingEpochs = epochStakes.map(stake => stake.epoch);
    const allExpectedEpochs = Array.from({ length: totalEpochsExpected }, (_, i) => startEpoch + i);
    const missingEpochs = allExpectedEpochs.filter(epoch => !existingEpochs.includes(epoch));

    // console.log('existingEpochs: ')
    // console.log(existingEpochs)
    // console.log('allExpectedEpochs: ')
    // console.log(allExpectedEpochs)
    // console.log('missingEpochs: ')
    // console.log(missingEpochs)

    // Prepare a structure to hold the fetched pool histories
    const allPoolHistories: { [poolId: string]: typeof fetchPoolHistory extends (...args: any[]) => Promise<infer R> ? R : never } = {};

    // Fetch all relevant pool histories first
    for (const fisoStakePool of approvedFisoStakePools) {
      const poolId = fisoStakePool.poolId;

      // Pool's start epoch or FISO's start epoch, whichever is greater
      const poolStartEpoch = Math.max(fisoStakePool.startEpoch, startEpoch);

      // Pool's end epoch or FISO's end epoch, whichever is smaller
      const poolEndEpoch = Math.min(fisoStakePool.endEpoch, finalEndEpoch);

      // Check if the history for this pool and epoch range exists in the database
      const existingPoolHistory = await hasStakePoolHistory(poolId, poolStartEpoch, finalEndEpoch);

      if (existingPoolHistory.length === totalEpochsExpected) {
        allPoolHistories[poolId] = existingPoolHistory;
      } else {
        allPoolHistories[poolId] = await fetchPoolHistory(poolId, poolStartEpoch, poolEndEpoch, currentEpoch);
      }
    }

    // Now, calculate the total stakes and delegators for the missing epochs
    for (const missingEpoch of missingEpochs) {
      let totalStakeForEpoch = 0;
      let totalDelegatorsForEpoch = 0;

      for (const fisoStakePool of approvedFisoStakePools) {
        const poolId = fisoStakePool.poolId;

        // Only consider the stake pool if the missing epoch is within the pool's active range
        if (missingEpoch >= fisoStakePool.startEpoch && missingEpoch <= fisoStakePool.endEpoch) {
          // Find the specific epoch data from the fetched history
          const poolHistory = allPoolHistories[poolId];
          const epochData = poolHistory.find(entry => entry.epoch === missingEpoch);

          // If the specific epoch data is found, add its active stake and delegators count to the totals
          if (epochData) {
            totalStakeForEpoch += parseInt(epochData.active_stake, 10);
            totalDelegatorsForEpoch += epochData.delegators_count;
          }
        }
      }

      // Add the data for the missing epoch
      if (totalStakeForEpoch > 0) {
        epochStakes.push({ epoch: missingEpoch, totalStake: totalStakeForEpoch, totalDelegators: totalDelegatorsForEpoch });
      }
    }

    // Sort the array based on epoch before returning
    epochStakes.sort((a, b) => a.epoch - b.epoch);

    // Update the FISO's totalStakeEpoch field with the new complete data
    await prisma.fiso.update({
      where: { id: fiso.id },
      data: { totalStakeEpoch: epochStakes },
    });

    return epochStakes;
  }
}


export type FisoRewardsReturn = {
  userEarned: number;
  userCurrentPool?: string;
  userCurrentStakedAmount?: number;
  currentTotalStake: number;
  currentTotalDelegators: number;
}

export const calculateFisoRewards = async (
  fisoId: number,
  userStakeAddress: string | undefined,
  currentEpochProvided: number | undefined
): Promise<FisoRewardsReturn | Error> => {
  try {
    // Fetch FISO details from the database
    const fiso = await prisma.fiso.findUnique({
      where: { id: fisoId },
      include: { approvedStakepools: true }
    });

    if (!fiso) {
      throw new Error({ message: `FISO with ID ${fisoId} not found`, statusCode: 500 });
    }

    // Extract necessary details from the FISO
    const { startEpoch: fisoStartEpoch, endEpoch: fisoEndEpoch, tokenAmount: totalTokens, approvedStakepools } = fiso;

    // get or set current epoch, only doing the API call here if necessary (not already done outside of the function)
    let currentEpoch = currentEpochProvided
    // console.log(`currentEpochProvided: ${currentEpochProvided}`)

    if (!currentEpoch) {
      const { data: currentEpochData } = await blockfrostAPI.get(`/epochs/latest`);
      currentEpoch = currentEpochData.epoch;
      // console.log(`currentEpochData: `)
      // console.log(currentEpochData)
      // console.log(`currentEpoch: ${currentEpoch}`)
      if (!currentEpoch) throw new Error({ message: "Cannot retrieve current epoch", statusCode: 500 })
    }

    let totalEarned = 0;
    const epochsToFetch = Math.min(fisoEndEpoch, currentEpoch) - fisoStartEpoch + 1;

    // Fetch the total stake per epoch.
    const totalStakePerEpoch = await checkTotalStake(
      fiso,
      fisoStartEpoch,
      fisoEndEpoch,
      currentEpoch,
      approvedStakepools
    );

    if (!totalStakePerEpoch) {
      throw new Error({ message: "Unable to retrieve total stake per epoch", statusCode: 500 })
    }

    // Filter out stakepools that are not in the FISO's approved list
    const approvedPoolIds = approvedStakepools.map(pool => pool.poolId);

    let userStakeDetails: {
      poolId: string;
      epoch: number;
      amount: number;
    }[] = []

    if (userStakeAddress) {
      // Fetch the user's stake history within the FISO's period
      const userStakeHistories = await prisma.userStakeHistory.findMany({
        where: {
          user_reward_address: userStakeAddress,
          active_epoch: {
            gte: fisoStartEpoch,
            lte: Math.min(fisoEndEpoch, currentEpoch), // The FISO's end epoch or the current epoch, whichever is smaller
          },
        },
      });

      if (userStakeHistories.length === epochsToFetch) {
        userStakeDetails = userStakeHistories.map(history => ({ poolId: history.pool_id, epoch: history.active_epoch, amount: Number(history.amount) }));
      } else {
        console.log(`Database missing ${epochsToFetch - userStakeHistories.length} epochs for user history`)
        const confirmedUserStakeHistories = await fetchUserStakeHistory(userStakeAddress, fisoStartEpoch, fisoEndEpoch, currentEpoch)
        userStakeDetails = confirmedUserStakeHistories.map(history => ({ poolId: history.pool_id, epoch: history.active_epoch, amount: Number(history.amount) }));
      }

      const relevantUserStakes = userStakeDetails.filter(detail => approvedPoolIds.includes(detail.poolId));

      // Now, for each relevant stake, check if the stakepool was active during the staked epoch and calculate rewards
      for (const { poolId, epoch, amount } of relevantUserStakes) {
        const stakepool = approvedStakepools.find(pool => pool.poolId === poolId);

        // Check if the stakepool was active during this epoch
        if (epoch >= stakepool!.startEpoch && epoch <= stakepool!.endEpoch && epoch < currentEpoch) {
          // Get the total stake for this epoch
          const epochTotalStake = totalStakePerEpoch.find(stake => stake.epoch === epoch)?.totalStake || 0;

          // Calculate rewards for this epoch
          const tokensPerEpoch = totalTokens / (fisoEndEpoch - fisoStartEpoch + 1);
          if (epochTotalStake !== 0) {
            const userRewardForEpoch = (amount / epochTotalStake) * tokensPerEpoch;
            totalEarned += userRewardForEpoch;
          }
        }
      }
    }

    let userCurrentStake = userStakeDetails.find(item => item.epoch === currentEpoch)
    let currentTotalStake = totalStakePerEpoch.find(stake => stake.epoch === (currentEpoch! - 1))?.totalStake || 0;
    let currentTotalDelegators = totalStakePerEpoch.find(stake => stake.epoch === (currentEpoch! - 1))?.totalDelegators || 0;
    let count = 2;

    const currentStakeZero = () => {
      if (currentTotalStake === 0 && count <= epochsToFetch) {
        const foundEpoch = totalStakePerEpoch.find(stake => stake.epoch === (currentEpoch! - count));
        if (foundEpoch) {
          userCurrentStake = userStakeDetails.find(item => item.epoch === currentEpoch! - (count - 1))
          currentTotalStake = foundEpoch.totalStake || 0;
          currentTotalDelegators = foundEpoch.totalDelegators || 0;
        }
        count++;
        currentStakeZero();
      }
    }

    if (currentTotalStake === 0) {
      currentStakeZero();
    }

    return {
      userEarned: totalEarned,
      userCurrentPool: userCurrentStake?.poolId,
      userCurrentStakedAmount: userCurrentStake?.amount,
      currentTotalStake,
      currentTotalDelegators
    };
  } catch (error: any) {
    console.error("An error occurred while calculating rewards:", error);
    throw new Error({ message: `An error occurred while calculating rewards: ${error}`, statusCode: 500 })
  }
}