import { ZContributionRound } from '@lib/types/zod-schemas/contributionSchema';
import { prisma } from '@server/prisma';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const contributionRouter = createTRPCRouter({
  addContributionRound: adminProcedure
    .input(ZContributionRound.omit({ id: true })) // Exclude 'id' for creation as it's auto-generated
    .mutation(async ({ input }) => {
      try {
        const newRound = await prisma.contributionRound.create({
          data: input,
        });
        return newRound;
      } catch (error) {
        console.error('Error creating contribution round:', error);
        throw new TRPCError({
          message: 'Failed to create new contribution round',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  // Update ContributionRound
  updateContributionRound: adminProcedure
    .input(ZContributionRound.extend({ id: z.number() })) // Include 'id' for updates
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        const updatedRound = await prisma.contributionRound.update({
          where: { id },
          data,
        });
        return updatedRound;
      } catch (error) {
        console.error('Error updating contribution round:', error);
        throw new TRPCError({
          message: `Failed to update contribution round with id ${id}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  // Delete ContributionRound
  deleteContributionRound: adminProcedure
    .input(z.object({ id: z.number() })) // Expect an object with an 'id' for deletion
    .mutation(async ({ input }) => {
      try {
        await prisma.contributionRound.delete({
          where: { id: input.id },
        });
        return { success: true, message: 'Contribution round deleted successfully' };
      } catch (error) {
        console.error('Error deleting contribution round:', error);
        throw new TRPCError({
          message: `Failed to delete contribution round with id ${input.id}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  getContributionRoundsByProjectSlug: publicProcedure
    .input(z.object({ projectSlug: z.string() }))
    .query(async ({ input }) => {
      try {
        const { projectSlug } = input;
        const rounds = await prisma.contributionRound.findMany({
          where: { projectSlug },
          orderBy: { startDate: 'asc' }
        });
        return rounds;
      } catch (error) {
        console.error(`Error fetching contribution rounds for projectSlug ${input.projectSlug}:`, error);
        throw new TRPCError({
          message: `An unexpected error occurred while fetching contribution rounds for projectSlug ${input.projectSlug}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  createTransaction: protectedProcedure
    .input(z.object({
      description: z.string().optional(),
      amount: z.string(),
      currency: z.string(),
      address: z.string(),
      txId: z.string().optional(),
      contributionId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      try {
        const newTransaction = await prisma.transaction.create({
          data: {
            description: input.description,
            amount: input.amount,
            currency: input.currency,
            address: input.address,
            txId: input.txId,
            user_id: userId,
            contribution_id: input.contributionId,
          },
        });

        await prisma.contributionRound.update({
          where: {
            id: input.contributionId,
          },
          data: {
            deposited: {
              increment: Number(input.amount),
            },
          },
        });

        return newTransaction;
      } catch (error) {
        console.error(`Error creating transaction:`, error);
        throw new TRPCError({
          message: `An unexpected error occurred while creating the transaction`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  sumTransactions: protectedProcedure
    .input(z.object({
      contributionId: z.number()
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const transactions = await prisma.transaction.findMany({
        where: {
          contribution_id: input.contributionId,
          user_id: userId
        },
        select: {
          amount: true, // Select only the amount field
        },
      });

      const totalAmount = transactions.reduce((sum, transaction) => {
        return sum + parseFloat(transaction.amount);
      }, 0);

      return totalAmount
    }),

  listTransactionsByContribution: adminProcedure
    .input(z.object({
      contributionId: z.number()
    }))
    .query(async ({ input }) => {
      const { contributionId } = input;
      const transactions = await prisma.transaction.findMany({
        where: {
          contribution_id: contributionId
        },
        include: {
          user: {
            select: {
              defaultAddress: true,
              sumsubId: true,
              sumsubResult: true
            }
          }
        }
      });
      return transactions.map(transaction => ({
        ...transaction,
        userDefaultAddress: transaction.user?.defaultAddress,
        userSumsubId: transaction.user?.sumsubId
      }));
    }),

  // listUsersExceedingThreshold: adminProcedure
  // .input(z.object({
  //   contributionId: z.number(),
  //   date: z.date(),
  //   threshold: z.number()
  // }))
  // .query(async ({ input }) => {
  //   const { contributionId, date, threshold } = input;

  //   // Fetch all transactions for the given contributionId and date
  //   const transactions = await prisma.transaction.findMany({
  //     where: {
  //       contribution_id: contributionId,
  //       created_at: {
  //         gte: startOfDay(date),
  //         lte: endOfDay(date)
  //       }
  //     },
  //     include: {
  //       user: true // include user data
  //     }
  //   });

  //   // Aggregate transactions by user
  //   const userTotals = transactions.reduce((acc, transaction) => {
  //     const amount = parseFloat(transaction.amount);
  //     if (!acc[transaction.user_id]) {
  //       acc[transaction.user_id] = { totalAmount: 0, user: transaction.user };
  //     }
  //     acc[transaction.user_id].totalAmount += amount;
  //     return acc;
  //   }, {});

  //   // Filter users exceeding the threshold
  //   const usersExceedingThreshold = Object.values(userTotals).filter(userTotal => userTotal.totalAmount > threshold);

  //   return usersExceedingThreshold;
  // }),

  contributedPoolWeight: publicProcedure
    .input(z.object({
      contributionId: z.number()
    }))
    .query(async ({ input }) => {
      try {
        const { contributionId } = input;

        // Step 1: Fetch Contributions
        const contributions = await prisma.transaction.findMany({
          where: { contribution_id: contributionId },
          include: {
            user: {
              include: {
                wallets: true
              }
            }
          }
        });

        // Step 2: Fetch Pool Weights Data
        const response = await axios.post('https://api.coinecta.fi/stake/snapshot', [], {
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        });
        const rawResponse: IPoolWeightAPI = response.data
        const stakeData: IPoolWeightDataItem[] = rawResponse.data;

        // Prepare a Set to track unique addresses to avoid double-counting
        const uniqueAddresses = new Set();

        // Step 3: Match Contributions with Staking Data
        let totalPoolWeight = 0;
        contributions.forEach(contribution => {
          // Check and add contribution address if not already added
          if (!uniqueAddresses.has(contribution.address)) {
            const matchedStake = stakeData.find((stake) => stake.address === contribution.address);
            if (matchedStake) {
              totalPoolWeight += matchedStake.cummulativeWeight;
              uniqueAddresses.add(contribution.address);
            }
          }
          // Check and add wallet reward addresses if not already added
          contribution.user.wallets.forEach(wallet => {
            if (!uniqueAddresses.has(wallet.rewardAddress)) {
              const matchedStake = stakeData.find(stake => stake.address === wallet.rewardAddress);
              if (matchedStake) {
                totalPoolWeight += matchedStake.cummulativeWeight;
                uniqueAddresses.add(wallet.rewardAddress);
              }
            }
          });
        });

        return {
          totalPoolWeight,
          apiResponse: rawResponse
        };
      } catch (error) {
        console.error(`Error fetching pool weights`, error);
        throw new TRPCError({
          message: `An unexpected error occurred while fetching pool weights`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    })
})