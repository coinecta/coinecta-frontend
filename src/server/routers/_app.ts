import { createTRPCRouter } from "@server/trpc";
import { fileRouter } from "./file";
import { fisoRouter } from "./fisos";
import { projectRouter } from "./project";
import { stakepoolRouter } from "./stakepools";
import { userRouter } from "./user";
import { whitelistRouter } from "./whitelist";

/**
 * This is the primary router for the server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  project: projectRouter,
  file: fileRouter,
  whitelist: whitelistRouter,
  stakepool: stakepoolRouter,
  fisos: fisoRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;