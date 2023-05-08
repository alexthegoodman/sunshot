import React, { useState, useReducer } from "react";

export interface SourceData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
  timestamp: number;
}

export interface Track {
  id: string;
  start: number;
  end: number;
}

export interface VideoTrack extends Track {}

export interface ZoomTrack extends Track {
  zoomFactor: number;
}

export interface EditorContextState {
  videoTrack: VideoTrack | null;
  zoomTracks: ZoomTrack[] | null;
  selectedTrack: string | null;
}

export const EditorContextState = {
  videoTrack: null,
  zoomTracks: null,
  selectedTrack: null,
};

export const EditorContextReducer = (
  state: EditorContextState,
  action: any
) => {
  switch (action.type) {
    // case value:
    //   break;

    default:
      return {
        ...state,
        [action.key]: action.value,
      };
      break;
  }
};

export const EditorContext = React.createContext<{
  state: EditorContextState;
  dispatch: React.Dispatch<any>;
}>({
  state: EditorContextState,
  dispatch: () => undefined,
});

export const useEditorContext = () =>
  React.useContext(EditorContext) as unknown as any;
