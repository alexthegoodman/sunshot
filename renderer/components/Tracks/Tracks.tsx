import * as React from "react";

import styles from "./Tracks.module.scss";

import { TracksProps } from "./Tracks.d";

const Tracks: React.FC<TracksProps> = () => {
  return (
    <section className={styles.tracksContainer}>
      <div className={styles.tracksInner}>
        <div className={`${styles.track} ${styles.videoTrack}`}>
          <div className={styles.trackInner}>
            <div className={styles.item} style={{ left: 0, width: 700 }}></div>
          </div>
        </div>
        <div className={`${styles.track} ${styles.zoomTrack}`}>
          <div className={styles.trackInner}>
            <div
              className={styles.item}
              style={{ left: 100, width: 300 }}
            ></div>
            <div
              className={styles.item}
              style={{ left: 700, width: 200 }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tracks;
