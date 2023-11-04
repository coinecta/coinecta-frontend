import { prisma } from '@server/prisma';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const whitelistRouter = createTRPCRouter({
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
})