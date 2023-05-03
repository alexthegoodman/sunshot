import * as React from "react";

import styles from "./FabricCanvas.module.scss";

import { FabricCanvasProps } from "./FabricCanvas.d";

import { fabric } from "fabric";
// import * as fabric from "fabric";

const FabricCanvas: React.FC<FabricCanvasProps> = ({
  positions = null,
  originalCapture = null,
  originalCapture25 = null,
}) => {
  const fabricCanvasRef = React.useRef(null);
  const [videoAdded, setVideoAdded] = React.useState(false);

  React.useEffect(() => {
    if (originalCapture) {
      // display orginalcapture buffer in video element
      const videoElement = document.getElementById(
        "originalCapture"
      ) as HTMLVideoElement;

      const blob = new Blob([originalCapture], { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      var source = document.createElement("source");

      source.src = url;
      source.type = "video/webm";

      videoElement.appendChild(source);
      setVideoAdded(true);
    }
  }, [originalCapture]);

  React.useEffect(() => {
    if (videoAdded) {
      console.info("video added");

      var canvas = new fabric.Canvas(fabricCanvasRef.current, {
        width: 1000,
        height: 700,
        //   selection: false,
      });

      const videoElement = document.getElementById(
        "originalCapture"
      ) as HTMLVideoElement;

      var test = new fabric.Rect({
        width: 1000,
        height: 500,
        fill: "red",
        // clipPath: new fabric.Circle({
        //   left: 0,
        //   top: 0,
        //   radius: 100,
        //   //   originX: "right",
        //   //   originY: "bottom",
        // }),
      });

      const rectClip = new fabric.Rect({
        left: -3840 / 2,
        top: -2160 / 2,
        width: 3840,
        height: 2160,
        originX: "left",
        originY: "top",
      });

      var rect = new fabric.Image(videoElement, {
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        width: 3840,
        height: 2160,
        objectCaching: false,
        // noScaleCache: true,
        statefullCache: true,
        cacheProperties: ["videoTime"],
        originX: "left",
        originY: "top",
        clipPath: rectClip,
      });

      //   var group = new fabric.Group([test, rect], {
      //     // left: 0,
      //     // top: 0,
      //     // scaleX: 1,
      //     // scaleY: 1,
      //     // width: 3840,
      //     // height: 2160,
      //     objectCaching: false,
      //     // statefullCache: true,
      //     // originX: "left",
      //     // originY: "top",
      //     // left: 0,
      //     // top: 0,
      //     // width: 3480,
      //     // height: 2160,
      //     // clipPath: new fabric.Rect({
      //     //   fill: "red",
      //     //   width: 1000,
      //     //   height: 1000,
      //     //   originX: "",
      //     //   originY: "center",
      //     // }),
      //     // cacheProperties: ["videoTime"],
      //     // clipPath: new fabric.Rect({
      //     //   left: 0,
      //     //   top: 0,
      //     //   width: 1000,
      //     //   height: 1000,
      //     //   originX: "left",
      //     //   originY: "top",
      //     // }),
      //   });

      canvas.add(rect);
      //   canvas.add(test);

      rect.scale(0.25);

      //   canvas.add(group);

      videoElement.load();
      rect.getElement().play();

      //   rect.animate(
      //     {
      //       scaleX: 0.5,
      //       scaleY: 0.5,
      //       // top: -2160 / 2 - 100,
      //       // left: -3840 / 2 - 100,
      //     }, // base 0.25
      //     {
      //       onChange: canvas.renderAll.bind(canvas),
      //       duration: 2000,
      //       //   easing: fabric.util.ease.easeOutExpo,
      //     }
      //   );

      rectClip.animate(
        {
          scaleX: 0.5,
          scaleY: 0.5,
          // top: -2160 / 2,
          // left: -3840 / 2,
        }, // base 0.25
        {
          onChange: canvas.renderAll.bind(canvas),
          duration: 2000,
          //   easing: fabric.util.ease.easeOutExpo,
        }
      );

      console.info("canvas", canvas.toJSON());

      // rect.getElement().play();
      fabric.util.requestAnimFrame(function render() {
        canvas.renderAll();
        rect.videoTime = videoElement.currentTime;
        // group.videoTime = videoElement.currentTime;
        fabric.util.requestAnimFrame(render);
      });
    }
  }, [videoAdded]);

  return (
    <>
      <canvas
        id="fabricCanvas"
        className={styles.fabricCanvas}
        ref={fabricCanvasRef}
      ></canvas>
      <video
        id="originalCapture"
        className={styles.currentVideo}
        style={{
          // display: "none",
          objectFit: "contain",
        }}
        controls={false}
        autoPlay={true}
        width={3480}
        height={2160}
        muted
      >
        {/* <source src="/originalCapture.webm" type="video/webm" /> */}
      </video>
    </>
  );
};

export default FabricCanvas;
