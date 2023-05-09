import * as React from "react";

import styles from "./EditorCtrls.module.scss";

import { EditorCtrlsProps } from "./EditorCtrls.d";
import Preview from "../Preview/Preview";
import Modal from "../Modal/Modal";
import { ipcRenderer } from "electron";
import { useEditorContext } from "../../context/EditorContext/EditorContext";

const EditorCtrls: React.FC<EditorCtrlsProps> = ({
  positions = null,
  originalCapture = null,
  originalDuration = null,
}) => {
  const [{ videoTrack, zoomTracks }, dispatch] = useEditorContext();
  // const [exportOpen, setExportOpen] = React.useState(false);

  return (
    <>
      <header className={styles.editorCtrls}>
        <div className={styles.editorCtrlsInner}>
          {/* <button className={styles.btn}>Open a Project</button>
          <button className={styles.btn}>Save Project</button> */}
          <button
            className={styles.btn}
            onClick={() => {
              // setExportOpen(true);
              ipcRenderer.sendSync("get-transformed-video", { zoomTracks });
            }}
          >
            Export
          </button>
        </div>
      </header>
      {/* {exportOpen ? (
        <Modal>
          <button></button>
        </Modal>
      ) : (
        <></>
      )} */}
    </>
  );
};

export default EditorCtrls;
