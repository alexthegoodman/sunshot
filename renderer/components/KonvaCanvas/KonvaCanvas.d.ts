import {
  Position,
  SourceData,
} from "../../context/EditorContext/EditorContext";

export interface KonvaCanvasProps {
  positions: Position[];
  originalCapture: Buffer;
  originalCapture25?: Buffer;
  sourceData: SourceData;
}
