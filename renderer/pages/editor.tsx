import { ipcRenderer } from "electron";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect } from "react";

function Editor() {
  useEffect(() => {
    const { mousePositions, originalCapture } =
      ipcRenderer.sendSync("get-project-data");
    console.info("project data", mousePositions, originalCapture);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>SunShot = Editor</title>
      </Head>
      <div>
        <p>Welcome to the editor</p>
      </div>
    </React.Fragment>
  );
}

export default Editor;
