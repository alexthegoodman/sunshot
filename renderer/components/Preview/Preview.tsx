import * as React from "react";

import styles from "./Preview.module.scss";

import { PreviewProps } from "./Preview.d";
import { useEditorContext } from "../../context/EditorContext/EditorContext";

const Preview: React.FC<PreviewProps> = ({
  positions = null,
  originalCapture = null,
  fullSize = false,
}) => {
  const [{ videoTrack, zoomTracks }, dispatch] = useEditorContext();

  React.useEffect(() => {
    if (originalCapture) {
      // display orginalcapture buffer in video element
      const videoElement = document.getElementById(
        "originalCapture"
      ) as HTMLVideoElement;

      const blob = new Blob([originalCapture], { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      videoElement.src = url;
    }
  }, [originalCapture]);

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
    // const refreshRate = 1000 / 60;
    const refreshRate = 100;
    let point = 0;
    let timeElapsed = 0;

    const zoomInterval = setInterval(() => {
      timeElapsed += refreshRate;

      zoomTracks.forEach((track) => {
        if (Math.floor(timeElapsed) === Math.floor(track.start)) {
          const predictionOffset = 10;
          const zoomPoint = {
            x: positions[point + predictionOffset].x / 4,
            y: positions[point + predictionOffset].y / 4,
          };

          zoomIn(videoElement, zoomFactor, zoomPoint);
        }

        if (Math.floor(timeElapsed) === Math.floor(track.end)) {
          zoomOut(videoElement);
        }
      });

      point++;

      if (point >= positions.length) {
        // zoomOut(videoElement);
        clearInterval(zoomInterval);
      }
    }, refreshRate);
  };

  return (
    <section className={styles.previewContainer}>
      <section id="exportPreview" className={styles.videoPreview}>
        <div
          className={styles.currentVideoContainer}
          style={
            fullSize
              ? { width: 3840 * 0.8, height: 2160 * 0.8 } // padding for gradient
              : { width: 3840 / 4, height: 2160 / 4 } // padding + visual size
          }
        >
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
