import * as React from "react";

import styles from "./EditorCtrls.module.scss";

import { EditorCtrlsProps } from "./EditorCtrls.d";
import Preview from "../Preview/Preview";
import Modal from "../Modal/Modal";

const EditorCtrls: React.FC<EditorCtrlsProps> = ({
  positions = null,
  originalCapture = null,
  originalDuration = null,
}) => {
  const [exportOpen, setExportOpen] = React.useState(false);

  return (
    <>
      <header className={styles.editorCtrls}>
        <div className={styles.editorCtrlsInner}>
          <button className={styles.btn}>Open a Project</button>
          <button className={styles.btn}>Save Project</button>
          <button
            className={styles.btn}
            onClick={() => {
              setExportOpen(true);
            }}
          >
            Export
          </button>
        </div>
      </header>
      {exportOpen ? (
        <Modal>
          <>
            <div className={styles.exportRecorder}>
              <canvas
                id="exportCanvas"
                style={{ width: 3840, height: 2160 }}
              ></canvas>
              <Preview
                positions={positions}
                originalCapture={originalCapture}
                fullSize={true}
              />
            </div>
          </>
          <button
            className={styles.btn}
            onClick={() => {
              // record contents of exportReccorder

              const canvas = document.getElementById(
                "exportCanvas"
              ) as HTMLCanvasElement;
              const elementToRecord = document.getElementById(
                "exportPreview"
              ) as any;

              const stream = canvas.captureStream();
              const recorder = new MediaRecorder(stream, {
                mimeType: "video/webm",
              });

              recorder.start();

              const ctx = canvas.getContext("2d");
              const framesPerSecond = 30;
              const interval = 1000 / framesPerSecond;

              function recordFrame() {
                ctx.drawImage(
                  elementToRecord,
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
                setTimeout(recordFrame, interval);
              }

              recordFrame();

              recorder.ondataavailable = function (event) {
                if (event.data && event.data.size > 0) {
                  const videoBlob = new Blob([event.data], {
                    type: "video/webm",
                  });
                  const videoUrl = URL.createObjectURL(videoBlob);

                  const videoElement = document.createElement("video");
                  videoElement.src = videoUrl;
                  document.body.appendChild(videoElement);
                }
              };

              setTimeout(function () {
                recorder.stop();
              }, originalDuration);
            }}
          >
            Start Webm Export
          </button>
        </Modal>
      ) : (
        <></>
      )}
    </>
  );
};

export default EditorCtrls;
