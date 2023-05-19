import {
  VideoTrack,
  ZoomTrack,
} from "../../context/EditorContext/EditorContext";

export interface ZoomPropertiesProps {
  trackData: ZoomTrack;
  updateTrack: (key: string, value: any) => void;
}
