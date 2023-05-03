import { ipcRenderer } from "electron";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useReducer } from "react";

import styles from "./editor.module.scss";
import Tracks from "../components/Tracks/Tracks";
import Preview from "../components/Preview/Preview";
import {
  EditorContext,
  EditorContextReducer,
  EditorContextState,
} from "../context/EditorContext/EditorContext";
import EditorCtrls from "../components/EditorCtrls/EditorCtrls";
import PreviewCanvas from "../components/PreviewCanvas/PreviewCanvas";
import FabricCanvas from "../components/FabricCanvas/FabricCanvas";
import KonvaCanvas from "../components/KonvaCanvas/KonvaCanvas";

function Editor() {
  const [positions, setPositions] = React.useState(null);
  const [originalCapture, setOriginalCapture] = React.useState(null);
  const [originalCapture25, setOriginalCapture25] = React.useState(null); // 25% of original capture
  const [originalDuration, setOriginalDuration] = React.useState(null);

  useEffect(() => {
    const { mousePositions, originalCapture, originalCapture25 } =
      ipcRenderer.sendSync("get-project-data");
    console.info("project data", mousePositions, originalCapture25);

    // do not repeat save mouse positions or original capture
    // in the saved context data
    // just load it fresh, set in state, and pass via props
    // TODO: consider perf implications of setting these buffers in state

    const duration = mousePositions[mousePositions.length - 1].timestamp; // may be off by up to 100ms

    setPositions(mousePositions);
    setOriginalCapture(originalCapture);
    setOriginalCapture25(originalCapture25);
    setOriginalDuration(duration);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>SunShot = Editor</title>
      </Head>
      <EditorContext.Provider
        value={useReducer(EditorContextReducer, EditorContextState)}
      >
        <section className={styles.editor}>
          <div className={styles.editorInner}>
            <section className={styles.mainPanel}>
              <EditorCtrls
                positions={positions}
                // originalCapture={originalCapture}
                originalDuration={originalDuration}
              />
              {/* <Preview
                positions={positions}
                originalCapture={originalCapture}
              /> */}
              {/* <PreviewCanvas
                positions={positions}
                originalCapture={originalCapture}
              /> */}
              {/* <FabricCanvas
                positions={positions}
                originalCapture={originalCapture}
                originalCapture25={originalCapture25}
              /> */}
              <KonvaCanvas
                positions={positions}
                originalCapture={originalCapture}
                originalCapture25={originalCapture25}
              />
              <Tracks
                positions={positions}
                originalDuration={originalDuration}
              />
            </section>
            <aside className={styles.sidePanel}>
              <>Properties</>
            </aside>
          </div>
        </section>
      </EditorContext.Provider>
    </React.Fragment>
  );
}

export default Editor;
