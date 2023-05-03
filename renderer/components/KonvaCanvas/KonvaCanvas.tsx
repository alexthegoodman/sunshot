import * as React from "react";

import styles from "./KonvaCanvas.module.scss";

import { KonvaCanvasProps } from "./KonvaCanvas.d";

import { Stage, Layer, Rect, Text, Group, Image, Shape } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import { Image as ImageType } from "konva/lib/shapes/Image";
import { useEditorContext } from "../../context/EditorContext/EditorContext";

const width25 = 3840 / 4;
const height25 = 2160 / 4;
const innerWidth = width25 * 0.8;
const innerHeight = height25 * 0.8;

// https://stackoverflow.com/questions/59741398/play-video-on-canvas-in-react-konva
const Video = ({ src, positions, zoomTracks }) => {
  const imageRef = React.useRef<ImageType>(null);
  const [size, setSize] = React.useState({ width: 50, height: 50 });
  const [zoomedIn, setZoomedIn] = React.useState(false);

  // we need to use "useMemo" here, so we don't create new video elment on any render
  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    const blob = new Blob([src], { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    element.src = url;
    return element;
  }, [src]);

  // when video is loaded, we should read it size
  React.useEffect(() => {
    const onload = function () {
      // setSize({
      //   width: videoElement.videoWidth,
      //   height: videoElement.videoHeight,
      // });
      setSize({
        width: innerWidth,
        height: innerHeight,
      });
    };
    videoElement.addEventListener("loadedmetadata", onload);
    return () => {
      videoElement.removeEventListener("loadedmetadata", onload);
    };
  }, [videoElement]);

  const zoomIn = (zoomFactor, zoomPoint) => {
    console.info("zoomIn", zoomFactor, zoomPoint);
    setZoomedIn(true);

    imageRef.current.to({
      scaleX: zoomFactor,
      scaleY: zoomFactor,
      duration: zoomedIn ? 0.1 : 2,
      easing: Konva.Easings.EaseInOut,
      // x
      // y
      offsetX: zoomPoint.x,
      offsetY: zoomPoint.y,
    });
  };

  const zoomOut = () => {
    setZoomedIn(false);

    imageRef.current.to({
      scaleX: 1,
      scaleY: 1,
      duration: 2,
      easing: Konva.Easings.EaseInOut,
      // x
      // y
      offsetX: 0,
      offsetY: 0,
    });
  };

  // use Konva.Animation to redraw a layer
  React.useEffect(() => {
    if (zoomTracks && videoElement) {
      // video to canvas animation required
      videoElement.play();
      const layer = imageRef.current.getLayer();

      const anim = new Konva.Animation(() => {}, layer);
      anim.start();

      // mouse follow animation
      const zoomFactor = 2;
      const refreshRate = 100;
      let point = 0;
      let timeElapsed = 0;

      const zoomInterval = setInterval(() => {
        timeElapsed += refreshRate;

        zoomTracks.forEach((track) => {
          if (Math.floor(timeElapsed) === Math.floor(track.start)) {
            const predictionOffset = 0;
            const zoomPoint = {
              x: (positions[point + predictionOffset].x / 4) * 0.8,
              y: (positions[point + predictionOffset].y / 4) * 0.8,
            };

            zoomIn(zoomFactor, zoomPoint);
          }

          if (Math.floor(timeElapsed) === Math.floor(track.end)) {
            zoomOut();
          }
        });

        point++;

        if (point >= positions.length) {
          // zoomOut(videoElement);
          clearInterval(zoomInterval);
        }
      }, refreshRate);

      return () => {
        anim.stop();
      };
    }
  }, [videoElement, zoomTracks]);

  return (
    <Image
      ref={imageRef}
      image={videoElement}
      x={0}
      y={0}
      // stroke="red"
      width={size.width}
      height={size.height}
      draggable
    />
  );
};

const KonvaCanvas: React.FC<KonvaCanvasProps> = ({
  positions = null,
  originalCapture = null,
  originalCapture25 = null,
}) => {
  const [{ zoomTracks }, dispatch] = useEditorContext();
  const stageRef = React.useRef(null);
  const layerRef = React.useRef(null);

  console.info("ref", stageRef, layerRef);

  // *** record canvas ***
  // const recordCanvas = () => {
  //   console.info("record canvas");
  //   // var canvas = document.getElementById("myCanvas");
  //   const canvas = layerRef.current.getNativeCanvasElement();
  //   var ctx = canvas.getContext("2d");

  //   // Set up MediaRecorder options
  //   var mediaRecorderOptions = {
  //     mimeType: "video/webm",
  //     videoBitsPerSecond: 2500000, // adjust as needed
  //   };

  //   // Create a new MediaRecorder instance and start recording
  //   var chunks = [];
  //   var mediaRecorder = new MediaRecorder(
  //     canvas.captureStream(),
  //     mediaRecorderOptions
  //   );
  //   mediaRecorder.start();

  //   // Handle data available event
  //   mediaRecorder.addEventListener("dataavailable", function (event) {
  //     if (event.data.size > 0) {
  //       chunks.push(event.data);
  //     }
  //   });

  //   // Stop recording and create a video blob
  //   mediaRecorder.addEventListener("stop", function () {
  //     var videoBlob = new Blob(chunks, { type: "video/webm" });

  //     const videoElement = document.getElementById(
  //       "recordedCapture"
  //     ) as HTMLVideoElement;

  //     const url = URL.createObjectURL(videoBlob);
  //     videoElement.src = url;

  //     console.info("video", url);

  //     // Do something with the recorded video blob
  //   });

  //   // Stop recording after some time
  //   setTimeout(function () {
  //     mediaRecorder.stop();
  //     console.info("video stop");
  //   }, 5000);
  // };

  // React.useEffect(() => {
  //   recordCanvas();
  // }, []);

  return (
    <>
      {" "}
      <Stage id="stage" ref={stageRef} width={width25} height={height25}>
        <Layer ref={layerRef}>
          <Rect
            width={width25}
            height={height25}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={3840 / 2}
            fillRadialGradientColorStops={[0, "red", 0.5, "yellow", 1, "blue"]}
          ></Rect>
          <Rect
            x={width25 / 2 - innerWidth / 2}
            y={height25 / 2 - innerHeight / 2}
            width={innerWidth}
            height={innerHeight}
            fill="black"
            cornerRadius={10}
            shadowColor="black"
            shadowBlur={10}
            shadowOffset={{ x: 10, y: 10 }}
            shadowOpacity={0.5}
          ></Rect>
          <Group
            x={width25 / 2 - innerWidth / 2}
            y={height25 / 2 - innerHeight / 2}
            clipFunc={(ctx) => {
              ctx.rect(0, 0, innerWidth, innerHeight);
            }}
          >
            <Video
              src={originalCapture}
              zoomTracks={zoomTracks}
              positions={positions}
            />
          </Group>
        </Layer>
      </Stage>
      <video id="recordedCapture" autoPlay={true} loop={true}></video>
    </>
  );
};

export default KonvaCanvas;
