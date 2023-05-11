import "./global.module.scss";
import type { AppProps } from "next/app";
// import AppProviders from "../components/AppProviders/AppProviders";

if (typeof document === "undefined") {
  // @ts-ignore
  global.document = { querySelector: function () {} };
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
