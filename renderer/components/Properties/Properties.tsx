import * as React from "react";

import styles from "./Properties.module.scss";
// import shared from "../../pages/shared.module.scss";

import styled from "styled-components";

import { PropertiesProps } from "./Properties.d";
import {
  KonvaEasingLabels,
  VideoTrack,
  ZoomTrack,
  useEditorContext,
} from "../../context/EditorContext/EditorContext";
import NumberField from "../NumberField/NumberField";
import SelectField from "../SelectField/SelectField";

const FlexForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Properties: React.FC<PropertiesProps> = () => {
  const [{ videoTrack, zoomTracks, selectedTrack }, dispatch] =
    useEditorContext();

  const trackData =
    videoTrack?.id === selectedTrack
      ? videoTrack
      : (zoomTracks?.find((track) => track.id === selectedTrack) as any);
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

  const easingOptions = Object.values(KonvaEasingLabels).map((label, i) => ({
    id: `${i}`,
    label,
  }));
  const selectedEasingId = easingOptions.find(
    (option) => KonvaEasingLabels[trackData?.easing] === option.label
  )?.id;

  return (
    <section
      className={`${styles.properties} spectrum-Typography`}
      style={{ padding: "0 25px" }}
    >
      {trackData ? (
        <>
          {trackKey === "videoTrack" ? (
            <div>
              <h1
                className={`${styles.headline} spectrum-Heading spectrum-Heading--sizeL`}
              >
                Video Properties
              </h1>
              <div>Gradient</div>
            </div>
          ) : (
            <div>
              <h1
                className={`${styles.headline} spectrum-Heading spectrum-Heading--sizeL`}
              >
                Zoom Properties
              </h1>
              <FlexForm>
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
                <NumberField
                  id="zoomFactor"
                  label="Zoom"
                  value={trackData.zoomFactor}
                  onChange={(e) => {
                    const zoomFactor = parseInt(e.target.value);
                    updateTrack(trackKey, "zoomFactor", zoomFactor);
                  }}
                />
                <SelectField
                  id="easing"
                  label="Easing"
                  items={easingOptions}
                  selectedItem={selectedEasingId}
                  onItemSelect={(id) => {
                    const easing = easingOptions.find(
                      (option) => option.id === id
                    );
                    const easingKey = Object.keys(KonvaEasingLabels).find(
                      (key) => KonvaEasingLabels[key] === easing.label
                    );
                    console.info("onItemSelect", id, easing, easingKey);
                    updateTrack(trackKey, "easing", easingKey);
                  }}
                />
              </FlexForm>
            </div>
          )}
        </>
      ) : (
        <div>
          <h1 className="spectrum-Heading spectrum-Heading--sizeL">
            Properties
          </h1>
          <span>Select a track to edit its properties</span>
        </div>
      )}
    </section>
  );
};

export default Properties;
