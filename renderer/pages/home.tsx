import React from "react";
import Head from "next/head";
import Link from "next/link";
import electron from "electron";

import styles from "./home.module.scss";

const ipcRenderer = electron.ipcRenderer;
let currentMediaRecorder = null;

function Home() {
  const [message, setMessage] = React.useState("no ipc message");
  const [sources, setSources] = React.useState([]);
  const [selectedSource, setSelectedSource] = React.useState(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [projectId, setProjectId] = React.useState(null);

  const loadSourcePreviews = () => {
    let sources = ipcRenderer.sendSync("get-sources");

    setSources(sources);

    setMessage(JSON.stringify(sources));
  };

  const startRecording = (sourceId) => {
    const { projectId } = ipcRenderer.sendSync("create-project");
    setProjectId(projectId);

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sourceId,
            // 4k size default
            minWidth: 3840,
            maxWidth: 3840,
            minHeight: 2160,
            maxHeight: 2160,
          },
        },
      } as any)
      .then((stream) => {
        console.info("stream", stream);

        const stopRecording = async () => {
          setIsRecording(false);
          // clearInterval(captureInterval);
          ipcRenderer.sendSync("stop-mouse-tracking", { projectId });
          console.info("stop-mouse-tracking");

          stream.getTracks()[0].stop();
          const blob = new Blob(chunks, { type: "video/webm" });

          const arrayBuffer = await blob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          // const newBlob = new Blob([buffer]);

          // console.info("blog chunks", blob, chunks, buffer);

          ipcRenderer.sendSync("save-video-blob", {
            projectId,
            buffer,
            sourceId,
          });
          console.info("save-video-blob");

          ipcRenderer.sendSync("close-source-picker");
          ipcRenderer.sendSync("open-editor", { projectId });

          // const url = URL.createObjectURL(blob);
          // const videoElement = document.createElement("video");
          // videoElement.src = url;
          // videoElement.controls = true;
          // videoElement.autoplay = true;
          // videoElement.width = 3840 / 4;
          // videoElement.height = 2160 / 4;
          // document.body.appendChild(videoElement);
        };

        const chunks = [];
        currentMediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp9",
        });
        currentMediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        currentMediaRecorder.onerror = (e) =>
          console.error("mediaRecorder error", e);
        currentMediaRecorder.onstop = stopRecording;
        currentMediaRecorder.start();

        ipcRenderer.sendSync("start-mouse-tracking");

        setIsRecording(true);

        console.info("start-mouse-tracking");
      })
      .catch((error) => console.log(error));
  };

  const handleStopRecording = () => {
    currentMediaRecorder.stop();
  };

  React.useEffect(() => {
    loadSourcePreviews();

    // ipcRenderer.on("ping-pong", (event, data) => {
    //   setMessage(data);
    // });

    return () => {
      // ipcRenderer.removeAllListeners("ping-pong");
    };
  }, []);

  const handleOpenProject = () => {
    // ipcRenderer.sendSync("open-project");
  };

  const handleStartRecording = () => {
    // ipcRenderer.sendSync("start-recording");
    startRecording(selectedSource);
  };

  const handleSourceSelect = (event) => {
    const sourceId = event.target.id.split("-")[1];
    setSelectedSource(sourceId);
  };

  return (
    <React.Fragment>
      <Head>
        <title>SunShot - Beautiful Screen Recordings</title>
      </Head>
      <main className={styles.main}>
        {/* {message} */}
        <div className={styles.sources}>
          <h1>Select Your Video Source</h1>
          <ul className={styles.sourceGrid}>
            {sources?.map((source) => (
              <li
                key={source.id}
                id={`video-${source.id}`}
                className={source.id === selectedSource ? styles.selected : ""}
                onClick={handleSourceSelect}
              >
                {source.name}
              </li>
            ))}
          </ul>

          <div className={styles.ctrls}>
            {isRecording ? (
              <button className={styles.btn} onClick={handleStopRecording}>
                Stop Recording
              </button>
            ) : (
              <button
                className={styles.btn}
                onClick={handleStartRecording}
                disabled={selectedSource ? false : true}
              >
                Start Recording
              </button>
            )}

            <button className={styles.btn} onClick={handleOpenProject}>
              Open a Project
            </button>
            {/* <button onClick={handleOpenEditor}>Open Editor</button> */}
          </div>
        </div>
      </main>
    </React.Fragment>
  );
}

export default Home;
