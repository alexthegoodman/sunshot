import * as React from "react";

import styles from "./KonvaCanvas.module.scss";

import { KonvaCanvasProps } from "./KonvaCanvas.d";

import { Stage, Layer, Rect, Text, Group, Image } from "react-konva";
import Konva from "konva";
import useImage from "use-image";

const width25 = 3840 / 4;
const height25 = 2160 / 4;
const innerWidth = width25 * 0.8;
const innerHeight = height25 * 0.8;

// https://stackoverflow.com/questions/59741398/play-video-on-canvas-in-react-konva
const Video = ({ src }) => {
  const imageRef = React.useRef(null);
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
      setSize({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
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

    return () => anim.stop();
  }, [videoElement]);

  return (
    <Image
      ref={imageRef}
      image={videoElement}
      x={20}
      y={20}
      stroke="red"
      width={size.width}
      height={size.height}
      draggable
    />
  );
};

const KonvaCanvas: React.FC<KonvaCanvasProps> = () => {
  return (
    <Stage width={width25} height={height25}>
      <Layer>
        <Rect width={width25} height={height25} fill="blue"></Rect>
        <Group
          clipFunc={(ctx) => {
            ctx.rect(0, 0, innerWidth, innerHeight);
          }}
        >
          <Rect width={width25} height={height25} fill="red"></Rect>
          <Text text="Try click on rect" />
          <Video src="/originalCapture.webm" />
        </Group>
      </Layer>
    </Stage>
  );
};

export default KonvaCanvas;
