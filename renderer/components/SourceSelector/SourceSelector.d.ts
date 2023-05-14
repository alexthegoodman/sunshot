export interface SourceSelectorProps {
  sources: any[];
  selectedSource: string;
  onSourceSelect: (sourceId: string) => void;
}
