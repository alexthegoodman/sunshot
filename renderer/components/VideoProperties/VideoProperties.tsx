import * as React from "react";

// import styles from "./VideoProperties.module.scss";

import { VideoPropertiesProps } from "./VideoProperties.d";
import { styled } from "styled-components";

export const gradients = [
  {
    konvaProps: [0, "#FFE53B", 1, "#FF2525"],
    cssProps: "linear-gradient(147deg, #FFE53B 0%, #FF2525 74%)",
    exportProps: {
      start: { r: 255, g: 229, b: 59 },
      end: { r: 255, g: 37, b: 37 },
    },
  },
  {
    konvaProps: [0, "#F7CE68", 1, "#FBAB7E"],
    cssProps: "linear-gradient(145deg, #F7CE68 0%, #FBAB7E 100%)",
    exportProps: {
      start: { r: 247, g: 206, b: 104 },
      end: { r: 251, g: 171, b: 126 },
    },
  },
  {
    konvaProps: [0, "#0093E9", 1, "#80D0C7"],
    cssProps: "linear-gradient(145deg, #0093E9 0%, #80D0C7 100%)",
    exportProps: {
      start: { r: 0, g: 147, b: 233 },
      end: { r: 128, g: 208, b: 199 },
    },
  },
  {
    konvaProps: [0, "#F4D03F", 1, "#16A085"],
    cssProps: "linear-gradient(145deg, #F4D03F, #16A085)",
    exportProps: {
      start: { r: 244, g: 208, b: 63 },
      end: { r: 22, g: 160, b: 133 },
    },
  },
  {
    konvaProps: [0, "#FFCC70", 1, "#C850C0"],
    cssProps: "linear-gradient(145deg, #FFCC70, #C850C0)",
    exportProps: {
      start: { r: 255, g: 204, b: 112 },
      end: { r: 200, g: 80, b: 192 },
    },
  },
  {
    konvaProps: [0, "rgba(61,131,97,1)", 1, "rgba(28,103,88,1)"],
    cssProps:
      "linear-gradient(145deg, rgba(61,131,97,1) 0%, rgba(28,103,88,1) 100% )",
    exportProps: {
      start: { r: 61, g: 131, b: 97 },
      end: { r: 28, g: 103, b: 88 },
    },
  },
  {
    konvaProps: [0, "rgba(150,93,233,1)", 1, "rgba(99,88,238,1)"],
    cssProps:
      "linear-gradient(145deg, rgba(150,93,233,1) 0%, rgba(99,88,238,1) 100%)",
    exportProps: {
      start: { r: 150, g: 93, b: 233 },
      end: { r: 99, g: 88, b: 238 },
    },
  },
  {
    konvaProps: [0, "rgba(249,151,119,1)", 1, "rgba(98,58,162,1)"],
    cssProps:
      "linear-gradient(145deg, rgba(249,151,119,1) 0%, rgba(98,58,162,1) 100%)",
    exportProps: {
      start: { r: 249, g: 151, b: 119 },
      end: { r: 98, g: 58, b: 162 },
    },
  },
  {
    konvaProps: [0, "rgba(231,76,60,1)", 1, "rgba(203,67,53,1)"],
    cssProps:
      "linear-gradient(145deg, rgba(231,76,60,1) 0%, rgba(203,67,53,1) 100%)",
    exportProps: {
      start: { r: 231, g: 76, b: 60 },
      end: { r: 203, g: 67, b: 53 },
    },
  },
];

const GradientGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-top: 15px;

  .gradient {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    cursor: pointer;
  }
`;

const VideoProperties: React.FC<VideoPropertiesProps> = ({
  trackData = null,
  updateTrack = () => console.info("updateTrack"),
}) => {
  return (
    <div>
      <h1 className={`spectrum-Heading spectrum-Heading--sizeL`}>
        Video Properties
      </h1>
      <GradientGrid>
        {gradients.map((gradient, i) => (
          <div
            key={i}
            className="gradient"
            style={{
              background: gradient.cssProps,
            }}
            onClick={() => {
              updateTrack("gradient", gradient);
            }}
          ></div>
        ))}
      </GradientGrid>
    </div>
  );
};

export default VideoProperties;
