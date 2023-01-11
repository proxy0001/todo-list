import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import {defaultTheme, SSRProvider, Provider} from '@adobe/react-spectrum';
import { api } from "../utils/api";

import "../styles/globals.css";

/**
 * @see https://react-spectrum.adobe.com/react-spectrum/ssr.html#ssr-provider
 */
const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <Provider theme={defaultTheme} locale="en-US">
          <Component {...pageProps} />
        </Provider>
      </SSRProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
