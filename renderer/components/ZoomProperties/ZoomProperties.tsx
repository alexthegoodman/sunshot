import * as React from "react";

// import styles from "./ZoomProperties.module.scss";

import { ZoomPropertiesProps } from "./ZoomProperties.d";

import {
  KonvaEasingLabels,
  VideoTrack,
  ZoomTrack,
  useEditorContext,
} from "../../context/EditorContext/EditorContext";
import NumberField from "../NumberField/NumberField";
import SelectField from "../SelectField/SelectField";
import { FlexForm } from "../SharedStyles/SharedStyles";
import SliderField from "../SliderField/SliderField";

export const zooms = [
  {
    id: "0",
    label: "150%",
    previewValue: 1.5,
    exportValue: 0.6667,
  },
  {
    id: "1",
    label: "200%",
    previewValue: 2,
    exportValue: 0.5,
  },
  {
    id: "2",
    label: "250%",
    previewValue: 2.5,
    exportValue: 0.4,
  },
  {
    id: "3",
    label: "300%",
    previewValue: 3,
    exportValue: 0.3333,
  },
  {
    id: "4",
    label: "350%",
    previewValue: 3.5,
    exportValue: 0.2857,
  },
  {
    id: "5",
    label: "400%",
    previewValue: 4,
    exportValue: 0.25,
  },
];

const ZoomProperties: React.FC<ZoomPropertiesProps> = ({
  trackData = null,
  updateTrack = () => console.info("updateTrack"),
}) => {
  const easingOptions = Object.values(KonvaEasingLabels).map((label, i) => ({
    id: `${i}`,
    label,
  }));
  const selectedEasingId = easingOptions.find(
    (option) => KonvaEasingLabels[trackData?.easing] === option.label
  )?.id;

  return (
    <div>
      <h1 className={`spectrum-Heading spectrum-Heading--sizeL`}>
        Zoom Properties
      </h1>
      <FlexForm>
        {/* <NumberField
          id="start"
          label="Start"
          value={trackData.start}
          onChange={(e) => {
            const start = parseInt(e.target.value);
            updateTrack("start", start);
          }}
        />
        <NumberField
          id="end"
          label="End"
          value={trackData.end}
          onChange={(e) => {
            const end = parseInt(e.target.value);
            updateTrack("end", end);
          }}
        /> */}
        {/* <NumberField
          id="zoomFactor"
          label="Zoom"
          value={trackData.zoomFactor}
          onChange={(e) => {
            const zoomFactor = parseInt(e.target.value);
            updateTrack("zoomFactor", zoomFactor);
          }}
        /> */}
        {/* <SliderField
          id="zoomFactor"
          label="Zoom"
          value={trackData.zoomFactor}
          onChange={(e) => {
            const zoomFactor = parseFloat(e.target.value);
            updateTrack("zoomFactor", zoomFactor);
          }}
        /> */}
        <SelectField
          id="zoomFactor"
          label="Zoom"
          items={zooms}
          selectedItem={trackData.zoomFactor.id}
          onItemSelect={(id) => {
            const zoom = zooms.find((option) => option.id === id);
            updateTrack("zoomFactor", zoom);
          }}
        />
        {/* <SelectField
          id="easing"
          label="Easing"
          items={easingOptions}
          selectedItem={selectedEasingId}
          onItemSelect={(id) => {
            const easing = easingOptions.find((option) => option.id === id);
            const easingKey = Object.keys(KonvaEasingLabels).find(
              (key) => KonvaEasingLabels[key] === easing.label
            );
            console.info("onItemSelect", id, easing, easingKey);
            updateTrack("easing", easingKey);
          }}
        /> */}
      </FlexForm>
    </div>
  );
};

export default ZoomProperties;
