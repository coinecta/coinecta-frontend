import { prisma } from '@server/prisma';
import { TRPCError } from '@trpc/server';
import { blockfrostAPI } from './blockfrostApi';

export const fetchAndUpdateStakepoolData = async (stakepoolIds: string[], includeSignups?: boolean) => {
  // Variables to store successful and unsuccessful stakepools
  const successfulStakePools = [];
  const errors = [];

  const normalizedPoolIds = [];
  let stakePools;
  try {
    stakePools = await prisma.stakepool.findMany({
      where: {
        OR: [
          { hex: { in: stakepoolIds } },
          { pool_id: { in: stakepoolIds } },
        ],
      },
      select: {
        pool_id: true,
        hex: true,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error retrieving stakepools from the database.',
    });
  }

  for (const identifier of stakepoolIds) {
    try {
      const existingPool = stakePools.find(pool => pool.pool_id === identifier || pool.hex === identifier);
      if (existingPool) {
        normalizedPoolIds.push(existingPool.pool_id);
      } else {
        const { data: metadata } = await blockfrostAPI.get(`/pools/${identifier}/metadata`);
        normalizedPoolIds.push(metadata.pool_id);

        await prisma.stakepool.create({
          data: {
            pool_id: metadata.pool_id,
            ...metadata,
          },
        });
      }
    } catch (error: any) {
      // Store identifier and error message for response
      errors.push({ identifier, error: error.message || 'An error occurred while processing this stakepool.' });
      continue; // Skip to the next iteration
    }
  }

  const staleMinutes = 30
  const timeAgo = new Date(Date.now() - (60000 * staleMinutes));

  for (const pool_id of normalizedPoolIds) {
    try {
      let stats = await prisma.stakepoolStats.findUnique({
        where: { pool_id },
      });

      if (!stats || stats.updated_at < timeAgo) {
        const { data: newStats } = await blockfrostAPI.get(`/pools/${pool_id}`);

        if (stats) {
          await prisma.stakepoolStats.update({
            where: { pool_id },
            data: {
              ...newStats,
              updated_at: new Date(),
            },
          });
        } else {
          await prisma.stakepoolStats.create({
            data: {
              pool_id,
              ...newStats,
            },
          });
        }
      }
    } catch (error: any) {
      // Store pool_id and error message for response
      errors.push({ pool_id, error: error.message || 'An error occurred while updating this stakepool stats.' });
      continue; // Skip to the next iteration
    }
  }

  try {
    const updatedStakePools: TStakePoolWithStats[] = (await prisma.stakepool.findMany({
      where: {
        pool_id: {
          in: normalizedPoolIds,
        },
      },
      include: {
        stats: true,
        spoSignups: includeSignups ? {
          include: {
            fisos: true,
          },
        } : false,
      },
    })).map(pool => ({
      ...pool,
      stats: {
        id: pool.stats?.id || 0,
        hex: pool.stats?.hex || '',
        owners: pool.stats?.owners || [],
        pool_id: pool.stats?.pool_id || '',
        vrf_key: pool.stats?.vrf_key || '',
        live_size: pool.stats?.live_size || 0,
        created_at: pool.stats?.created_at || new Date(),
        fixed_cost: pool.stats?.fixed_cost || '',
        live_stake: pool.stats?.live_stake || '',
        retirement: pool.stats?.retirement || [],
        updated_at: pool.stats?.updated_at || new Date(),
        active_size: pool.stats?.active_size || 0,
        live_pledge: pool.stats?.live_pledge || '',
        margin_cost: pool.stats?.margin_cost || 0,
        active_stake: pool.stats?.active_stake || '',
        blocks_epoch: pool.stats?.blocks_epoch || 0,
        registration: pool.stats?.registration || [],
        blocks_minted: pool.stats?.blocks_minted || 0,
        reward_account: pool.stats?.reward_account || '',
        declared_pledge: pool.stats?.declared_pledge || '',
        live_delegators: pool.stats?.live_delegators || 0,
        live_saturation: pool.stats?.live_saturation || 0,
      },
      hex: pool.hex ?? undefined,
      url: pool.url ?? undefined,
      hash: pool.hash ?? undefined,
      ticker: pool.ticker ?? undefined,
      name: pool.name ?? undefined,
      description: pool.description ?? undefined,
      homepage: pool.homepage ?? undefined,
      spoSignups: pool.spoSignups ? pool.spoSignups as unknown as TSpoSignups : null,
    }));;

    successfulStakePools.push(...updatedStakePools);
  } catch (error: any) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Error retrieving updated stakepools from the database.',
    });
  }

  // Return both successful and unsuccessful stakepools
  return { successfulStakePools, errors };
}