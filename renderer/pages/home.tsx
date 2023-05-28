import React from "react";
import Head from "next/head";
import Link from "next/link";
import electron from "electron";

import styles from "./home.module.scss";
import SourceSelector from "../components/SourceSelector/SourceSelector";

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
    sources = sources.filter(
      (source) =>
        source.name !== "Entire screen" && source.name !== "Entire Screen"
    );

    setSources(sources);

    setMessage(JSON.stringify(sources));
  };

  const startRecording = (sourceId) => {
    const source = sources.find((source) => source.id === sourceId);
    const { projectId } = ipcRenderer.sendSync("create-project");
    const sourceData = ipcRenderer.sendSync("save-source-data", {
      windowTitle: source.name,
    });
    setProjectId(projectId);

    console.info("project", projectId, sourceData);

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sourceId,
            width: sourceData.width,
            height: sourceData.height,
            // 4k size default
            // minWidth: 3840,
            // maxWidth: 3840,
            // minHeight: 2160,
            // maxHeight: 2160,
          },
        },
      } as any)
      .then((stream) => {
        console.info("stream", stream);

        const streamSettings = stream.getVideoTracks()[0].getSettings();
        const streamWidth = stream.getVideoTracks()[0].getSettings().width;
        const streamHeight = stream.getVideoTracks()[0].getSettings().height;

        console.info(
          "stream settings",
          streamSettings,
          JSON.stringify(streamSettings),
          streamWidth,
          streamHeight
        );

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

  const handleSourceSelect = (sourceId) => {
    setSelectedSource(sourceId);
  };

  return (
    <React.Fragment>
      <Head>
        <title>SunShot - Beautiful Screen Recordings</title>
      </Head>
      <main className={`${styles.main} spectrum-Typography`}>
        {/* {message} */}
        <div className={styles.innerContent}>
          <h1 className="spectrum-Heading spectrum-Heading--sizeL">
            Get Started
          </h1>
          <p className="spectrum-Body spectrum-Body--sizeL">
            SunShot is a screen recording tool that allows you to capture your
            screen and mouse movements in a beautiful way.
          </p>
          <SourceSelector
            sources={sources}
            selectedSource={selectedSource}
            onSourceSelect={handleSourceSelect}
          />

          <div className={styles.ctrls}>
            {isRecording ? (
              <button
                className="spectrum-Button spectrum-Button--fill spectrum-Button--negative spectrum-Button--sizeM"
                onClick={handleStopRecording}
              >
                <span className="spectrum-Button-label">Stop Recording</span>
              </button>
            ) : (
              <button
                className="spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM"
                onClick={handleStartRecording}
                disabled={selectedSource ? false : true}
              >
                <span className="spectrum-Button-label">Start Recording</span>
              </button>
            )}

            {/* <button className={styles.btn} onClick={handleOpenProject}>
              Open a Project
            </button> */}
          </div>
        </div>
      </main>
    </React.Fragment>
  );
}

export default Home;
