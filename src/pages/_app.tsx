import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import "../styles/globals.css";
import { trpc } from "../utils/trpc";

import ToastWrapper from "@/components/ui/ToastWrapper";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import AuthWrapper from "@/components/AuthWrapper";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{ session: Session }> & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <SessionProvider
      session={pageProps.session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      <Head>
        <title>Grove</title>
      </Head>
      <AuthWrapper>
        {getLayout(<Component {...pageProps} />)}
      </AuthWrapper>
      <ToastWrapper />
    </SessionProvider>
  );
}

export default trpc.withTRPC(MyApp);
