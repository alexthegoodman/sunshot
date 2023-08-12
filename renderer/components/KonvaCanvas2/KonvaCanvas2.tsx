import * as React from "react";

import Konva from "konva";

import { KonvaCanvas2Props } from "./KonvaCanvas2.d";
import { useEditorContext } from "../../context/EditorContext/EditorContext";
import { styled } from "styled-components";
import { ipcRenderer } from "electron";

const ProjectCtrls = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 15px 0;
`;

const VideoCtrls = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 15px;
  padding: 15px 0;
`;

var anim = null;
var konvaLayer = null;
var playing = false;
let zoomInterval = null;
let zoomingIn = false;
let zoomingOut = false;
let zoomPoint = null;
let konvaVideo = null;
let friction1 = 5;
let friction2 = 5;
let currentZoomPointX = 0;
let currentZoomPointY = 0;
let currentScaleX = 0;
let currentScaleY = 0;

const frictionalAnimation = (target, current, velocity, friction) => {
  const direction = target - current;
  const newVelocity = direction * Math.exp(-friction);
  return newVelocity;
};

const KonvaCanvas2: React.FC<KonvaCanvas2Props> = ({
  projectId = null,
  sourceData = null,
  positions = null,
  originalCapture = null,
}) => {
  const [{ videoTrack, zoomTracks }, dispatch] = useEditorContext();

  const ratio = sourceData ? sourceData.height / sourceData.width : 0;
  const width = 1200;
  const height = width * ratio;

  const width25 = 3840 / 4;
  const height25 = 2160 / 4;

  const innerWidth = sourceData.width / 4;
  const innerHeight = sourceData.height / 4;

  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    const blob = new Blob([originalCapture], { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    element.src = url;
    return element;
  }, [originalCapture]);

  const initCanvas = async () => {
    var stage = new Konva.Stage({
      container: "container",
      width: width,
      height: height,
    });

    konvaLayer = new Konva.Layer();
    stage.add(konvaLayer);

    var gradientRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: width,
      fillRadialGradientColorStops: videoTrack?.gradient,
    });
    konvaLayer.add(gradientRect);

    var shadowRect = new Konva.Rect({
      x: width / 2 - innerWidth / 2,
      y: height / 2 - innerHeight / 2,
      width: innerWidth,
      height: innerHeight,
      fill: "black",
      cornerRadius: 10,
      shadowColor: "black",
      shadowBlur: 10,
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.5,
    });
    konvaLayer.add(shadowRect);

    var group = new Konva.Group({
      x: width / 2 - innerWidth / 2,
      y: height / 2 - innerHeight / 2,
      clipFunc: function (ctx) {
        ctx.rect(0, 0, innerWidth, innerHeight);
      },
    });

    konvaVideo = new Konva.Image({
      x: 0,
      y: 0,
      image: videoElement,
      width: innerWidth,
      height: innerHeight,
      cornerRadius: 10,
      //   fill: "red",
    });

    // add the shape to the layer
    group.add(konvaVideo);

    konvaLayer.add(group);
  };

  const playVideo = () => {
    videoElement.play();
    playing = true;

    // mouse follow animation
    const refreshRate = 100;
    let point = 0;
    let timeElapsed = 0;

    zoomInterval = setInterval(() => {
      timeElapsed += refreshRate;

      // if (!exporting) {
      //   setCurrentTime(timeElapsed);
      // }

      zoomTracks.forEach((track) => {
        if (
          Math.floor(timeElapsed) <= Math.floor(track.start) &&
          Math.floor(timeElapsed) + refreshRate > Math.floor(track.start)
        ) {
          const divider = 1;
          zoomPoint = {
            x: ((positions[point].x - sourceData.x) / sourceData.width) * width,
            y:
              ((positions[point].y - sourceData.y) / sourceData.height) *
              height,
          };

          zoomingIn = true;
          zoomingOut = false;
        }

        if (
          Math.floor(timeElapsed) < Math.floor(track.end) &&
          Math.floor(timeElapsed) + refreshRate >= Math.floor(track.end)
        ) {
          zoomingIn = false;
          zoomingOut = true;
        }
      });

      point++;

      if (point >= positions.length) {
        // zoomOut(videoElement);
        clearInterval(zoomInterval);
      }
    }, refreshRate);
  };

  const stopVideo = () => {
    videoElement.pause();
    videoElement.currentTime = 0;

    // timeout required to animate to 0
    setTimeout(() => {
      //   anim.stop();
      playing = false;
      resetKonvaLayer();
    }, 1000);
  };

  const resetKonvaLayer = () => {
    konvaLayer.scale({
      x: 1,
      y: 1,
    });
    konvaLayer.position({
      x: 0,
      y: 0,
    });
    konvaLayer.offset({
      x: 0,
      y: 0,
    });

    currentZoomPointX = 0;
    currentZoomPointY = 0;
    currentScaleX = 0;
    currentScaleY = 0;
    zoomingIn = false;
    zoomingOut = false;
  };

  React.useEffect(() => {
    // startup the canvas
    initCanvas();

    // watch for playing state
    // inside interval, to animate zooms
    // works in tandem with playVideo()
    const frameTiming = 1000 / 60;
    let frameIndex = 0; // TODO: set according to currentTime
    const playInterval = setInterval(() => {
      if (playing) {
        if (zoomingIn) {
          // zoom in konvaLayer
          const layerWidth = konvaLayer.width();
          const layerHeight = konvaLayer.height();
          //   const centeredZoomPoint = {
          //     x: zoomPoint.x - layerWidth / 2,
          //     y: zoomPoint.y - layerHeight / 2,
          //   };

          currentZoomPointX =
            currentZoomPointX +
            frictionalAnimation(zoomPoint.x, currentZoomPointX, 0, friction1);

          currentZoomPointY =
            currentZoomPointY +
            frictionalAnimation(zoomPoint.y, currentZoomPointY, 0, friction1);

          // clamp zoom point to video bounds
          if (currentZoomPointX < 0) {
            currentZoomPointX = 0;
          } else if (currentZoomPointX > width - innerWidth) {
            currentZoomPointX = width - innerWidth;
          }

          if (currentZoomPointY < 0) {
            currentZoomPointY = 0;
          } else if (currentZoomPointY > height - innerHeight) {
            currentZoomPointY = height - innerHeight;
          }

          console.info(
            "zooming in",
            zoomPoint.x,
            currentZoomPointX,
            konvaLayer.offsetX()
          );

          let zoomFactor = 2;

          currentScaleX =
            currentScaleX +
            frictionalAnimation(zoomFactor, currentScaleX, 0, friction2);
          currentScaleY =
            currentScaleY +
            frictionalAnimation(zoomFactor, currentScaleY, 0, friction2);

          // clamp scale to video bounds
          if (currentScaleX < 1) {
            currentScaleX = 1;
          } else if (currentScaleX > zoomFactor) {
            currentScaleX = zoomFactor;
          }

          if (currentScaleY < 1) {
            currentScaleY = 1;
          } else if (currentScaleY > zoomFactor) {
            currentScaleY = zoomFactor;
          }

          konvaLayer.scale({
            x: currentScaleX,
            y: currentScaleY,
          });
          konvaLayer.offset({
            x: currentZoomPointX,
            y: currentZoomPointY,
          });
        } else if (zoomingOut) {
          // zoom out konvaLayer
          resetKonvaLayer();
        }

        konvaLayer.draw();
        frameIndex++;
      }
    }, frameTiming);

    // cleanup
    return () => {
      clearInterval(playInterval);
      anim = null;
      konvaLayer = null;
      playing = false;
    };
  }, []);

  // listen for export events
  React.useEffect(() => {
    ipcRenderer.on("export-video-progress", (event, arg) => {
      console.info("exporting video", arg);
    });
  }, []);

  const exportVideo = () => {
    ipcRenderer.send("export-video", {
      duration: Math.round(videoElement.duration * 1000),
      zoomInfo: zoomTracks.map((track) => ({
        start: track.start,
        end: track.end,
        zoom: track.zoomFactor,
      })),
    });
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
      <div id="container"></div>
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
    </>
  );
};

export default KonvaCanvas2;
