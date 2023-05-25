import * as React from "react";

// import styles from "./VideoProperties.module.scss";

import { VideoPropertiesProps } from "./VideoProperties.d";
import { styled } from "styled-components";

export const gradients = [
  {
    konvaProps: [0, "#FFE53B", 1, "#FF2525"],
    cssProps: "linear-gradient(147deg, #FFE53B 0%, #FF2525 74%)",
  },
  {
    konvaProps: [0, "#F7CE68", 1, "#FBAB7E"],
    cssProps: "linear-gradient(145deg, #F7CE68 0%, #FBAB7E 100%)",
  },
  {
    konvaProps: [0, "#0093E9", 1, "#80D0C7"],
    cssProps: "linear-gradient(145deg, #0093E9 0%, #80D0C7 100%)",
  },
  {
    konvaProps: [0, "#F4D03F", 1, "#16A085"],
    cssProps: "linear-gradient(145deg, #F4D03F, #16A085)",
  },
  {
    konvaProps: [0, "#FFCC70", 1, "#C850C0"],
    cssProps: "linear-gradient(145deg, #FFCC70, #C850C0)",
  },
  {
    konvaProps: [0, "rgba(61,131,97,1)", 1, "rgba(28,103,88,1)"],
    cssProps:
      "linear-gradient(145deg, rgba(61,131,97,1) 0%, rgba(28,103,88,1) 100% )",
  },
  {
    konvaProps: [0, "rgba(150,93,233,1)", 1, "rgba(99,88,238,1)"],
    cssProps:
      "linear-gradient(145deg, rgba(150,93,233,1) 0%, rgba(99,88,238,1) 100%)",
  },
  {
    konvaProps: [0, "rgba(249,151,119,1)", 1, "rgba(98,58,162,1)"],
    cssProps:
      "linear-gradient(145deg, rgba(249,151,119,1) 0%, rgba(98,58,162,1) 100%)",
  },
  {
    konvaProps: [0, "rgba(231,76,60,1)", 1, "rgba(203,67,53,1)"],
    cssProps:
      "linear-gradient(145deg, rgba(231,76,60,1) 0%, rgba(203,67,53,1) 100%)",
  },
];

const GradientGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;

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
              updateTrack("gradient", gradient.konvaProps);
            }}
          ></div>
        ))}
      </GradientGrid>
    </div>
  );
};

export default VideoProperties;
