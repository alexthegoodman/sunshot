import * as React from "react";

import styles from "./KonvaCanvas.module.scss";

import { KonvaCanvasProps } from "./KonvaCanvas.d";

import { Stage, Layer, Rect, Text, Group, Image, Shape } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import { Image as ImageType } from "konva/lib/shapes/Image";

const width25 = 3840 / 4;
const height25 = 2160 / 4;
const innerWidth = width25 * 0.8;
const innerHeight = height25 * 0.8;

// https://stackoverflow.com/questions/59741398/play-video-on-canvas-in-react-konva
const Video = ({ src }) => {
  const imageRef = React.useRef<ImageType>(null);
  const [size, setSize] = React.useState({ width: 50, height: 50 });

  // we need to use "useMemo" here, so we don't create new video elment on any render
  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    element.src = src;
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

  // use Konva.Animation to redraw a layer
  React.useEffect(() => {
    videoElement.play();
    const layer = imageRef.current.getLayer();

    const anim = new Konva.Animation(() => {}, layer);
    anim.start();

    setTimeout(() => {
      imageRef.current.to({
        scaleX: 2,
        scaleY: 2,
        duration: 2,
        easing: Konva.Easings.EaseInOut,
        // x
        // y
        offsetX: 100,
        offsetY: 100,
      });
    }, 500);

    return () => {
      anim.stop();
    };
  }, [videoElement]);

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

const KonvaCanvas: React.FC<KonvaCanvasProps> = () => {
  const stageRef = React.useRef(null);
  const layerRef = React.useRef(null);

  console.info("ref", stageRef, layerRef);

  const recordCanvas = () => {
    console.info("record canvas");
    // var canvas = document.getElementById("myCanvas");
    const canvas = layerRef.current.getNativeCanvasElement();
    var ctx = canvas.getContext("2d");

    // Set up MediaRecorder options
    var mediaRecorderOptions = {
      mimeType: "video/webm",
      videoBitsPerSecond: 2500000, // adjust as needed
    };

    // Create a new MediaRecorder instance and start recording
    var chunks = [];
    var mediaRecorder = new MediaRecorder(
      canvas.captureStream(),
      mediaRecorderOptions
    );
    mediaRecorder.start();

    // Handle data available event
    mediaRecorder.addEventListener("dataavailable", function (event) {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    // Stop recording and create a video blob
    mediaRecorder.addEventListener("stop", function () {
      var videoBlob = new Blob(chunks, { type: "video/webm" });

      const videoElement = document.getElementById(
        "recordedCapture"
      ) as HTMLVideoElement;

      const url = URL.createObjectURL(videoBlob);
      videoElement.src = url;

      console.info("video", url);

      // Do something with the recorded video blob
    });

    // Stop recording after some time
    setTimeout(function () {
      mediaRecorder.stop();
      console.info("video stop");
    }, 5000);
  };

  React.useEffect(() => {
    recordCanvas();
  }, []);

  return (
    <>
      {" "}
      <Stage id="stage" ref={stageRef} width={width25} height={height25}>
        <Layer ref={layerRef}>
          <Rect width={width25} height={height25} fill="blue"></Rect>
          <Group
            x={width25 / 2 - innerWidth / 2}
            y={height25 / 2 - innerHeight / 2}
            clipFunc={(ctx) => {
              ctx.rect(0, 0, innerWidth, innerHeight);
            }}
          >
            <Rect width={width25} height={height25} fill="black"></Rect>
            <Video src="/originalCapture.webm" />
          </Group>
        </Layer>
      </Stage>
      <video id="recordedCapture" autoPlay={true} loop={true}></video>
    </>
  );
};

export default KonvaCanvas;
