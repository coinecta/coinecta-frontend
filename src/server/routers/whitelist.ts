import { prisma } from '@server/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const whitelistRouter = createTRPCRouter({
  getNumUsers: adminProcedure
    .query(async () => {
      const totalUsers = await prisma.user.count();
      return totalUsers
    }),
  getNumSignups: adminProcedure
    .query(async () => {
      const counts = await prisma.whitelistSignup.groupBy({
        by: ['whitelist_slug'],
        _count: {
          whitelist_slug: true,
        },
      });
      return counts;
    }),
  listWhitelists: adminProcedure
    .query(async () => {
      const whitelists = await prisma.whitelist.findMany();
      return whitelists
    }),
  listProjectWhitelists: adminProcedure
    .input(z.object({
      projectSlug: z.string()
    }))
    .query(async ({ input }) => {
      const { projectSlug } = input
      const whitelists = await prisma.whitelist.findMany({
        where: {
          project_slug: projectSlug
        }
      });
      return whitelists
    }),
  submitWhitelist: protectedProcedure
    .input(z.object({
      whitelistSlug: z.string(),
      amountRequested: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!input.whitelistSlug) {
        return {
          status: 'error',
          data: undefined,
          message: 'Whitelist slug not provided'
        }
      }
      if (!input.amountRequested) {
        return {
          status: 'error',
          data: undefined,
          message: 'Please enter requested amount'
        }
      }

      // First, check if the user has already signed up for this whitelist
      const existingSignup = await prisma.whitelistSignup.findFirst({
        where: {
          user_id: ctx.session.user.id,
          whitelist_slug: input.whitelistSlug,
        },
      });

      if (existingSignup) {
        return {
          status: 'error',
          message: 'You have already signed up for this whitelist',
          data: null,
        };
      }

      try {

        const signup = await prisma.whitelistSignup.create({
          data: {
            whitelist: {
              connect: { slug: input.whitelistSlug }
            },
            user: {
              connect: { id: ctx.session.user.id }
            },
            amountRequested: input.amountRequested
          }
        });

        return {
          status: 'success',
          message: 'Successfully signed up for whitelist',
          data: signup
        };
      } catch (error: any) {
        return {
          status: 'error',
          message: 'Unexpected error',
          data: error
        }
      }
    }),
  getUserWhitelistSlugs: protectedProcedure
    .input(z.object({
      projectSlug: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const projectSlug = input.projectSlug

      if (!ctx.session.user) {
        return {
          status: 'error',
          message: 'You must be signed in to do this',
          code: 'UNAUTHORIZED',
          data: undefined
        }
      }

      if (ctx.session.user.id !== userId) {
        return {
          status: 'error',
          message: 'You can only fetch your own whitelists',
          code: 'FORBIDDEN',
          data: undefined
        }
      }

      try {
        const userWhitelists = await prisma.whitelistSignup.findMany({
          where: {
            user_id: userId,
            whitelist: projectSlug ? {
              project: {
                slug: projectSlug
              }
            } : undefined
          },
          select: {
            whitelist: {
              select: {
                slug: true,
              },
            },
          },
        });

        const whitelistSlugs: string[] = userWhitelists.map(whitelistSignup => whitelistSignup.whitelist.slug);

        return {
          status: 'success',
          message: 'Successfully retrieved whitelists',
          data: whitelistSlugs
        }
      } catch (error) {
        return {
          status: 'error',
          message: 'An error occurred while fetching the whitelists',
          code: 'INTERNAL_SERVER_ERROR',
          error: error
        }
      }
    }),
  getSumsubId: adminProcedure
    .input(z.object({
      changeAddress: z.string().optional(),
      rewardAddress: z.string().optional()
    }))
    .query(async ({ input }) => {
      const { changeAddress, rewardAddress } = input

      const orConditions = [];

      // Add conditions to the array only if the addresses are provided
      if (changeAddress) {
        orConditions.push({ defaultAddress: changeAddress });
      }
      if (rewardAddress) {
        orConditions.push({ rewardAddress: rewardAddress });
      }

      try {
        const sumsub = await prisma.user.findFirst({
          where: {
            OR: orConditions
          }
        });

        if (sumsub) {
          return sumsub
        }
        else {
          throw new TRPCError({
            message: 'Unable to retrieve user',
            code: 'NOT_FOUND'
          })
        }
      } catch (error) {
        throw new TRPCError({
          message: `Error: ${error}`,
          code: "INTERNAL_SERVER_ERROR"
        })
      }
    }),
})