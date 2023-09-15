import {
  Position,
  SourceData,
} from "../../context/EditorContext/EditorContext";

export interface KonvaCanvas2Props {
  projectId: string;
  sourceData: SourceData;
  positions: Position[];
  originalCapture: Buffer;
  originalDuration: number;
}
