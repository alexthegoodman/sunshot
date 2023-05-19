import {
  VideoTrack,
  ZoomTrack,
} from "../../context/EditorContext/EditorContext";

export interface ZoomPropertiesProps {
  trackKey: string;
  trackData: ZoomTrack;
  updateTrack: (trackKey: string, key: string, value: any) => void;
}
