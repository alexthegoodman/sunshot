import * as React from "react";

import styles from "./Properties.module.scss";

import { PropertiesProps } from "./Properties.d";
import { useEditorContext } from "../../context/EditorContext/EditorContext";
import NumberField from "../NumberField/NumberField";

const Properties: React.FC<PropertiesProps> = () => {
  const [{ videoTrack, zoomTracks, selectedTrack }, dispatch] =
    useEditorContext();

  const trackData =
    videoTrack?.id === selectedTrack
      ? videoTrack
      : zoomTracks?.find((track) => track.id === selectedTrack);
  const trackKey =
    trackData?.id === videoTrack?.id ? "videoTrack" : "zoomTracks";

  const updateTrack = (trackKey, key, value) => {
    if (trackKey === "videoTrack") {
      dispatch({ key: "videoTrack", value: { ...trackData, [key]: value } });
    } else {
      const updatedZoomTracks = zoomTracks.map((track) => {
        if (track.id === selectedTrack) {
          return { ...track, [key]: value };
        }
        return track;
      });
      dispatch({ key: "zoomTracks", value: updatedZoomTracks });
    }
  };

  return (
    <section>
      {trackData ? (
        <div>
          <h1>
            {trackKey === "videoTrack" ? "Video Properties" : "Zoom Properties"}
          </h1>
          <div>
            <NumberField
              id="start"
              label="Start"
              value={trackData.start}
              onChange={(e) => {
                const start = parseInt(e.target.value);
                updateTrack(trackKey, "start", start);
              }}
            />
            <NumberField
              id="end"
              label="End"
              value={trackData.end}
              onChange={(e) => {
                const end = parseInt(e.target.value);
                updateTrack(trackKey, "end", end);
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          <h1>Properties</h1>
          <span>Select a track to edit its properties</span>
        </div>
      )}
    </section>
  );
};

export default Properties;
