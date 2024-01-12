import { prisma } from '@server/prisma';
import { deleteEmptyUser } from '@server/utils/deleteEmptyUser';
import { generateNonceForLogin } from '@server/utils/nonce';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

// const isErgoMainnetAddress = (value: string): boolean => {
//   const base58Chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
//   return value.startsWith('9') &&
//     value.length === 51 &&
//     [...value].every(char => base58Chars.includes(char));
// };

type SumsubResultType = {
  reviewAnswer: string;
  rejectLabels?: string[];
  reviewRejectType?: string;
  clientComment?: string;
  moderationComment?: string;
  buttonIds?: string[];
};

export const userRouter = createTRPCRouter({
  getNonce: publicProcedure
    .input(z.object({
      rewardAddress: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { rewardAddress } = input;

      if (!rewardAddress) {
        return { nonce: null };
      }

      const nonce = await generateNonceForLogin(rewardAddress);

      if (!nonce) {
        throw new Error('Address already in use by another user account')
      }

      return { nonce };
    }),
  getWallets: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          wallets: true,
        },
      })
      return user
    }),
  changeDefaultAddress: protectedProcedure
    .input(z.object({
      newDefault: z.string(),
      walletId: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const { newDefault, walletId } = input

      // Fetch the wallet's associated addresses
      const wallet = await prisma.wallet.findUnique({
        where: {
          id: walletId,
          user_id: userId
        },
        select: {
          changeAddress: true,
          unusedAddresses: true,
          usedAddresses: true
        }
      });

      if (!wallet) {
        throw new Error("Wallet does not match user");
      }

      // Combine all the addresses associated with the wallet
      const allWalletAddresses = [wallet.changeAddress, ...wallet.unusedAddresses, ...wallet.usedAddresses];

      // Fetch the user's current default address
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          defaultAddress: true
        }
      });

      // If the user's default address is in the list of all wallet addresses, update it to the new address
      if (user!.defaultAddress && allWalletAddresses.includes(user!.defaultAddress)) {
        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            defaultAddress: newDefault
          }
        });
      }

      // Update the wallet's change address
      await prisma.wallet.update({
        where: {
          id: walletId,
          user_id: userId
        },
        data: {
          changeAddress: newDefault
        }
      });

      return { success: true }
    }),
  // Change the default user address. This is used so the user can specify which wallet will send a transaction
  // Note: the user can login with any wallet, so change Login address is not the best name
  changeLoginAddress: protectedProcedure
    .input(z.object({
      changeAddress: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const { changeAddress } = input;

      // Verify that the provided changeAddress belongs to a wallet of the current user
      const wallet = await prisma.wallet.findFirst({
        where: {
          changeAddress: changeAddress,
          user_id: userId
        },
        select: {
          id: true // just selecting id for brevity; we just want to know if a record exists
        }
      });

      if (!wallet) {
        throw new Error("The provided address does not belong to any of the user's wallets");
      }

      // Update the user's defaultAddress with the provided changeAddress
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          defaultAddress: changeAddress
        }
      });

      return { success: true }
    }),
  addWallet: protectedProcedure
    .input(z.object({
      changeAddress: z.string(),
      rewardAddress: z.string(),
      unusedAddresses: z.array(z.string()),
      usedAddresses: z.array(z.string()),
      type: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // Check if a wallet with the same details is already linked to this user
      const existingWallet = await prisma.wallet.findFirst({
        where: {
          user_id: userId,
          rewardAddress: input.rewardAddress,
        }
      });

      if (existingWallet) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This wallet is already added."
        });
      }

      // Create the new wallet record
      const newWallet = await prisma.wallet.create({
        data: {
          user_id: userId,
          type: input.type,
          changeAddress: input.changeAddress,
          rewardAddress: input.rewardAddress,
          unusedAddresses: input.unusedAddresses,
          usedAddresses: input.usedAddresses,
        }
      });

      if (!newWallet) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to add the wallet. "
        });
      }

      return newWallet.id;
    }),
  removeWallet: protectedProcedure
    .input(z.object({
      walletId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const userAddress = ctx.session.user.address;
      const walletId = input.walletId;

      // check if wallet belongs to this user
      const wallet = await prisma.wallet.findUnique({
        where: {
          id: walletId,
          user_id: userId
        }
      });

      if (!wallet) {
        throw new Error("Wallet not found or doesn't belong to this user");
      }

      // Check if userAddress exists in any of the address fields of the fetched wallet
      if (userAddress && wallet.changeAddress !== userAddress
        && !wallet.unusedAddresses.includes(userAddress)
        && !wallet.usedAddresses.includes(userAddress)) {
        // Attempt to delete the wallet
        const deleteResponse = await prisma.wallet.delete({
          where: {
            id: walletId,
          }
        });
        if (!deleteResponse) {
          throw new Error("Error removing this wallet")
        }
        return { success: true }; // Return a success response or any other relevant data
      }
      else throw new Error("Cannot delete: wallet is currently the default address for this user");
    }),
  getSumsubResult: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // Fetch the user from the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          sumsubId: true,
          sumsubType: true,
          sumsubResult: true,
          sumsubStatus: true,
        },
      });

      if (!user) {
        throw new Error('Unable to retrieve user data');
      }

      const sumsubResult: SumsubResultType = user.sumsubResult as SumsubResultType;

      return {
        sumsubId: user.sumsubId,
        sumsubType: user.sumsubType,
        sumsubResult: sumsubResult,
        sumsubStatus: user.sumsubStatus,
      };
    }),
  refetchSumsubResult: protectedProcedure
    .mutation(async ({ ctx }) => {
      const appToken = process.env.SUMSUB_TOKEN!;
      const secretKey = process.env.SUMSUB_SECRET_KEY!;
      const userId = ctx.session.user.id

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          sumsubId: true,
        },
      });

      if (user) {
        try {
          // Generate the signature
          const requestUrl = 'https://api.sumsub.com'
          const requestPath = `/resources/applicants/${user.sumsubId}/status`;
          const requestMethod = 'GET';
          const timestamp = Math.floor(Date.now() / 1000).toString();
          const hmac = crypto.createHmac('sha256', secretKey);
          hmac.update(timestamp + requestMethod.toUpperCase() + requestPath);
          const signature = hmac.digest('hex');

          const apiUrl = requestUrl + requestPath;
          const requestOptions = {
            method: requestMethod,
            headers: {
              'Accept': 'application/json',
              'X-App-Token': appToken,
              'X-App-Access-Sig': signature,
              'X-App-Access-Ts': timestamp,
            },
            // Add any request payload here (if applicable)
            // body: JSON.stringify({}),
          };

          const response = await fetch(apiUrl, requestOptions);

          console.log('Status code:', response.status);

          const data = await response.json();
          console.log('Response body:', data);

          if (!response.ok) {
            throw new TRPCError({ message: 'Response not OK', code: 'INTERNAL_SERVER_ERROR' });
          }

          const update = await prisma.user.update({
            where: { id: userId },
            data: {
              sumsubResult: data.reviewResult
            }
          });

          return update
        } catch (error) {
          console.error('Error generating access token:', error);
          throw new TRPCError({
            message: 'Unexptected error occured',
            code: 'INTERNAL_SERVER_ERROR',
          });
        }
      }
    }),
  getUserDetails: protectedProcedure
    .input(z.object({
      name: z.boolean().optional(),
      email: z.boolean().optional(),
      whitelists: z.boolean().optional(),
      wallets: z.boolean().optional(),
      image: z.boolean().optional(),
      sumsubResult: z.boolean().optional()
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const { name, email, whitelists, wallets, image, sumsubResult } = input
      const user = await prisma.user.findFirst({
        where: { id: userId },
        select: {
          name: !!name,
          email: !!email,
          image: !!image,
          sumsubResult: !!sumsubResult,
          wallets: !!wallets,
          whitelists: !!whitelists
        },
      });

      if (!user) {
        throw new TRPCError({
          message: 'Unable to find user in database',
          code: 'NOT_FOUND',
        });
      }

      return { user }
    }),
  changeUserDetails: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      whitelist: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const { name, email, whitelist } = input;

      // Prepare the data object for the update
      const updateData: any = {};

      // Conditionally add fields to the updateData object
      if (name) {
        updateData.name = name;
      }

      if (email) {
        updateData.email = email;
      }

      // If whitelist is provided, add it to the whitelists array
      if (whitelist) {
        updateData.whitelists = {
          push: whitelist
        };
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      if (!updatedUser) {
        throw new Error('Error updating user profile');
      }

      return { success: true }
    }),
  deleteEmptyUser: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      const deleteUser = await deleteEmptyUser(input.userId)
      if (deleteUser.success) return { success: true }
      else return { error: deleteUser.error }
    }),
  deleteUserAccount: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // clear all wallets associated with the user
      await prisma.wallet.deleteMany({
        where: {
          user_id: userId
        }
      });

      const deleteUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          status: 'deleted',
          defaultAddress: '',
        }
      });
      if (!deleteUser) {
        throw new Error("Error deleting user")
      }
      return { success: true }; // Return a success response or any other relevant data
    })
});