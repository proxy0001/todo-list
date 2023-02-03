import { type GetServerSidePropsContext } from "next";
import type { Session } from "next-auth";
import { unstable_getServerSession } from "next-auth";

import { authOptions } from "../pages/api/auth/[...nextauth]";

/**
 * Wrapper for unstable_getServerSession, used in trpc createContext and the
 * restricted API route
 *
 * Don't worry too much about the "unstable", it's safe to use but the syntax
 * may change in future versions
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  // @see https://github.com/trpc/trpc/discussions/3612
  // @see https://github.com/briangwaltney/t3-testing-example/blob/main/src/server/auth.ts

  // In test environment, we don't want to use the real next-auth session
  // because we are not going through the login flow.
  // Instead, we use the session provided by the header.
  if (process.env.APP_ENV === "test" && ctx.req.headers.session) {
    return JSON.parse(ctx.req.headers.session as string) as Session;
  }
  return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
};
