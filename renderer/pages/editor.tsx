import { ipcRenderer } from "electron";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useReducer } from "react";

import styles from "./editor.module.scss";
import Tracks from "../components/Tracks/Tracks";
import {
  EditorContext,
  EditorContextReducer,
  EditorContextState,
} from "../context/EditorContext/EditorContext";
import EditorCtrls from "../components/EditorCtrls/EditorCtrls";
import KonvaCanvas from "../components/KonvaCanvas/KonvaCanvas";
import Properties from "../components/Properties/Properties";
import NoSSRCanvas from "../components/NoSSRCanvas/NoSSRCanvas";
import Script from "next/script";
import NoSSRTracks from "../components/NoSSRTracks/NoSSRTracks";
import SunCanvas from "../components/SunCanvas/SunCanvas";
import NoSSRSun from "../components/NoSSRSun/NoSSRSun";
import NoSSRCanvas2 from "../components/NoSSRCanvas2/NoSSRCanvas2";

function Editor() {
  const [projectId, setProjectId] = React.useState(null);
  const [positions, setPositions] = React.useState(null);
  const [originalCapture, setOriginalCapture] = React.useState(null);
  const [originalDuration, setOriginalDuration] = React.useState(null);
  const [sourceData, setSourceData] = React.useState(null);
  const [resolution, setResolution] = React.useState(null);

  useEffect(() => {
    const {
      currentProjectId,
      mousePositions,
      originalCapture,
      sourceData,
      resolution,
    } = ipcRenderer.sendSync("get-project-data");

    // do not repeat save mouse positions or original capture
    // in the saved context data
    // just load it fresh, set in state, and pass via props
    // TODO: consider perf implications of setting these buffers in state

    const duration = mousePositions[mousePositions.length - 1].timestamp; // may be off by up to 100ms

    console.info(
      "project data",
      currentProjectId,
      mousePositions,
      sourceData,
      duration,
      resolution
    );

    setProjectId(currentProjectId);
    setPositions(mousePositions);
    setOriginalCapture(originalCapture);
    setOriginalDuration(duration);
    setSourceData(sourceData);
    setResolution(resolution);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>SunShot = Editor</title>
      </Head>
      <EditorContext.Provider
        value={useReducer(EditorContextReducer, EditorContextState) as any}
      >
        <section className={styles.editor}>
          <div className={styles.editorInner}>
            <section className={styles.mainPanel}>
              {/* <EditorCtrls
                positions={positions}
                // originalCapture={originalCapture}
                originalDuration={originalDuration}
              /> */}
              {/* <NoSSRCanvas
                positions={positions}
                originalDuration={originalDuration}
                originalCapture={originalCapture}
                sourceData={sourceData}
                resolution={resolution}
                // originalCapture25={originalCapture25}
              /> */}
              {/* <NoSSRSun
                projectId={projectId}
                sourceData={sourceData}
                originalCapture={originalCapture}
              /> */}
              <NoSSRCanvas2
                projectId={projectId}
                sourceData={sourceData}
                positions={positions}
                originalCapture={originalCapture}
              />
              <NoSSRTracks
                positions={positions}
                originalDuration={originalDuration}
              />
            </section>
            <aside className={styles.sidePanel}>
              <Properties />
            </aside>
          </div>
        </section>
      </EditorContext.Provider>
      <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    </React.Fragment>
  );
}

export default Editor;
