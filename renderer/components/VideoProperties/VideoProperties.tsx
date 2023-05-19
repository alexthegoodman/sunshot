import * as React from "react";

import styles from "./VideoProperties.module.scss";

import { VideoPropertiesProps } from "./VideoProperties.d";

const VideoProperties: React.FC<VideoPropertiesProps> = ({
  trackData = null,
  updateTrack = () => console.info("updateTrack"),
}) => {
  return (
    <div>
      <h1
        className={`${styles.headline} spectrum-Heading spectrum-Heading--sizeL`}
      >
        Video Properties
      </h1>
      <div>Gradient</div>
    </div>
  );
};

export default VideoProperties;
