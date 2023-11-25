import { ZContributionRound } from '@lib/types/zod-schemas/contributionSchema';
import { prisma } from '@server/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

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
})