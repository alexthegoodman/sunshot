import * as React from "react";

import styles from "./PreviewCanvas.module.scss";

import { PreviewCanvasProps } from "./PreviewCanvas.d";
import { useEditorContext } from "../../context/EditorContext/EditorContext";

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
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

  function drawGradientBackground() {
    var canvas = document.getElementById("exportPreview") as HTMLCanvasElement;
    var ctx = canvas.getContext("2d");

    var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "blue");
    gradient.addColorStop(1, "green");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawVideo() {
    var canvas = document.getElementById("exportPreview") as HTMLCanvasElement;
    var ctx = canvas.getContext("2d");

    console.info("canvas", canvas.width, canvas.height);

    var video = document.getElementById("originalCapture") as HTMLVideoElement;
    ctx.drawImage(video, 0, 0, canvas.width * 0.8, canvas.height * 0.8);
  }

  function zoomIn() {
    var video = document.getElementById("originalCapture") as HTMLVideoElement;
    var canvas = document.getElementById("exportPreview") as HTMLCanvasElement;
    var ctx = canvas.getContext("2d");

    var scaleFactor = 1.01;
    var scale = 1;
    var maxScale = 2;

    function animateZoom() {
      scale *= scaleFactor;

      if (scale > maxScale) {
        scale = maxScale;
      }

      var newWidth = canvas.width / scale;
      var newHeight = canvas.height / scale;
      var x = (canvas.width - newWidth) / 2;
      var y = (canvas.height - newHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGradientBackground();
      ctx.save();
      //   ctx.scale(scale, scale);

      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.rect(100, 100, canvas.width * 0.5, canvas.height * 0.5);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(video, 100, 100, canvas.width * 0.8, canvas.height * 0.8);

      //   drawVideo();

      ctx.restore();

      if (scale < maxScale) {
        requestAnimationFrame(animateZoom);
      }
    }

    animateZoom();
  }

  const handlePlay = () => {
    zoomIn();
  };

  return (
    <section className={styles.previewContainer}>
      <canvas
        id="exportPreview"
        className={styles.exportPreview}
        width={3840 / 4}
        height={2160 / 4}
      ></canvas>
      <div className={styles.currentVideoContainer}>
        <video
          id="originalCapture"
          className={styles.currentVideo}
          controls={false}
          muted
        ></video>
      </div>

      <button onClick={handlePlay}>Play</button>
    </section>
  );
};

export default PreviewCanvas;
