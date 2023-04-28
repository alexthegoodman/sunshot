import React from "react";
import Head from "next/head";
import Link from "next/link";
import electron from "electron";

import styles from "./home.module.scss";

const ipcRenderer = electron.ipcRenderer;

function Home() {
  const [message, setMessage] = React.useState("no ipc message");
  const [sources, setSources] = React.useState([]);
  const [selectedSource, setSelectedSource] = React.useState(null);

  const loadSourcePreviews = () => {
    const sources = ipcRenderer.sendSync("get-sources");
    const sourceIds = sources.map((source) => source.id);

    setSources(sourceIds);

    console.info("sources", sources);

    sources.forEach((source) => {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: source.id,
              // hd size
              // minWidth: 1920,
              // maxWidth: 1920,
              // minHeight: 1080,
              // maxHeight: 1080,
              // 4k size
              // minWidth: 3840,
              // maxWidth: 3840,
              // minHeight: 2160,
              // maxHeight: 2160,
              // preview size
              minWidth: 384,
              maxWidth: 384,
              minHeight: 216,
              maxHeight: 216,
            },
          },
        } as any)
        .then((stream) => {
          console.info("stream", stream);

          // *** preview selected stream ***
          const video = document.getElementById(
            `video-${source.id}`
          ) as HTMLVideoElement;
          video.srcObject = stream;
          // video.width = 384;
          // video.height = 216;

          video.onloadedmetadata = (e) => {
            video.play();
            console.info("play video");
          };
        })
        .catch((error) => console.log(error));
    });

    setMessage(JSON.stringify(sources));
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

  const handleOpenEditor = () => {
    ipcRenderer.sendSync("open-editor");
  };

  const handleOpenProject = () => {
    // ipcRenderer.sendSync("open-project");
  };

  const handleStartRecording = () => {
    // ipcRenderer.sendSync("start-recording");
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
      <div className={styles.sources}>
        <h1>Select Your Video Source</h1>
        <div className={styles.sourceGrid}>
          {sources?.map((sourceId) => (
            <video
              key={sourceId}
              id={`video-${sourceId}`}
              className={sourceId === selectedSource ? styles.selected : ""}
              autoPlay
              muted
              onClick={handleSourceSelect}
            />
          ))}
        </div>

        <button
          onClick={handleStartRecording}
          disabled={selectedSource ? false : true}
        >
          Start Recording
        </button>
        <button onClick={handleOpenProject}>Open a Project</button>
        {/* <button onClick={handleOpenEditor}>Open Editor</button> */}
      </div>
    </React.Fragment>
  );
}

export default Home;
