import { ZoomTrack } from "../../context/EditorContext/EditorContext";

export interface TrackItemProps {
  track: ZoomTrack;
  originalDuration: number;
  handleClick: (trackId: string) => void;
  constraintsRef: React.RefObject<HTMLDivElement>;
  trackWidth: number;
  trackHeight: number;
  updateTrack: (
    trackId: string,
    prop: string,
    value: any,
    batch?: boolean
  ) => void;
}
