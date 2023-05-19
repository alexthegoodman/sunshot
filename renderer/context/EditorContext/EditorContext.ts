import React, { useState, useReducer } from "react";

export enum KonvaEasings {
  Linear = "Linear",
  EaseIn = "EaseIn",
  EaseOut = "EaseOut",
  EaseInOut = "EaseInOut",
  BackEaseIn = "BackEaseIn",
  BackEaseOut = "BackEaseOut",
  BackEaseInOut = "BackEaseInOut",
  ElasticEaseIn = "ElasticEaseIn",
  ElasticEaseOut = "ElasticEaseOut",
  ElasticEaseInOut = "ElasticEaseInOut",
  BounceEaseIn = "BounceEaseIn",
  BounceEaseOut = "BounceEaseOut",
  BounceEaseInOut = "BounceEaseInOut",
  StrongEaseIn = "StrongEaseIn",
  StrongEaseOut = "StrongEaseOut",
  StrongEaseInOut = "StrongEaseInOut",
}

export enum KonvaEasingLabels {
  Linear = "Linear",
  EaseIn = "Ease In",
  EaseOut = "Ease Out",
  EaseInOut = "Ease In Out",
  BackEaseIn = "Back Ease In",
  BackEaseOut = "Back Ease Out",
  BackEaseInOut = "Back Ease In Out",
  ElasticEaseIn = "Elastic Ease In",
  ElasticEaseOut = "Elastic Ease Out",
  ElasticEaseInOut = "Elastic Ease In Out",
  BounceEaseIn = "Bounce Ease In",
  BounceEaseOut = "Bounce Ease  Out",
  BounceEaseInOut = "Bounce Ease In Out",
  StrongEaseIn = "Strong Ease In",
  StrongEaseOut = "Strong Ease Out",
  StrongEaseInOut = "Strong Ease In Out",
}

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
  easing: KonvaEasings;
}

export interface EditorContextState {
  videoTrack: VideoTrack | null;
  zoomTracks: ZoomTrack[] | null;
  selectedTrack: string | null;
  currentTime: number;
  playing: boolean;
  stopped: boolean;
  exporting: boolean;
}

export const EditorContextState = {
  videoTrack: null,
  zoomTracks: null,
  selectedTrack: null,
  currentTime: 0,
  playing: false,
  stopped: true,
  exporting: false,
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
  React.useContext(EditorContext) as unknown as [
    EditorContextState,
    React.Dispatch<any>
  ];
