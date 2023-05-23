import * as React from "react";

// import styles from "./KonvaCanvas.module.scss";

import { KonvaCanvasProps } from "./KonvaCanvas.d";

import { Stage, Layer, Rect, Text, Group, Image, Shape } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import { Image as ImageType } from "konva/lib/shapes/Image";
import {
  KonvaEasings,
  useEditorContext,
} from "../../context/EditorContext/EditorContext";
import { ipcRenderer } from "electron";
import { CanvasRecorder } from "recordrtc";
import html2canvas from "html2canvas";
import { styled } from "styled-components";

const ProjectCtrls = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 15px 0;
`;

const StageContainer = styled.section`
  display: flex;
  justify-content: center;
  background-color: lightgray;
`;

const VideoCtrls = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 15px;
  padding: 15px 0;
`;

let anim = null;
let zoomInterval = null;

// https://stackoverflow.com/questions/59741398/play-video-on-canvas-in-react-konva
const Video = ({
  src,
  positions,
  zoomTracks,
  sourceData,
  playing,
  stopped,
  exporting,
  setCurrentTime,
  divider,
  innerWidth,
  innerHeight,
}) => {
  // console.info("videeo", ref);
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

  React.useEffect(() => {
    setSize({
      width: innerWidth,
      height: innerHeight,
    });
  }, [innerWidth, innerHeight]);

  const zoomIn = (zoomFactor, zoomPoint, easing) => {
    console.info("zoomIn", zoomFactor, zoomPoint);
    setZoomedIn(true);

    imageRef.current.to({
      scaleX: zoomFactor,
      scaleY: zoomFactor,
      duration: zoomedIn ? 0.1 : 2,
      easing: Konva.Easings[easing],
      // x
      // y
      offsetX: zoomPoint.x,
      offsetY: zoomPoint.y,
    });
  };

  const zoomOut = (easing) => {
    console.info("zoomOut");
    setZoomedIn(false);

    imageRef.current.to({
      scaleX: 1,
      scaleY: 1,
      duration: 2,
      easing: Konva.Easings[easing],
      // x
      // y
      offsetX: 0,
      offsetY: 0,
    });
  };

  // use Konva.Animation to redraw a layer
  const playCanvasVideo = () => {
    if (zoomTracks && videoElement) {
      // video to canvas animation required
      videoElement.play();
      const layer = imageRef.current.getLayer();

      anim = new Konva.Animation(() => {}, layer);
      anim.start();

      // mouse follow animation
      // const zoomFactor = 2;
      const refreshRate = 100;
      let point = 0;
      let timeElapsed = 0;

      zoomInterval = setInterval(() => {
        timeElapsed += refreshRate;

        if (!exporting) {
          setCurrentTime(timeElapsed);
        }

        zoomTracks.forEach((track) => {
          if (
            Math.floor(timeElapsed) <= Math.floor(track.start) &&
            Math.floor(timeElapsed) + refreshRate > Math.floor(track.start)
          ) {
            const predictionOffset = 0;
            const zoomPoint = {
              x:
                ((positions[point + predictionOffset].x - sourceData.x) /
                  divider) *
                0.8,
              y:
                ((positions[point + predictionOffset].y - sourceData.y) /
                  divider) *
                0.8,
            };

            zoomIn(track.zoomFactor, zoomPoint, track.easing);
          }

          if (
            Math.floor(timeElapsed) < Math.floor(track.end) &&
            Math.floor(timeElapsed) + refreshRate >= Math.floor(track.end)
          ) {
            zoomOut(track.easing);
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
  };

  React.useEffect(() => {
    if (playing) {
      playCanvasVideo();
    } else {
      // stop anim and pause element
      if (anim && videoElement) {
        anim.stop(); // pause()?
        videoElement.pause();
        clearInterval(zoomInterval);
        setCurrentTime(0);
        zoomOut(KonvaEasings.Linear);

        if (stopped) {
          videoElement.currentTime = 0;
        }
      }
    }
  }, [playing, stopped]);

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
  originalDuration = null,
  originalCapture25 = null,
  sourceData = null,
}) => {
  const [{ zoomTracks, currentTime, playing, stopped, exporting }, dispatch] =
    useEditorContext();
  const stageRef = React.useRef(null);
  const layerRef = React.useRef(null);

  const [divider, setDivider] = React.useState(4);

  const width25 = 3840 / divider; // divider of 2 is HD, 1.5 is 2K, 1 is 4K // even 1.5 seems to get cut off
  const height25 = 2160 / divider;
  const innerWidth = width25 * 0.8;
  const innerHeight = height25 * 0.8;

  // console.info("ref", stageRef, layerRef);

  const setCurrentTime = (time) => {
    dispatch({ key: "currentTime", value: time });
  };

  const playVideo = () => {
    dispatch({ key: "playing", value: true });
    dispatch({ key: "stopped", value: false });
    // dispatch({ key: "exporting", value: false }); // would be run on recordCanvas
  };

  const stopVideo = () => {
    dispatch({ key: "playing", value: false });
    dispatch({ key: "stopped", value: true });
    dispatch({ key: "exporting", value: false });
  };

  const exportVideo = () => {
    dispatch({ key: "exporting", value: true });
    setDivider(2);
    setTimeout(() => {
      recordCanvas();
    }, 1000);
  };

  // *** record canvas ***
  const recordCanvas = () => {
    // console.info("record canvas");

    const canvas = layerRef.current.getNativeCanvasElement();

    const chunkDuration = 5000;
    let elapsed = 0;
    let completed = false;

    const recordInterval = setInterval(() => {
      if (elapsed === 0) {
        playVideo();
      }

      // Set up MediaRecorder options
      var mediaRecorderOptions = {
        mimeType: "video/webm",
        // videoBitsPerSecond: 2500000, // adjust as needed
      };

      // Create a new MediaRecorder instance and start recording
      var chunks = [];
      var mediaRecorder = new MediaRecorder(
        canvas.captureStream(),
        mediaRecorderOptions
      );

      mediaRecorder.addEventListener("start", function (event) {
        console.info("recorder start", event);
      });

      mediaRecorder.addEventListener("pause", function (event) {
        console.info("recorder pause", event);
      });

      // mediaRecorder.addEventListener("resume", function (event) {
      //   console.info("recorder resume", event);
      // });

      // mediaRecorder.addEventListener("error", function (event) {
      //   console.info("recorder error", event);
      // });

      // mediaRecorder.addEventListener("warning", function (event) {
      //   console.info("recorder warning", event);
      // });

      mediaRecorder.addEventListener("stop", function (event) {
        console.info("recorder stop", event);
        // stream.getTracks().forEach(stream => stream.stop());
      });

      // Handle data available event
      mediaRecorder.addEventListener("dataavailable", async function (event) {
        // console.info("dataavailable", event, event.data);
        if (event.data.size > 0) {
          // console.info("push chunk");
          const chunk = event.data;
          // chunks.push(event.data);

          const videoBlob = new Blob([chunk], { type: "video/webm" });

          // const videoElement = document.getElementById(
          //   "recordedCapture"
          // ) as HTMLVideoElement;

          // const url = URL.createObjectURL(videoBlob);
          // videoElement.src = url;

          // console.info("video", chunks, videoBlob, url);

          const arrayBuffer = await videoBlob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          console.info(
            "save-transformed-blob",
            arrayBuffer.byteLength,
            buffer.length
          );

          ipcRenderer.sendSync("save-transformed-blob", {
            buffer,
          });
        }
      });

      mediaRecorder.start();

      // Stop recording after some time
      if (elapsed < originalDuration) {
        setTimeout(function () {
          elapsed += chunkDuration;
          mediaRecorder.stop();
        }, chunkDuration);
      } else {
        setTimeout(function () {
          clearInterval(recordInterval);
          completed = true;
          mediaRecorder.stop();
          console.info("completed");
          // saveVideoBlob();
          ipcRenderer.sendSync("combine-blobs");
        }, elapsed - originalDuration);
      }
    }, chunkDuration);
  };

  return (
    <>
      <ProjectCtrls>
        <button
          className="spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM"
          onClick={exportVideo}
        >
          Export
        </button>
      </ProjectCtrls>
      <StageContainer className={`${exporting ? "" : ""}`}>
        <Stage id="stage" ref={stageRef} width={width25} height={height25}>
          <Layer ref={layerRef}>
            <Rect
              width={width25}
              height={height25}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={3840 / 2}
              fillRadialGradientColorStops={[
                0,
                "red",
                0.5,
                "yellow",
                1,
                "blue",
              ]}
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
              {/** useEditorContext is not available within <Stage /> */}
              <Video
                src={originalCapture}
                zoomTracks={zoomTracks}
                positions={positions}
                sourceData={sourceData}
                playing={playing}
                stopped={stopped}
                exporting={exporting}
                setCurrentTime={setCurrentTime}
                divider={divider}
                innerWidth={innerWidth}
                innerHeight={innerHeight}
              />
            </Group>
          </Layer>
        </Stage>
      </StageContainer>
      <VideoCtrls>
        <button
          className="spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM"
          onClick={playVideo}
        >
          Play
        </button>
        {/* <button
          onClick={() => {
            dispatch({ key: "playing", value: false });
            dispatch({ key: "stopped", value: false });
          }}
        >
          Pause
        </button> */}
        <button
          className="spectrum-Button spectrum-Button--secondary spectrum-Button--sizeM"
          onClick={stopVideo}
        >
          Stop
        </button>
      </VideoCtrls>
      {/* <video id="recordedCapture" autoPlay={true} loop={true}></video> */}
    </>
  );
};

export default KonvaCanvas;
