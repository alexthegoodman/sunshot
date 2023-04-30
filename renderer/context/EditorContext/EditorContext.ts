import React, { useState, useReducer } from "react";

export interface EditorContextState {
  count: number;
}

export const EditorContextState = { count: 0 };

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
        [action.type]: action.payload,
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
