import * as React from "react";

import styles from "./Tracks.module.scss";

import { TracksProps } from "./Tracks.d";
import { useEditorContext } from "../../context/EditorContext/EditorContext";

const Tracks: React.FC<TracksProps> = ({
  positions = null,
  originalDuration = null,
}) => {
  const [{ videoTrack, zoomTracks }, dispatch] = useEditorContext();

  const nearestSecond = Math.ceil(originalDuration / 1000) * 1000;
  const seconds = nearestSecond / 1000;

  React.useEffect(() => {
    // const testZoomTracks = [
    //   {
    //     id: 1,
    //     start: 3000,
    //     end: 13000,
    //     zoomFactor: 2,
    //   },
    //   {
    //     id: 2,
    //     start: 18000,
    //     end: 23000,
    //     zoomFactor: 3,
    //   },
    //   {
    //     id: 3,
    //     start: 35000,
    //     end: 45000,
    //     zoomFactor: 3,
    //   },
    // ];

    const testZoomTracks = [
      // {
      //   id: 1,
      //   start: 1000,
      //   end: 3000,
      //   zoomFactor: 2,
      // },
      {
        id: 1,
        start: 3000,
        end: 7000,
        zoomFactor: 2,
      },

      {
        id: 1,
        start: 10000,
        end: 13000,
        zoomFactor: 2,
      },
    ];

    dispatch({ key: "zoomTracks", value: testZoomTracks });
  }, []);

  return (
    <section className={styles.tracksContainer}>
      <div className={styles.tracksInner}>
        <div className={styles.ticks}>
          {new Array(seconds).fill(0).map((x, i) => {
            return (
              <div className={styles.tick}>
                <span>{i + 1}</span>
              </div>
            );
          })}
        </div>
        <div className={`${styles.track} ${styles.videoTrack}`}>
          <div className={styles.trackInner}>
            <div className={styles.item} style={{ left: 0 }}></div>
          </div>
        </div>
        <div className={`${styles.track} ${styles.zoomTrack}`}>
          <div className={styles.trackInner}>
            {zoomTracks?.map((track) => {
              const { id, start, end, zoomFactor } = track;
              const width = ((end - start) / originalDuration) * 100;
              const left = (start / originalDuration) * 100;

              return (
                <div
                  key={id}
                  className={styles.item}
                  style={{ left: `${left}%`, width: `${width}%` }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tracks;
