import * as React from "react";

import { SunCanvasProps } from "./SunCanvas.d";

const SunCanvas: React.FC<SunCanvasProps> = ({
  projectId = null,
  sourceData = null,
  originalCapture = null,
}) => {
  console.info("diagnostics", window.devicePixelRatio);
  const pixelRatio = window.devicePixelRatio;
  const width25 = 3840 / 4;
  const height25 = 2160 / 4;

  const [showCanvas, setShowCanvas] = React.useState(false);

  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    const blob = new Blob([originalCapture], { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    element.width = sourceData.width;
    element.height = sourceData.height;
    element.src = url;
    // document.body.appendChild(element);
    return element;
  }, [originalCapture]);

  const initCanvas = async () => {
    let canvas = document.getElementById("sunCanvas") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");

    function draw() {
      //   console.info("Draw");
      // clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw the background
      ctx.fillStyle = "blue";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      //   console.info("check ", canvas.width * 0.8, canvas.height * 0.8);

      const videoTop = Math.round(canvas.height * 0.1);
      const videoLeft = Math.round(canvas.width * 0.1);
      const videoWidth = sourceData.width / 4;
      const videoHeight = sourceData.height / 4;

      //   console.info("check", videoTop, videoLeft, videoWidth, videoHeight);

      // draw the video
      ctx.drawImage(videoElement, videoTop, videoLeft, videoWidth, videoHeight);

      // request the next frame
      requestAnimationFrame(draw);
    }

    // videoElement.ontimeupdate = function () {
    //   console.info("ontimeupdate");
    //   // draw the video at that frame
    //   draw();
    // };

    videoElement.onplay = function () {
      console.info("onplay");
      // start the animation
      draw();
    };
  };

  const playVideo = () => {
    videoElement.play();
  };

  React.useEffect(() => {
    if (originalCapture && showCanvas) {
      initCanvas();
    }
  }, [originalCapture, showCanvas]);

  React.useEffect(() => {
    if (sourceData) {
      console.info("sourceData", sourceData);
      setShowCanvas(true);
    }
  }, [sourceData]);

  // clamp width and height
  const ratio = sourceData ? sourceData.height / sourceData.width : 0;
  const width = 1200;
  const height = width * ratio;

  return (
    <>
      {showCanvas && (
        <canvas id="sunCanvas" width={width25} height={height25}></canvas>
      )}
      <button onClick={playVideo}>Play</button>
    </>
  );
};

export default SunCanvas;
