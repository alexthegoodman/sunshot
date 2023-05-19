import { VideoTrack } from "../../context/EditorContext/EditorContext";

export interface VideoPropertiesProps {
  trackKey: string;
  trackData: VideoTrack;
  updateTrack: (trackKey: string, key: string, value: any) => void;
}
