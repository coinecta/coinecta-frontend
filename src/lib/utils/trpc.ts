import type { AppRouter } from '@server/routers/_app';
import { unstable_httpBatchStreamLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env.VERCEL_URL !== "" || process.env.VERCEL_URL !== undefined)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  return `https://192.168.0.194:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/v11/ssr
     */
    return {
      /**
       * @link https://trpc.io/docs/v11/client/links
       */
      links: [
        unstable_httpBatchStreamLink({
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Set custom request headers on every request from tRPC
           * @link https://trpc.io/docs/v11/ssr
           */
          headers() {
            if (!ctx?.req?.headers) {
              return {};
            }
            // To use SSR properly, you need to forward the client's headers to the server
            // This is so you can pass through things like cookies when we're server-side rendering

            const {
              // If you're using Node 18 before 18.15.0, omit the "connection" header
              connection: _connection,
              ...headers
            } = ctx.req.headers;
            return headers;
          },
          /**
           * @link https://trpc.io/docs/v11/data-transformers
           */
          transformer: superjson,
        }),
      ],
      /**
       * @link https://tanstack.com/query/v5/docs/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/v11/ssr
   */
  ssr: false,
  /**
   * @link https://trpc.io/docs/v11/data-transformers
   */
  transformer: superjson,
});