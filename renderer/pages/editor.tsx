import { ipcRenderer } from "electron";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect } from "react";

import styles from "./editor.module.scss";

function Editor() {
  const [positions, setPositions] = React.useState(null);

  useEffect(() => {
    const { mousePositions, originalCapture } =
      ipcRenderer.sendSync("get-project-data");
    console.info("project data", mousePositions, originalCapture);

    setPositions(mousePositions);

    // display orginalcapture buffer in video element
    const videoElement = document.getElementById(
      "originalCapture"
    ) as HTMLVideoElement;

    const blob = new Blob([originalCapture], { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    videoElement.src = url;
  }, []);

  function zoomIn(
    videoElement,
    videoWidth,
    videoHeight,
    zoomFactor,
    zoomPoint
  ) {
    const scaledWidth = videoWidth * zoomFactor;
    const scaledHeight = videoHeight * zoomFactor;
    const xOffset = -(zoomPoint.x * zoomFactor - zoomPoint.x);
    const yOffset = -(zoomPoint.y * zoomFactor - zoomPoint.y);

    videoElement.style.transform = `scale(${zoomFactor}) translate(${xOffset}px, ${yOffset}px)`;
  }

  function zoomOut(videoElement) {
    videoElement.style.transform = "";
  }

  const handlePlay = () => {
    const videoElement = document.getElementById(
      "originalCapture"
    ) as HTMLVideoElement;

    videoElement.play();

    // zoom in on point
    let point = 0;
    const zoomInterval = setInterval(() => {
      const videoWidth = videoElement.videoWidth / 4;
      const videoHeight = videoElement.videoHeight / 4;
      console.info("videoWidth", videoWidth, "videoHeight", videoHeight);
      const zoomFactor = 2;
      // const zoomPoint = { x: videoWidth / 2, y: videoHeight / 2 }; // Set the point around which to zoom
      const zoomPoint = {
        x: positions[point].x / 4,
        y: positions[point].y / 4,
      }; // Set the point around which to zoom

      zoomIn(videoElement, videoWidth, videoHeight, zoomFactor, zoomPoint);

      point++;

      if (point >= positions.length) {
        zoomOut(videoElement);
        clearInterval(zoomInterval);
      }
    }, 100);
  };

  return (
    <React.Fragment>
      <Head>
        <title>SunShot = Editor</title>
      </Head>
      <section className={styles.editor}>
        <div className={styles.editorInner}>
          <section className={styles.videoPreview}>
            <div className={styles.currentVideoContainer}>
              <video
                id="originalCapture"
                className={styles.currentVideo}
                controls={false}
                muted
              ></video>
            </div>
          </section>
          <button onClick={handlePlay}>Play</button>
        </div>
      </section>
    </React.Fragment>
  );
}

export default Editor;
