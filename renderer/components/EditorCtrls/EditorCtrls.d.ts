import { Position } from "../../context/EditorContext/EditorContext";

export interface EditorCtrlsProps {
  positions: Position[];
  originalCapture?: Buffer;
  originalDuration: number;
}
