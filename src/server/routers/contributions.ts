import { ZContributionRound } from "@lib/types/zod-schemas/contributionSchema";
import { prisma } from "@server/prisma";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

export const contributionRouter = createTRPCRouter({
  addContributionRound: adminProcedure
    .input(ZContributionRound.omit({ id: true })) // Exclude 'id' for creation as it's auto-generated
    .mutation(async ({ input }) => {
      try {
        const newRound = await prisma.contributionRound.create({
          data: {
            ...input,
            acceptedCurrencies: {
              create:
                input.acceptedCurrencies.map(
                  ({ id, contributionRoundId, ...currencyData }) => currencyData
                ) || [],
            },
          },
        });
        return newRound;
      } catch (error) {
        console.error("Error creating contribution round:", error);
        throw new TRPCError({
          message: "Failed to create new contribution round",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  updateContributionRound: adminProcedure
    .input(ZContributionRound.extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id, acceptedCurrencies, ...data } = input;
      try {
        const updatedRound = await prisma.contributionRound.update({
          where: { id },
          data: {
            ...data,
            acceptedCurrencies: {
              deleteMany: {},
              create: acceptedCurrencies.map(
                ({ id, contributionRoundId, ...currencyData }) => currencyData
              ),
            },
          },
          include: { acceptedCurrencies: true },
        });

        return updatedRound;
      } catch (error) {
        console.error("Error updating contribution round:", error);
        throw new TRPCError({
          message: `Failed to update contribution round with id ${id}`,
          code: "INTERNAL_SERVER_ERROR",
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
        return {
          success: true,
          message: "Contribution round deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting contribution round:", error);
        throw new TRPCError({
          message: `Failed to delete contribution round with id ${input.id}`,
          code: "INTERNAL_SERVER_ERROR",
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
          orderBy: { startDate: "asc" },
          include: { acceptedCurrencies: true },
        });
        return rounds;
      } catch (error) {
        console.error(
          `Error fetching contribution rounds for projectSlug ${input.projectSlug}:`,
          error
        );
        throw new TRPCError({
          message: `An unexpected error occurred while fetching contribution rounds for projectSlug ${input.projectSlug}`,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  createTransaction: protectedProcedure
    .input(
      z.object({
        description: z.string().optional(),
        blockchain: z.string(),
        adaReceiveAddress: z.string(),
        exchangeRate: z.number(),
        amount: z.string(),
        currency: z.string(),
        address: z.string(),
        txId: z.string().optional(),
        contributionId: z.number(),
        referralCode: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const {
        adaReceiveAddress,
        referralCode,
        blockchain,
        address,
        currency,
        amount,
        description,
        txId,
        exchangeRate,
      } = input;

      try {
        const newTransaction = await prisma.transaction.create({
          data: {
            description,
            amount,
            currency,
            address,
            blockchain,
            adaReceiveAddress,
            exchangeRate: exchangeRate.toString(),
            txId,
            user_id: userId,
            contribution_id: input.contributionId,
            referralCode,
          },
        });

        await prisma.contributionRound.update({
          where: {
            id: input.contributionId,
          },
          data: {
            deposited: {
              increment: Number(amount) / exchangeRate,
            },
          },
        });

        return newTransaction;
      } catch (error) {
        console.error(`Error creating transaction:`, error);
        throw new TRPCError({
          message: `An unexpected error occurred while creating the transaction`,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  sumTransactions: protectedProcedure
    .input(
      z.object({
        contributionId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const transactions = await prisma.transaction.findMany({
        where: {
          contribution_id: input.contributionId,
          user_id: userId,
        },
        select: {
          amount: true,
          blockchain: true,
          currency: true,
        },
      });

      const totals: { amount: number; blockchain: string; currency: string }[] =
        [];

      for (const tx of transactions) {
        const existingTotal = totals.find(
          (t) => t.blockchain === tx.blockchain && t.currency === tx.currency
        );
        if (existingTotal) {
          existingTotal.amount += parseFloat(tx.amount);
        } else {
          totals.push({
            amount: parseFloat(tx.amount),
            blockchain: tx.blockchain || "Cardano",
            currency: tx.currency,
          });
        }
      }

      return totals.map((total) => ({
        ...total,
        amount: Number(total.amount.toFixed(2)),
      }));
    }),

  listTransactionsByContribution: adminProcedure
    .input(
      z.object({
        contributionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { contributionId } = input;
      const transactions = await prisma.transaction.findMany({
        where: {
          contribution_id: contributionId,
        },
        include: {
          user: {
            select: {
              defaultAddress: true,
              sumsubId: true,
              sumsubResult: true,
            },
          },
        },
      });
      return transactions.map((transaction) => ({
        ...transaction,
        userDefaultAddress: transaction.user?.defaultAddress,
        userSumsubId: transaction.user?.sumsubId,
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
    .input(
      z.object({
        contributionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { contributionId } = input;

        // Step 1: Fetch Contributions
        const contributions = await prisma.transaction.findMany({
          where: { contribution_id: contributionId },
          include: {
            user: {
              include: {
                wallets: true,
              },
            },
          },
        });

        // Step 2: Fetch Pool Weights Data
        const response = await axios.post(
          "https://api.coinecta.fi/stake/snapshot?limit=1000",
          [],
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );
        const rawResponse: IPoolWeightAPI = response.data;
        const stakeData: IPoolWeightDataItem[] = rawResponse.data;

        // Prepare a Set to track unique addresses to avoid double-counting
        const uniqueAddresses = new Set();

        // Step 3: Match Contributions with Staking Data
        let totalPoolWeight = 0;
        contributions.forEach((contribution) => {
          // Check and add contribution address if not already added
          if (!uniqueAddresses.has(contribution.address)) {
            const matchedStake = stakeData.find(
              (stake) => stake.address === contribution.address
            );
            if (matchedStake) {
              totalPoolWeight += matchedStake.cummulativeWeight;
              uniqueAddresses.add(contribution.address);
            }
          }
          // Check and add wallet reward addresses if not already added
          contribution.user.wallets.forEach((wallet) => {
            if (!uniqueAddresses.has(wallet.rewardAddress)) {
              const matchedStake = stakeData.find(
                (stake) => stake.address === wallet.rewardAddress
              );
              if (matchedStake) {
                totalPoolWeight += matchedStake.cummulativeWeight;
                uniqueAddresses.add(wallet.rewardAddress);
              }
            }
          });
        });

        return {
          totalPoolWeight,
          apiResponse: rawResponse,
        };
      } catch (error) {
        console.error(`Error fetching pool weights`, error);
        throw new TRPCError({
          message: `An unexpected error occurred while fetching pool weights`,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  getOnchainTransactions: adminProcedure
    .input(
      z.object({
        contributionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { contributionId } = input;
      const combinedTransactions: CombinedTransactionInfo[] = [];

      const stakeData = await fetchAllStakeData();
      const stakeDataMap = new Map(
        stakeData.map((item) => [item.address, item])
      );

      const acceptedCurrencies = await prisma.acceptedCurrency.findMany({
        where: {
          contributionRoundId: contributionId,
        },
      });

      // BASE TX
      const baseTxMap = await Promise.all(
        acceptedCurrencies
          .filter((acc) => acc.blockchain === "Base")
          .map((acc) => acc.receiveAddress)
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((address) => getBaseTransactions(address))
      );
      const baseTxns = baseTxMap.flatMap((x) => x);

      baseTxns.forEach(async (t) => {
        const newTxData = await prisma.transaction.findFirst({
          where: { txId: t.hash },
        });

        if (newTxData) {
          await prisma.transaction.update({
            where: { id: newTxData.id },
            data: { onChainTxData: t },
          });
        } else {
          await prisma.newTx.create({
            data: {
              onChainTxData: t,
              txId: t.hash,
            },
          });
        }
      });

      // Fetch database transactions for the contribution
      const dbTransactions = await prisma.transaction.findMany({
        where: {
          contribution_id: contributionId,
        },
      });
      const dbTransactionMap = new Map(
        dbTransactions.map((tx) => [tx.txId, tx])
      );

      const baseCombinedInfo = dbTransactions
        .filter((t) => baseTxns.map((t) => t.hash).includes(t.txId ?? ""))
        .map((t) => {
          const txDetails = t.onChainTxData as IBaseTokenTransaction;
          return {
            address: txDetails.from,
            adaReceiveAddress: t.adaReceiveAddress ?? "unavailable",
            amount:
              Number(txDetails.value) /
              Math.pow(10, Number(txDetails.tokenDecimal)),
            currency: t.currency,
            blockchain: t.blockchain ?? "Base",
            exchangeRate: Number(t.exchangeRate),
            txId: t.txId ?? "unavailable",
            userPoolWeight: stakeDataMap.get(txDetails.from)?.cummulativeWeight, // Assuming the input address is what we're checking pool weight against
          };
        });

      combinedTransactions.push(...baseCombinedInfo);

      const adaAddresses = acceptedCurrencies
        .filter((acc) => acc.blockchain === "Cardano")
        .map((acc) => acc.receiveAddress)
        .filter((v, i, a) => a.indexOf(v) === i);

      if (adaAddresses.length >= 1) {
        try {
          // Fetch on-chain transactions
          const allUtxos: IOnChainUtxo[] = (await Promise.all(adaAddresses.map(async (address) => {
            let page = 1;
            const utxos = [];
            while (true) {
              const response = await axios.get<IOnChainUtxo[]>(
                `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}/utxos`,
                {
                  params: {
                    count: 100,
                    page: page,
                  },
                  headers: {
                    project_id: process.env.BLOCKFROST_PROJECT_ID,
                  },
                }
              );

              if (response.data.length === 0) {
                return utxos;
              }

              utxos.push(...response.data);
              page++;
            }
          }))).flatMap(x => x);

          for (const utxo of allUtxos) {
            const dbTransaction = dbTransactionMap.get(utxo.tx_hash);
            let txDetails: ITransactionDetails;
            if (dbTransaction && dbTransaction.onChainTxData) {
              // We have already processed the transaction
              // Ensure the data is correctly parsed and structured
              txDetails = dbTransaction.onChainTxData as ITransactionDetails;
              if (!Array.isArray(txDetails.inputs)) {
                console.error(
                  "Invalid or missing inputs array in the transaction details from database"
                );
                continue; // Skip this iteration or handle the error appropriately
              }
            } else {
              const checkDbTx = await prisma.newTx.findFirst({
                where: { txId: utxo.tx_hash },
              });

              if (checkDbTx) {
                txDetails = checkDbTx.onChainTxData as ITransactionDetails;
              } else {
                const txDetailResponse = await axios.get<ITransactionDetails>(
                  `https://cardano-mainnet.blockfrost.io/api/v0/txs/${utxo.tx_hash}/utxos`,
                  {
                    headers: {
                      project_id: process.env.BLOCKFROST_PROJECT_ID,
                    },
                  }
                );
                txDetails = txDetailResponse.data;

                const newTxData = await prisma.transaction.findFirst({
                  where: { txId: utxo.tx_hash },
                });

                if (newTxData) {
                  await prisma.transaction.update({
                    where: { id: newTxData.id },
                    data: { onChainTxData: txDetails },
                  });
                } else {
                  await prisma.newTx.create({
                    data: {
                      onChainTxData: txDetails,
                      txId: utxo.tx_hash,
                    },
                  });
                }

                if (!Array.isArray(txDetails.inputs)) {
                  console.error(
                    "Invalid or missing inputs array in the transaction details from API"
                  );
                  continue; // Skip this iteration or handle the error appropriately
                }
              }
            }

            const totalAdaOutputToAddress = txDetails.outputs
              .filter((output) => adaAddresses.includes(output.address))
              .map((output) =>
                output.amount
                  .filter((a) => a.unit === "lovelace")
                  .reduce(
                    (sum, current) => sum + Number(current.quantity) * 0.000001,
                    0
                  )
              )
              .reduce((a, c) => a + c, 0).toFixed(6);

            const totalUSDMOutputToAddress = txDetails.outputs
              .filter((output) => adaAddresses.includes(output.address))
              .map((output) =>
                output.amount
                  .filter(
                    (a) =>
                      a.unit ===
                      "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d" // USDM
                  )
                  .reduce(
                    (sum, current) => sum + Number(current.quantity) * 0.000001,
                    0
                  )
              )
              .reduce((a, c) => a + c, 0).toFixed(6);

            if (Number(totalAdaOutputToAddress) > 0) {
              // Only consider transactions that have outputs to the specified address
              const combinedInfo = {
                address: txDetails.inputs[0].address,
                adaReceiveAddress: txDetails.inputs[0].address,
                amount: Number(totalAdaOutputToAddress),
                currency: dbTransactionMap.get(utxo.tx_hash)?.currency ?? "ADA",
                exchangeRate: Number(dbTransactionMap.get(utxo.tx_hash)?.exchangeRate),
                blockchain: dbTransactionMap.get(utxo.tx_hash)?.blockchain ?? "Cardano",
                txId: utxo.tx_hash,
                userPoolWeight: stakeDataMap.get(txDetails.inputs[0].address)
                  ?.cummulativeWeight, // Assuming the input address is what we're checking pool weight against
              };

              combinedTransactions.push(combinedInfo);
            }

            if (Number(totalUSDMOutputToAddress) > 0) {
              // Only consider transactions that have outputs to the specified address
              const combinedInfo = {
                address: txDetails.inputs[0].address,
                adaReceiveAddress: txDetails.inputs[0].address,
                amount: Number(totalUSDMOutputToAddress),
                currency: dbTransactionMap.get(utxo.tx_hash)?.currency ?? "USDM",
                exchangeRate: Number(dbTransactionMap.get(utxo.tx_hash)?.exchangeRate),
                blockchain: dbTransactionMap.get(utxo.tx_hash)?.blockchain ?? "Cardano",
                txId: utxo.tx_hash,
                userPoolWeight: stakeDataMap.get(txDetails.inputs[0].address)
                  ?.cummulativeWeight, // Assuming the input address is what we're checking pool weight against
              };

              combinedTransactions.push(combinedInfo);
            }
          }

          return combinedTransactions;
        } catch (error) {
          console.error("Error fetching transactions", error);
          throw new TRPCError({
            message: "An unexpected error occurred while fetching transactions",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      } else return combinedTransactions;
    }),
});

async function fetchAllStakeData() {
  const response = await axios.post(
    "https://api.coinecta.fi/stake/snapshot?limit=1000",
    [],
    {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  );
  return response.data.data as IPoolWeightDataItem[];
}

interface IBaseTokenTransaction {
  [key: string]: string;
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

const getBaseTransactions = async (address: string) => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const txIds: IBaseTokenTransaction[] = [];
  let page = 1;
  while (true) {
    try {
      const response = await axios.get<any>(
        `https://api.basescan.org/api?module=account&action=tokentx&address=${address}&page=${page}&offset=1000&sort=asc&apikey=${process.env.BASE_API_KEY}`
      );
      const tx = response.data.result;
      if (tx.length === 0) {
        return txIds;
      }
      txIds.push(...tx);
    } catch {
      throw new Error("Unexpected Error from Base");
    }
    page += 1;
    await delay(200);
  }
};
