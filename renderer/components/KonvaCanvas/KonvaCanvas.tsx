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

class URLImage extends React.Component {
  state = {
    image: null,
  };
  componentDidMount() {
    this.loadImage();
  }
  componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.loadImage();
    }
  }
  componentWillUnmount() {
    this.image.removeEventListener("loadeddata", this.handleLoad);
  }
  loadImage() {
    // save to "this" to remove "load" handler on unmount
    // this.image = new window.Image();
    // this.image.src = this.props.src;
    console.info("load image");
    this.image = document.createElement("video") as HTMLVideoElement;

    var source = document.createElement("source");

    source.src = this.props.src;
    source.type = "video/webm";

    this.image.appendChild(source);

    // this.image.setAttribute("src", this.props.src);
    this.image.addEventListener("loadeddata", this.handleLoad);

    document.getElementsByTagName("body")[0].appendChild(this.image);
  }
  handleLoad = () => {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed
    console.info("loaded", this.image);
    this.setState({
      image: this.image,
    });
    // if you keep same image object during source updates
    // you will have to update layer manually:
    // this.imageNode.getLayer().batchDraw();
  };
  render() {
    return (
      <Image
        x={this.props.x}
        y={this.props.y}
        width={this.props.width}
        height={this.props.height}
        image={this.state.image as HTMLVideoElement}
        ref={(node) => {
          this.imageNode = node;
        }}
      />
    );
  }
}

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
          {/* <Image image={}></Image> */}
          {/* <Image
            image={
              new Konva.Image({
                width: 100,
                height: 100,
              })
            }
          ></Image> */}
          {/* <URLImage
            src="/originalCapture.webm"
            x={150}
            width={width25}
            height={height25}
          /> */}
          <Video src="/originalCapture.webm" />
        </Group>
      </Layer>
    </Stage>
  );
};

export default KonvaCanvas;
