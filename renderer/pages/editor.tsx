import { ipcRenderer } from "electron";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect } from "react";

import styles from "./editor.module.scss";
import Tracks from "../components/Tracks/Tracks";
import Preview from "../components/Preview/Preview";

function Editor() {
  const [positions, setPositions] = React.useState(null);
  const [originalCapture, setOriginalCapture] = React.useState(null);

  useEffect(() => {
    const { mousePositions, originalCapture } =
      ipcRenderer.sendSync("get-project-data");
    console.info("project data", mousePositions, originalCapture);

    // do not repeat save mouse positions or original capture
    // in the saved context data
    // just load it fresh, set in state, and pass via props
    // TODO: consider perf implications of setting these buffers in state

    setPositions(mousePositions);
    setOriginalCapture(originalCapture);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>SunShot = Editor</title>
      </Head>
      <section className={styles.editor}>
        <div className={styles.editorInner}>
          <section className={styles.mainPanel}>
            <Preview positions={positions} originalCapture={originalCapture} />
            <Tracks />
          </section>
          <aside className={styles.sidePanel}>
            <>Properties</>
          </aside>
        </div>
      </section>
    </React.Fragment>
  );
}

export default Editor;
