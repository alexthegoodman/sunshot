import * as React from "react";

import styles from "./Tracks.module.scss";

import { TracksProps } from "./Tracks.d";
import {
  KonvaEasings,
  VideoTrack,
  ZoomTrack,
  useEditorContext,
} from "../../context/EditorContext/EditorContext";
import { randomUUID } from "crypto";

const Tracks: React.FC<TracksProps> = ({
  positions = null,
  originalDuration = null,
}) => {
  const [{ videoTrack, zoomTracks, selectedTrack }, dispatch] =
    useEditorContext();

  const nearestSecond = Math.ceil(originalDuration / 1000) * 1000;
  const seconds = nearestSecond / 1000;

  React.useEffect(() => {
    if (originalDuration) {
      const initalVideoTrack: VideoTrack = {
        id: randomUUID(),
        start: 0,
        end: originalDuration,
      };

      console.info("initalVideoTrack", initalVideoTrack);

      dispatch({ key: "videoTrack", value: initalVideoTrack });

      const testZoomTracks: ZoomTrack[] = [
        // {
        //   id: 1,
        //   start: 1000,
        //   end: 3000,
        //   zoomFactor: 2,
        // },
        {
          id: randomUUID(),
          start: 5000,
          end: 12000,
          zoomFactor: 2,
          easing: KonvaEasings.EaseInOut,
        },
        {
          id: randomUUID(),
          start: 16000,
          end: 25000,
          zoomFactor: 2,
          easing: KonvaEasings.EaseInOut,
        },
      ];

      dispatch({ key: "zoomTracks", value: testZoomTracks });
    }
  }, [originalDuration]);

  const handleZoomTrackClick = (id) => {
    dispatch({ key: "selectedTrack", value: id });
  };

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
            <div
              className={styles.item}
              style={{ left: 0 }}
              onClick={() => handleZoomTrackClick(videoTrack.id)}
            ></div>
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
                  onClick={() => handleZoomTrackClick(id)}
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
