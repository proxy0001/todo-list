import { env } from "../../env/server.mjs";
import { createTRPCContext } from "../../server/api/trpc";
import { appRouter } from "../../server/api/root";
import { createOpenApiNextHandler } from 'trpc-openapi';

// export API handler
export default createOpenApiNextHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});
