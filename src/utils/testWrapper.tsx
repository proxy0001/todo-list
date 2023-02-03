/**
 * REVIEW: [Issue] Import Node Code in Front-end Testing
 * this implementation comes from here,
 * focus on providing the providers needed to run in the front-end test environment.
 * @see https://github.com/briangwaltney/t3-testing-example/blob/main/src/utils/testWrapper.tsx
 * 
 * Because create-t3-app not have a offical way to unit test with api caller in frontend,
 * So we use a workaround that comes from here
 * @see https://github.com/trpc/trpc/discussions/3612
 * 
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact, getFetch, httpBatchLink, loggerLink } from "@trpc/react-query";
import superjson from "superjson";
import type { ReactElement } from "react";
import React from "react";
import type { AppRouter } from "../server/api/root";
import type { Session } from "next-auth";
import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { User } from "@prisma/client";

/**
 * REVIEW:
 * The implementation of fetch is missing when running,
 * so an alternative solution needs to be introduced.
 */
import fetch from "node-fetch";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const globalAny = global as any;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
globalAny.fetch = fetch;


export const testApi = createTRPCReact<AppRouter>({
  unstable_overrides: {
    useMutation: {
      async onSuccess(opts) {
        console.log('hello useMutation')
        await opts.originalFn()
        await opts.queryClient.invalidateQueries()
      },
    },
  },
})

const queryClient = new QueryClient()
const trpcClient = (session: Session | undefined) =>
  testApi.createClient({
    links: [
      loggerLink({
        enabled: (opts) => false,
        // opts.direction === "down" && opts.result instanceof Error,
      }),
      httpBatchLink({
        url: "http://localhost:3005/api/trpc",
        fetch: async (input, init?) => {
          const fetch = getFetch();
          return fetch(input, {
            ...init,
          });
        },
        ...(session ? { headers: { session: JSON.stringify(session) } } : {}),
      }),
    ],
    transformer: superjson,
  });

type TRPCTestClientProviderProps = {
  children: React.ReactNode;
  session?: Session;
}
export function TRPCTestClientProvider({ session, children }: TRPCTestClientProviderProps) {
  return (
    <testApi.Provider
      client={trpcClient(session)}
      queryClient={queryClient}
    >
      <QueryClientProvider client={ queryClient }>
        { children }
      </QueryClientProvider>
    </testApi.Provider>
  );
}

type AllTheProvidersProps = {
  children: React.ReactNode;
  session?: Session;
}
export const AllTheProviders = ({ session, children }: AllTheProvidersProps) => {
  return (
    <TRPCTestClientProvider session={ session }>
      { children }
    </TRPCTestClientProvider>
  )
}

export const createSession = (user: User): Session => ({
  user: {
    id: user.id,
  },
  expires: "2123-02-17T13:51:55.373Z",
});

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    user?: User;
  }
) => {
  const session = options?.user ? createSession(options.user) : undefined

  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} session={session} />,
    ...options,
  });
}

export const hookWrapper = (user?: User) =>
  function wrapperOptions(props: { children: React.ReactNode }) {
    const session = user ? createSession(user) : undefined
    return <AllTheProviders {...props} session={ session } />
  };

export * from "@testing-library/react"
export { customRender as render }