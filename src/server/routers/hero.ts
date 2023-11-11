import { ZHeroCarousel } from '@lib/types/zod-schemas/heroSchema';
import { prisma } from '@server/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const heroRouter = createTRPCRouter({
  addHeroItem: adminProcedure
    .input(ZHeroCarousel.omit({ id: true })) // Exclude 'id' for creation as it's auto-generated
    .mutation(async ({ input }) => {
      try {
        const newItem = await prisma.heroCarousel.create({
          data: input,
        });
        return newItem;
      } catch (error) {
        console.error('Error creating hero carousel item:', error);
        throw new TRPCError({
          message: 'Failed to create new hero carousel item',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  updateHeroItem: adminProcedure
    .input(ZHeroCarousel.extend({ id: z.number() })) // Include 'id' for updates
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (typeof id === 'undefined') {
        throw new TRPCError({
          message: 'An id is required to update an item',
          code: 'BAD_REQUEST',
        });
      }
      try {
        const updatedItem = await prisma.heroCarousel.update({
          where: { id: id },
          data: data,
        });
        return updatedItem;
      } catch (error) {
        console.error('Error updating hero carousel item:', error);
        throw new TRPCError({
          message: `Failed to update hero carousel item with id ${id}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  deleteHeroItem: adminProcedure
    .input(z.object({ id: z.number() })) // Expect an object with an 'id' for deletion
    .mutation(async ({ input }) => {
      try {
        const { id } = input;
        await prisma.heroCarousel.delete({
          where: { id: id },
        });
        return { success: true, message: 'Item deleted successfully' };
      } catch (error) {
        console.error('Error deleting hero carousel item:', error);
        throw new TRPCError({
          message: `Failed to delete hero carousel item with id ${input.id}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  reorderHeroItems: adminProcedure
    .input(z.array(z.number())) // Input is an array of ids in the new order
    .mutation(async ({ input }) => {
      const transaction = input.map((id, index) => {
        return prisma.heroCarousel.update({
          where: { id: id },
          data: { order: index }, // 'index' is the new order
        });
      });

      try {
        await prisma.$transaction(transaction);
        return { success: true, message: 'Items reordered successfully' };
      } catch (error) {
        console.error('Error reordering hero carousel items:', error);
        throw new TRPCError({
          message: 'Failed to reorder hero carousel items',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  getHeroItems: publicProcedure
    .query(async () => {
      try {
        const items: THeroCarousel[] = await prisma.heroCarousel.findMany({
          orderBy: { order: 'asc' }
        });

        const assertedItems = items.map((item) => ({
          ...item,
          id: item.id as number,
          order: item.order as number,
        }));

        return assertedItems;
      } catch (error) {
        console.error('Error fetching hero items:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          message: 'An unexpected error occurred while fetching hero items',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
});