import { prisma } from '@server/prisma';
import { fetchAndUpdateStakepoolData } from '@server/utils/fetchAndUpdateStakepoolData';
import { FisoRewardsReturn, calculateFisoRewards } from '@server/utils/userRewardsFiso';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const fisoRouter = createTRPCRouter({
  addStakepoolSignupsManually: adminProcedure
    .input(z.object({
      stakepoolIds: z.array(z.string()),
      fisoId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const { stakepoolIds, fisoId } = input;

      // Fetch and update stakepool data
      const freshData = await fetchAndUpdateStakepoolData(stakepoolIds, true);
      if (!freshData) throw new Error('Unable to add stakepools to database')

      // Ensure FISO exists
      const fiso = await prisma.fiso.findUnique({
        where: { id: fisoId },
      });
      if (!fiso) throw new Error('FISO not found');

      // Add or update SpoSignups entries
      await Promise.all(freshData.successfulStakePools.map(async (stakepool) => {
        // If SpoSignup doesn't exist, create it and associate it with the FISO
        if (!stakepool.spoSignups) {
          await prisma.spoSignups.create({
            data: {
              stakepool: { connect: { pool_id: stakepool.pool_id } },
              fisos: { connect: { id: fisoId } },
            },
          });
        } else {
          // If SpoSignup exists, check if the FISO is already associated
          const isFisoAssociated = stakepool.spoSignups.fisos.some(f => f.id === fisoId);
          if (!isFisoAssociated) {
            // If not, add the FISO to the fisos array
            await prisma.spoSignups.update({
              where: { id: stakepool.spoSignups.id },
              data: {
                fisos: { connect: { id: fisoId } },
              },
            });
          }
        }
      }));
    }),
  approveStakepools: adminProcedure
    .input(z.object({
      fisoId: z.number(),
      stakepoolIds: z.array(z.string()),
      startEpoch: z.number(),
      endEpoch: z.number()
    }))
    .mutation(async ({ input }) => {
      const { fisoId, stakepoolIds, startEpoch, endEpoch } = input;

      // Retrieve the Fiso record
      const fiso = await prisma.fiso.findUnique({
        where: { id: fisoId },
      });

      if (!fiso) {
        throw new TRPCError({
          message: 'Fiso not found',
          code: "NOT_FOUND"
        });
      }

      if (
        startEpoch < fiso.startEpoch ||
        startEpoch > fiso.endEpoch - 1
      ) {
        throw new TRPCError({
          message: 'Start epoch is out of the Fiso\'s epoch range',
          code: "BAD_REQUEST"
        });
      }

      if (
        endEpoch < fiso.startEpoch + 1 ||
        endEpoch > fiso.endEpoch
      ) {
        throw new TRPCError({
          message: 'End epoch is out of the Fiso\'s epoch range',
          code: "BAD_REQUEST"
        });
      }

      if (startEpoch > endEpoch) {
        throw new TRPCError({
          message: 'Start epoch cannot be later than end epoch. ',
          code: "BAD_REQUEST"
        });
      }

      let count = 0

      for (const poolId of stakepoolIds) {
        try {
          const stakepool = await prisma.stakepool.findUnique({
            where: { pool_id: poolId },
          });

          if (!stakepool) {
            console.error(`Stakepool with id ${poolId} not found`);
            continue;
          }

          const existingEntry = await prisma.fisoApprovedStakePool.findFirst({
            where: {
              fisoId: fiso.id,
              poolId: stakepool.pool_id,
            },
          });

          if (existingEntry) {
            console.log(`Entry already exists for stakepool ${poolId}`);
          } else {
            const approved = await prisma.fisoApprovedStakePool.create({
              data: {
                fisoId: fiso.id,
                poolId: stakepool.pool_id,
                startEpoch,
                endEpoch,
              },
            });
            if (approved) count++
          }
        } catch (error) {
          console.error(`An error occurred processing pool ${poolId}:`, error);
          continue
        }
      }

      return { message: `${count} stakepools approved`, status: 'success' };
    }),
  editStakepoolFisoApproval: adminProcedure
    .input(z.object({
      fisoId: z.number(),
      stakepoolIds: z.array(z.string()),
      startEpoch: z.number(),
      endEpoch: z.number()
    }))
    .mutation(async ({ input }) => {
      const { fisoId, stakepoolIds, startEpoch, endEpoch } = input;

      // Retrieve the Fiso record
      const fiso = await prisma.fiso.findUnique({
        where: { id: fisoId },
      });

      if (!fiso) {
        throw new TRPCError({
          message: 'Fiso not found',
          code: "NOT_FOUND"
        });
      }

      if (
        startEpoch < fiso.startEpoch ||
        startEpoch > fiso.endEpoch - 1
      ) {
        throw new TRPCError({
          message: 'Start epoch is out of the Fiso\'s epoch range',
          code: "BAD_REQUEST"
        });
      }

      if (
        endEpoch < fiso.startEpoch + 1 ||
        endEpoch > fiso.endEpoch
      ) {
        throw new TRPCError({
          message: 'End epoch is out of the Fiso\'s epoch range',
          code: "BAD_REQUEST"
        });
      }

      if (startEpoch >= endEpoch) {
        throw new TRPCError({
          message: 'Start epoch must be before end epoch. ',
          code: "BAD_REQUEST"
        });
      }

      let count = 0

      for (const poolId of stakepoolIds) {
        try {
          const updatedStakepool = await prisma.fisoApprovedStakePool.updateMany({
            where: {
              poolId: poolId,
              fisoId: fisoId
            },
            data: {
              startEpoch,
              endEpoch,
            },
          });

          if (updatedStakepool) {
            count++;
            console.log(`Successfully updated stakepool with id ${poolId} for fiso ID ${fisoId}`);
          }
        } catch (error) {
          // This will catch "Record not found" error as well
          console.error(`Error updating stakepool with id ${poolId} for fiso ID ${fisoId}:`, error);
        }
      }

      await prisma.fiso.update({
        where: {
          id: fisoId
        },
        data: {
          totalStakeEpoch: null as any
        }
      })

      return { message: `${count} stakepools edited`, status: 'success' };
    }),
  getByProjectSlug: publicProcedure
    .input(z.object({
      projectSlug: z.string(),
      includeSpoSignups: z.boolean().optional()
    }))
    .query(async ({ input }) => {
      try {
        const fisos = await prisma.fiso.findMany({
          where: {
            projectSlug: input.projectSlug
          },
          include: {
            spoSignups: input.includeSpoSignups === true
          }
        });

        return fisos
      } catch (error: any) {
        throw new Error(error.message || "Unable to fetch fisos")
      }
    }),
  getApprovedStakepools: publicProcedure
    .input(z.object({
      fisoId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const approvedStakepools = await prisma.fisoApprovedStakePool.findMany({
          where: {
            fisoId: input.fisoId
          },
        });

        return approvedStakepools
      } catch (error: any) {
        throw new TRPCError({
          message: error.message || 'Unexpected error occured',
          code: "INTERNAL_SERVER_ERROR"
        });
      }
    }),
  getFisoUserInfo: publicProcedure
    .input(z.object({
      fisoId: z.number(),
      rewardAddress: z.string().optional(),
      currentEpochProvided: z.number().optional()
    }))
    .query(async ({ input, ctx }) => {
      const fiso = input.fisoId;
      const epoch = input.currentEpochProvided;

      let address: string | undefined = undefined

      if (input.rewardAddress) {
        address = input.rewardAddress
      }
      else if (ctx.session) {
        const addressFetch = await prisma.user.findUnique({
          where: {
            id: ctx.session.user.id
          },
          select: {
            rewardAddress: true
          }
        })

        if (!addressFetch?.rewardAddress) {
          throw new TRPCError({
            message: 'Unable to retrieve user address',
            code: "BAD_REQUEST"
          });
        }

        address = addressFetch.rewardAddress
      } else {
        throw new TRPCError({
          message: 'No stake address provided',
          code: "BAD_REQUEST"
        })
      }

      try {
        const result = await calculateFisoRewards(fiso, address, epoch);

        if (result instanceof Error) {
          throw new TRPCError({
            message: result.message,
            code: "INTERNAL_SERVER_ERROR"
          });
        } else {
          return result as FisoRewardsReturn;
        }
      } catch (error) {
        throw new TRPCError({
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: "INTERNAL_SERVER_ERROR"
        });
      }
    }),
  getFisoTotalStake: publicProcedure
    .input(z.object({
      fisoId: z.number(),
      currentEpoch: z.number()
    }))
    .query(async ({ input }) => {
      const fisoId = input.fisoId;
      const epoch = input.currentEpoch;

      try {
        const result = await prisma.fiso.findFirst({
          where: {
            id: fisoId
          },
          select: {
            totalStakeEpoch: true
          }
        })

        if (!result) {
          throw new TRPCError({
            message: 'FISO not found in database',
            code: "NOT_FOUND"
          });
        }

        if (!!result?.totalStakeEpoch) {
          const object: TotalStakePerEpoch[] = result.totalStakeEpoch as TotalStakePerEpoch[]

          // can only grab the previous epoch, current epoch data is not available until epoch concludes 
          const epochData = object.find((entry: any) => entry.epoch === (epoch - 1))

          return epochData
        }
      } catch (error) {
        throw new TRPCError({
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: "INTERNAL_SERVER_ERROR"
        });
      }
    }),
});