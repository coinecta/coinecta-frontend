import { prisma } from '@server/prisma';
import { deleteExpiredProofs } from '@server/utils/ergoProofs';
import { verifySignature } from '@server/utils/verifyErgoSignature';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "../trpc";



export const ergoRouter = createTRPCRouter({
  initVerification: protectedProcedure
    .input(z.object({
      walletType: z.string(),
      defaultAddress: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        const { walletType, defaultAddress } = input

        deleteExpiredProofs()

        const existingProof = await prisma.ergoProof.findFirst({
          where: {
            addresses: {
              has: defaultAddress
            }
          }
        })

        if (existingProof && existingProof.status === 'VERIFIED' && existingProof.user_id === userId) {
          return ({
            status: 'warning',
            message: 'Wallet already verified'
          })
        } else if (existingProof && existingProof.user_id === userId) {
          await prisma.ergoProof.delete({
            where: {
              id: existingProof.id
            }
          });
        } else if (existingProof) {
          return ({
            status: 'error',
            message: 'Wallet already attached to another account'
          })
        }

        const verificationId = nanoid();
        const nonce = nanoid();

        const newErgoProof = await prisma.ergoProof.create({
          data: {
            user_id: userId,
            verificationId,
            nonce,
            addresses: [defaultAddress],
            status: 'PENDING',
            defaultAddress,
            walletType
          }
        });
        if (newErgoProof) {
          return {
            status: 'success',
            message: 'Verification initialized',
            verificationId,
            nonce
          };
        }
      } catch (error) {
        console.error('Error initializing verification:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          message: `An unexpected error occurred: ${error}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  initVerificationErgopay: protectedProcedure
    .input(z.object({
      walletType: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        const { walletType } = input

        deleteExpiredProofs()

        const verificationId = nanoid();
        const nonce = nanoid();

        const newErgoProof = await prisma.ergoProof.create({
          data: {
            user_id: userId,
            verificationId,
            nonce,
            status: 'INITIATED',
            walletType
          }
        });
        if (newErgoProof) {
          return {
            status: 'success',
            message: 'Verification initialized',
            verificationId,
            nonce
          };
        }
      } catch (error) {
        console.error('Error initializing verification:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          message: `An unexpected error occurred: ${error}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  verifyProof: protectedProcedure
    .input(z.object({
      signedMessage: z.string(),
      proof: z.string(),
      address: z.string(),
      addresses: z.array(z.string()),
      walletType: z.string(),
      verificationId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id
        const { signedMessage, proof, address, walletType, addresses, verificationId } = input
        const verify = verifySignature(address, signedMessage, proof, walletType)

        if (verify) {
          const update = await prisma.ergoProof.update({
            where: {
              verificationId: verificationId,
              user_id: userId
            },
            data: {
              addresses,
              status: 'VERIFIED',
              defaultAddress: address
            }
          })
          if (update) {
            return { status: 'success', message: 'Wallet verified' }
          }
        }
        else return { status: 'failed', message: 'Unable to verify signed message' }
      } catch (error) {
        console.error('Message verification error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          message: `An unexpected error occurred: ${error}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  checkProofStatus: protectedProcedure
    .input(z.object({
      verificationId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const user_id = ctx.session.user.id
      const { verificationId } = input

      try {
        const proofRequest = await prisma.ergoProof.findUnique({
          where: {
            verificationId,
            user_id
          }
        });

        if (proofRequest?.status === 'INITIATED') {
          return {
            status: 'INITIATED'
          }
        }

        if (proofRequest?.status === 'PENDING') {
          return {
            status: 'PENDING',
            defaultAddress: proofRequest.defaultAddress,
            addresses: proofRequest.addresses
          };
        }

        if (proofRequest?.status === 'SIGNED') {
          return {
            status: 'SIGNED',
            signedMessage: proofRequest.signedMessage,
            proof: proofRequest.proof
          };
        }

        if (proofRequest?.status === 'VERIFIED') {
          return {
            status: 'VERIFIED',
            signedMessage: proofRequest.signedMessage,
            proof: proofRequest.proof
          };
        }
      } catch (error) {
        console.error('Status check error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          message: `An unexpected error occurred: ${error}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  getProofForUser: protectedProcedure
    .query(async ({ ctx }) => {
      const user_id = ctx.session.user.id

      try {
        const proof = await prisma.ergoProof.findMany({
          where: {
            user_id
          }
        });

        const verifiedProofs = proof.filter(item => item.status === 'VERIFIED')

        return verifiedProofs
      } catch (error) {
        console.error('Status check error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          message: `An unexpected error occurred: ${error}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  pollTxApi: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
      verificationId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const user_id = ctx.session.user.id
      const { transactionId, verificationId } = input

      interface TransactionStatusResponse {
        num_confirmations: number;
      }

      try {
        const response = await axios.get<TransactionStatusResponse>(`https://api.cruxfinance.io/crux/tx_status/${transactionId}`, {
          headers: {
            'accept': 'application/json'
          }
        });

        if (response.data.num_confirmations >= 0) {
          const update = await prisma.ergoProof.update({
            where: {
              verificationId,
              user_id
            },
            data: {
              status: 'VERIFIED'
            }
          })
          return {
            status: 'success',
            message: `Transaction has ${response.data.num_confirmations} confirmations and has been verified in the database. `,
            data: update
          }
        } else if (response.data.num_confirmations < 0) {
          return {
            status: 'warning',
            message: `Transaction has not reached the mempool yet. `
          }
        } else {
          return {
            status: 'error',
            message: 'Unable to derive transaction info from the blockchain due to an unknown error. '
          }
        }
      } catch (error) {
        console.error('Error fetching transaction status:', error);
        if (axios.isAxiosError(error)) {
          throw new TRPCError({
            message: `Axios error: ${error.message}`,
            code: 'INTERNAL_SERVER_ERROR'
          });
        } else {
          throw new TRPCError({
            message: 'Unexpected error occurred.',
            code: 'INTERNAL_SERVER_ERROR'
          });
        }
      }
    }),
  deleteItem: protectedProcedure
    .input(z.object({
      verificationId: z.string()
    })) // Expect an object with an 'id' for deletion
    .mutation(async ({ input, ctx }) => {
      try {
        const { verificationId } = input;
        const user_id = ctx.session.user.id

        await prisma.ergoProof.delete({
          where: {
            verificationId,
            user_id
          },
        });
        return { success: true, message: 'Item deleted successfully' };
      } catch (error) {
        console.error('Error deleting item:', error);
        throw new TRPCError({
          message: `Failed to delete item`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
});