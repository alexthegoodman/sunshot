import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="spectrum spectrum--medium spectrum--light">
      <Head>
        <link
          rel="stylesheet"
          href="lib/@spectrum-css/vars/dist/spectrum-global.css"
        />
        <link
          rel="stylesheet"
          href="lib/@spectrum-css/vars/dist/spectrum-medium.css"
        />
        <link
          rel="stylesheet"
          href="lib/@spectrum-css/vars/dist/spectrum-light.css"
        />
        <link rel="stylesheet" href="lib/@spectrum-css/tokens/dist/index.css" />
        <link
          rel="stylesheet"
          href="lib/@spectrum-css/page/dist/index-vars.css"
        />
        <link
          rel="stylesheet"
          href="lib/@spectrum-css/button/dist/index-vars.css"
        />
        <link
          rel="stylesheet"
          href="lib/@spectrum-css/typography/dist/index-vars.css"
        />
        <link
          rel="stylesheet"
          href="lib/@spectrum-css/assetcard/dist/index-vars.css"
        />
      </Head>
      <body>
        <button className="spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM">
          <span className="spectrum-Button-label">Button</span>
        </button>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
