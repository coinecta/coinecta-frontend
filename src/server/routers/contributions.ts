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
        const response = await axios.post('https://api.coinecta.fi/stake/snapshot?limit=1000', [], {
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
    }),

  getOnchainTransactions: adminProcedure
    .input(z.object({
      address: z.string(),
      contributionId: z.number()
    }))
    .query(async ({ input }) => {
      const { address, contributionId } = input;
      let combinedTransactions: CombinedTransactionInfo[] = [];
      let page = 1;

      if (address && contributionId) {
        try {
          console.log('start')
          // Fetch on-chain transactions
          let allUtxos: IOnChainUtxo[] = [];
          while (true) {
            const response = await axios.get<IOnChainUtxo[]>(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}/utxos`, {
              params: {
                count: 100,
                page: page
              },
              headers: {
                'project_id': process.env.BLOCKFROST_PROJECT_ID
              }
            });

            if (response.data.length === 0) {
              break; // Exit the loop if no more data
            }
            allUtxos = allUtxos.concat(response.data);
            page++;
          }

          // Fetch database transactions for the contribution
          const dbTransactions = await prisma.transaction.findMany({
            where: {
              contribution_id: contributionId
            }
          });

          const dbTransactionMap = new Map(dbTransactions.map(tx => [tx.txId, tx]));

          const stakeData = await fetchAllStakeData();
          const stakeDataMap = new Map(stakeData.map(item => [item.address, item]));

          for (const utxo of allUtxos) {
            const dbTransaction = dbTransactionMap.get(utxo.tx_hash);
            let txDetails: ITransactionDetails
            if (dbTransaction && dbTransaction.onChainTxData) {
              // Ensure the data is correctly parsed and structured
              txDetails = dbTransaction.onChainTxData as ITransactionDetails;
              if (!Array.isArray(txDetails.inputs)) {
                console.error('Invalid or missing inputs array in the transaction details from database');
                continue; // Skip this iteration or handle the error appropriately
              }
            }
            else {
              const checkDbTx = await prisma.newTx.findFirst({
                where: { txId: utxo.tx_hash }
              })

              if (checkDbTx) {
                txDetails = checkDbTx.onChainTxData as ITransactionDetails
              } else {
                const txDetailResponse = await axios.get<ITransactionDetails>(`https://cardano-mainnet.blockfrost.io/api/v0/txs/${utxo.tx_hash}/utxos`, {
                  headers: {
                    'project_id': process.env.BLOCKFROST_PROJECT_ID
                  }
                });
                txDetails = txDetailResponse.data;

                const newTxData = await prisma.transaction.findFirst({
                  where: { txId: utxo.tx_hash },
                });

                if (newTxData) {
                  await prisma.transaction.update({
                    where: { id: newTxData.id },
                    data: { onChainTxData: txDetails },
                  })
                } else {
                  await prisma.newTx.create({
                    data: {
                      onChainTxData: txDetails,
                      txId: utxo.tx_hash
                    }
                  })
                }

                if (!Array.isArray(txDetails.inputs)) {
                  console.error('Invalid or missing inputs array in the transaction details from API');
                  continue; // Skip this iteration or handle the error appropriately
                }
              }
            }

            let totalAdaOutputToAddress = 0;
            txDetails.outputs.forEach(output => {
              if (output.address === address) {
                totalAdaOutputToAddress += output.amount.filter(a => a.unit === "lovelace").reduce((sum, current) => sum + Number(current.quantity) * 0.000001, 0);
              }
            });

            if (totalAdaOutputToAddress > 0) { // Only consider transactions that have outputs to the specified address
              const combinedInfo = {
                address: txDetails.inputs[0].address,
                amountAda: totalAdaOutputToAddress,
                txId: utxo.tx_hash,
                userPoolWeight: stakeDataMap.get(txDetails.inputs[0].address)?.cummulativeWeight // Assuming the input address is what we're checking pool weight against
              };

              combinedTransactions.push(combinedInfo);
            }
          }

          return combinedTransactions;
        } catch (error) {
          console.error('Error fetching transactions', error);
          throw new TRPCError({
            message: 'An unexpected error occurred while fetching transactions',
            code: 'INTERNAL_SERVER_ERROR',
          });
        }
      }
      else return []
    }),
})

async function fetchAllUtxos(address: string) {
  let allUtxos: any[] = [];
  let page = 1;
  while (true) {
    const response = await axios.get<IOnChainUtxo[]>(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}/utxos`, {
      params: { count: 100, page },
      headers: { 'project_id': process.env.BLOCKFROST_PROJECT_ID }
    });
    if (response.data.length === 0) break;
    allUtxos = allUtxos.concat(response.data);
    page++;
  }
  return allUtxos;
}

async function fetchAllStakeData() {
  const response = await axios.post('https://api.coinecta.fi/stake/snapshot?limit=1000', [], {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
  return response.data.data as IPoolWeightDataItem[];
}

async function fetchTransactionDetails(utxo: IOnChainUtxo, dbTransactionMap: Map<string, any>) {
  let txDetails: ITransactionDetails;
  const dbTransaction = dbTransactionMap.get(utxo.tx_hash);
  if (dbTransaction && dbTransaction.onChainTxData) {
    txDetails = dbTransaction.onChainTxData as ITransactionDetails;
  } else {
    const response = await axios.get<ITransactionDetails>(`https://cardano-mainnet.blockfrost.io/api/v0/txs/${utxo.tx_hash}/utxos`, {
      headers: { 'project_id': process.env.BLOCKFROST_PROJECT_ID }
    });
    txDetails = response.data;
    // Optionally update the transaction with onChainTxData if needed
  }
  return txDetails;
}