import * as React from "react";

import Konva from "konva";

import { KonvaCanvas2Props } from "./KonvaCanvas2.d";
import { useEditorContext } from "../../context/EditorContext/EditorContext";
import { styled } from "styled-components";

const VideoCtrls = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 15px;
  padding: 15px 0;
`;

var anim = null;
var layer = null;
var playing = false;
const KonvaCanvas2: React.FC<KonvaCanvas2Props> = ({
  projectId = null,
  sourceData = null,
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

    layer = new Konva.Layer();
    stage.add(layer);

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
    layer.add(gradientRect);

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
    layer.add(shadowRect);

    var group = new Konva.Group({
      x: width / 2 - innerWidth / 2,
      y: height / 2 - innerHeight / 2,
      clipFunc: function (ctx) {
        ctx.rect(0, 0, innerWidth, innerHeight);
      },
    });

    var video = new Konva.Image({
      x: 0,
      y: 0,
      image: videoElement,
      width: innerWidth,
      height: innerHeight,
      cornerRadius: 10,
      //   fill: "red",
    });

    // add the shape to the layer
    group.add(video);

    layer.add(group);

    // anim = new Konva.Animation(function () {
    //   // do nothing, animation just need to update the layer
    // }, layer);
    playing = true;
  };

  const playVideo = () => {
    videoElement.play();
    // anim.start();
  };

  const stopVideo = () => {
    videoElement.pause();
    videoElement.currentTime = 0;

    // timeout required to animate to 0
    setTimeout(() => {
      //   anim.stop();
      playing = false;
    }, 1000);
  };

  React.useEffect(() => {
    initCanvas();

    const frameTiming = 1000 / 60;
    const playInterval = setInterval(() => {
      if (playing) {
        layer.draw();
      }
    }, frameTiming);

    return () => {
      clearInterval(playInterval);
    };
  }, []);

  return (
    <>
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
