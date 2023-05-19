import { VideoTrack } from "../../context/EditorContext/EditorContext";

export interface VideoPropertiesProps {
  trackData: VideoTrack;
  updateTrack: (key: string, value: any) => void;
}
