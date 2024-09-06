import { sendEmail } from '@server/services/nodemailer';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc";

export const emailRouter = createTRPCRouter({
  sendEmail: publicProcedure
    .input(
      z.object({
        from: z.string().email(),
        to: z.union([z.string().email(), z.array(z.string().email())]),
        subject: z.string(),
        text: z.string(),
        html: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return sendEmail(input);
    }),
});