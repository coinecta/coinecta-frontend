import { createTRPCRouter } from "@server/trpc";
import { ergoRouter } from "./ergo";
import { fileRouter } from "./file";
import { fisoRouter } from "./fisos";
import { heroRouter } from "./hero";
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
  fisos: fisoRouter,
  hero: heroRouter,
  ergo: ergoRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;