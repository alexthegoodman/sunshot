import { SourceData } from "../../context/EditorContext/EditorContext";

export interface SunCanvasProps {
  projectId: string;
  sourceData: SourceData;
  originalCapture: Buffer;
}
