import { createTRPCRouter } from "@server/trpc";
import { contributionRouter } from "./contributions";
import { emailRouter } from "./email";
import { ergoRouter } from "./ergo";
import { evmRouter } from "./evm";
import { fileRouter } from "./file";
import { fisoRouter } from "./fisos";
import { heroRouter } from "./hero";
import { priceRouter } from "./price";
import { projectRouter } from "./project";
import { stakepoolRouter } from "./stakepools";
import { syncRouter } from "./sync";
import { tokensRouter } from "./tokens";
import { userRouter } from "./user";
import { whitelistRouter } from "./whitelist";
import { xerberusRouter } from "./xerberus";
import { vestingRouter } from "./vesting";

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
  ergo: ergoRouter,
  price: priceRouter,
  contributions: contributionRouter,
  tokens: tokensRouter,
  xerberus: xerberusRouter,
  sync: syncRouter,
  vesting: vestingRouter,
  evm: evmRouter,
  email: emailRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
