import * as React from "react";

import styles from "./Preview.module.scss";

import { PreviewProps } from "./Preview.d";

const Preview: React.FC<PreviewProps> = ({
  positions = null,
  originalCapture = null,
}) => {
  React.useEffect(() => {
    // display orginalcapture buffer in video element
    const videoElement = document.getElementById(
      "originalCapture"
    ) as HTMLVideoElement;

    const blob = new Blob([originalCapture], { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    videoElement.src = url;
  }, []);

  function zoomIn(videoElement, zoomFactor, zoomPoint) {
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

    // const videoWidth = videoElement.videoWidth / 4;
    // const videoHeight = videoElement.videoHeight / 4;
    const zoomFactor = 2;

    // zoom in on point
    let point = 0;
    const zoomInterval = setInterval(() => {
      const zoomPoint = {
        x: positions[point].x / 4,
        y: positions[point].y / 4,
      };

      zoomIn(videoElement, zoomFactor, zoomPoint);

      point++;

      if (point >= positions.length) {
        zoomOut(videoElement);
        clearInterval(zoomInterval);
      }
    }, 100);
  };

  return (
    <section className={styles.previewContainer}>
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
    </section>
  );
};

export default Preview;
