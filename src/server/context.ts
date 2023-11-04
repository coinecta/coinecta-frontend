// import { prisma } from '@server/prisma';
// import * as trpc from '@trpc/server';
// import * as trpcNext from '@trpc/server/adapters/next';
// import { getSession } from 'next-auth/react';

// // create context based off incoming request
// export const createContext = async (
//   opts?: trpcNext.CreateNextContextOptions,
// ) => {
//   const session = opts?.req ? await getSession({ req: opts.req }) : null;
//   return {
//     session,
//     prisma,
//     user: prisma.user,
//   };
// };

// export type Context = trpc.inferAsyncReturnType<typeof createContext>