import { ZoomTrack } from "../../context/EditorContext/EditorContext";

export interface TrackItemProps {
  track: ZoomTrack;
  originalDuration: number;
  handleClick: (trackId: string) => void;
}
