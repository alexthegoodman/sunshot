import * as React from "react";

// import styles from "./Tracks.module.scss";

import { TracksProps } from "./Tracks.d";
import {
  KonvaEasings,
  VideoTrack,
  ZoomTrack,
  useEditorContext,
} from "../../context/EditorContext/EditorContext";
import { randomUUID } from "crypto";
import { styled } from "styled-components";
import TrackItem from "../TrackItem/TrackItem";
import { motion } from "framer-motion";
import { useElementSize } from "usehooks-ts";
import { gradients } from "../VideoProperties/VideoProperties";

const TracksContainer = styled.section`
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
  /* background-color: #f3f3f3; */
  background-color: transparent;

  user-select: none;

  .tracksInner {
    position: relative;

    .trackLength {
      position: absolute;
      left: 5px;
    }
    .ticks {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      width: 100%;
      margin: 7px 0;

      .tick {
        display: flex;
        flex-direction: row;
        justify-content: right;
        width: 100%;

        span {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          // background-color: var(--spectrum-accent-background-color-default);
          background-color: #b5b9cf;
          color: white;
          font-size: 12px;
        }
      }
    }

    .track {
      background-color: transparent;
      margin-bottom: 10px;
      position: relative;

      .trackInner {
        position: relative;
        height: 100px;

        .item {
          position: absolute;
          height: 100%;
          background-color: white;
          box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
          border-radius: 7px;
          overflow: hidden;
          cursor: pointer;
          transition: 0.2s all ease-in-out;

          opacity: 0.8;

          .leftHandle,
          .rightHandle {
            position: absolute;
            top: 0;
            width: 15px;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
          }

          .leftHandle {
            left: 0;
          }

          .rightHandle {
            right: 0;
          }

          .itemHandle {
            position: absolute;
            top: 0;
            left: 15px;
            width: calc(100% - 30px);
            height: 100%;
          }

          .ctrls {
            position: absolute;
            top: 3px;
            right: 18px;

            button {
              border: none;
              outline: none;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 50%;
              box-shadow: none;
              cursor: pointer;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 20px;
              height: 20px;
              color: white;
            }
          }

          .name {
            display: block;
            margin: 4px;
            padding: 3px;
            background: rgba(0, 0, 0, 0.2);
            width: fit-content;
            border-radius: 5px;
            color: white;
            font-size: 12px;
          }

          &:hover {
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
            transition: 0.2s all ease-in-out;
          }
        }
      }

      &.videoTrack {
        .trackInner {
          .item {
            width: calc(100% - 10px);
            left: 5px;

            // blue to  light blue gradient
            background: radial-gradient(
              50% 50% at 0% 100%,
              #02b8dc 0%,
              #00d4ff 100%
            );
          }
        }
      }
      &.zoomTrack {
        .trackInner {
          .item {
            background-color: white;

            // green to light green gradient
            background: radial-gradient(
              50% 50% at 0% 100%,
              #70eb40 0%,
              #81f553 100%
            );
          }
        }
      }

      .trackCtrls {
        position: absolute;
        top: 0;
        right: 0px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        button {
          width: 25px;
          height: 25px;
          background: #73d84b;
          border: none;
          outline: none;
          border-radius: 50%;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }
`;

const Tracks: React.FC<TracksProps> = ({
  positions = null,
  originalDuration = null,
}) => {
  const [{ videoTrack, zoomTracks, selectedTrack }, dispatch] =
    useEditorContext();

  const [trackRef, { width: trackWidth, height: trackHeight }] =
    useElementSize();

  const constraintsRef = React.useRef(null);

  const nearestSecond = Math.ceil(originalDuration / 1000) * 1000;
  const seconds = nearestSecond / 1000;
  const numTicks = 10;
  const tickSpace = seconds / numTicks;

  // for testing only
  React.useEffect(() => {
    if (originalDuration && !zoomTracks) {
      const initalVideoTrack: VideoTrack = {
        id: randomUUID(),
        name: "Video Track",
        start: 0,
        end: originalDuration,
        gradient: gradients[0].konvaProps,
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
          name: "Zoom Track",
          start: 5000,
          end: 12000,
          zoomFactor: 0.5,
          easing: KonvaEasings.EaseInOut,
        },
        {
          id: randomUUID(),
          name: "Zoom Track",
          start: 16000,
          end: 25000,
          zoomFactor: 0.5,
          easing: KonvaEasings.EaseInOut,
        },
      ];

      dispatch({ key: "zoomTracks", value: testZoomTracks });
    }
  }, [originalDuration]);

  const handleTrackClick = (id) => {
    dispatch({ key: "selectedTrack", value: id });
  };

  const updateZoomTrack = (trackId, key, value, batch = false) => {
    const updatedZoomTracks = zoomTracks.map((track) => {
      if (track.id === trackId) {
        if (batch) {
          let newTrack = { ...track };
          value.forEach((v) => {
            newTrack = { ...newTrack, [v.key]: v.value };
          });
          return newTrack;
        } else {
          return { ...track, [key]: value };
        }
      }
      return track;
    });
    dispatch({ key: "zoomTracks", value: updatedZoomTracks });
  };

  const handleTrackAdd = () => {
    const newTrack: ZoomTrack = {
      id: randomUUID(),
      name: "Zoom Track",
      start: 0,
      end: 3000,
      zoomFactor: 2,
      easing: KonvaEasings.EaseInOut,
    };

    dispatch({ key: "zoomTracks", value: [...zoomTracks, newTrack] });
  };

  return (
    <TracksContainer>
      <div className={"tracksInner"}>
        <div className={"ticks"}>
          <span className="trackLength">
            {Math.round(originalDuration / 1000)}s
          </span>
          {new Array(numTicks).fill(0).map((x, i) => {
            return (
              <div className={"tick"}>
                <span>{Math.round(tickSpace * (i + 1))}</span>
              </div>
            );
          })}
        </div>
        <div className={`track videoTrack`} id="videoTrackWrapper">
          <div className={"trackInner"}>
            <div
              id="videoTrack"
              className={"item"}
              style={{ left: 5 }}
              onClick={() => handleTrackClick(videoTrack.id)}
            >
              <span className="name">{videoTrack?.name}</span>
            </div>
          </div>
        </div>
        <div className={`track zoomTrack`} ref={trackRef}>
          <motion.div className={"trackInner"} ref={constraintsRef}>
            {zoomTracks?.map((track) => {
              return (
                <TrackItem
                  updateTrack={updateZoomTrack}
                  constraintsRef={constraintsRef}
                  track={track}
                  trackWidth={trackWidth}
                  trackHeight={trackHeight}
                  originalDuration={originalDuration}
                  handleClick={handleTrackClick}
                />
              );
            })}
          </motion.div>
          <div className="trackCtrls">
            <button onClick={handleTrackAdd} title="Add Zoom Track">
              <i className="ph ph-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </TracksContainer>
  );
};

export default Tracks;
