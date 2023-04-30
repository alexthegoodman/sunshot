import * as React from "react";

import styles from "./Tracks.module.scss";

import { TracksProps } from "./Tracks.d";

const Tracks: React.FC<TracksProps> = () => {
  return <section className={styles.tracksContainer}>Tracks</section>;
};

export default Tracks;
