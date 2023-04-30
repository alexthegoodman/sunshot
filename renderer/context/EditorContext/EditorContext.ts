import React, { useState, useReducer } from "react";

export interface EditorContextState {
  videoTrack: any;
  zoomTracks: any;
}

export const EditorContextState = { videoTrack: null, zoomTracks: null };

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
