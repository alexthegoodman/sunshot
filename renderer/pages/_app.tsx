import "./global.module.scss";
import type { AppProps } from "next/app";
// import AppProviders from "../components/AppProviders/AppProviders";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
