import React from "react";
import Head from "next/head";
import Link from "next/link";
import electron from "electron";

const ipcRenderer = electron.ipcRenderer;

function Home() {
  const [message, setMessage] = React.useState("no ipc message");

  const onClickWithIpcSync = () => {
    const sources = ipcRenderer.sendSync("get-sources");

    // home can prompt user to open previous project or start new recording
    // New recording: select source, then record button
    // starts recording instantly, user can use same window to stop recording
    // (TBD: stream can be shortened in editor)
    // after stop recording, it auto opens the editor

    console.info("sources", sources);

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sources[2].id,
            // hd size
            // minWidth: 1920,
            // maxWidth: 1920,
            // minHeight: 1080,
            // maxHeight: 1080,
            // 4k size
            minWidth: 3840,
            maxWidth: 3840,
            minHeight: 2160,
            maxHeight: 2160,
          },
        },
      } as any)
      .then((stream) => {
        console.info("stream", stream);

        // *** preview selected stream ***
        const video = document.getElementById("testvideo") as HTMLVideoElement;
        video.srcObject = stream;
        video.width = 3840 / 4;
        video.height = 2160 / 4;
        // video.width = stream.getVideoTracks()[0].getSettings().width;
        // video.height = stream.getVideoTracks()[0].getSettings().height;
        video.onloadedmetadata = (e) => {
          video.play();
          console.info("play video");
        };

        // TODO: load mousepositions.json and play alongside video

        // need VideoPreview component from which to record and use during editing
        // it can accept the blob rather than stream as it is after recording during editing

        const stopRecording = () => {
          // clearInterval(captureInterval);
          ipcRenderer.sendSync("stop-mouse-tracking");
          console.info("stop-mouse-tracking");

          stream.getTracks()[0].stop();
          const blob = new Blob(chunks, { type: "video/webm" });

          // TODO: save blob as original stream (save alongside mousepositions.json?)

          // preview blob
          const url = URL.createObjectURL(blob);
          const videoElement = document.createElement("video");
          videoElement.src = url;
          videoElement.controls = true;
          videoElement.autoplay = true;
          videoElement.width = 3840 / 4;
          videoElement.height = 2160 / 4;
          document.body.appendChild(videoElement);
        };

        // TODO: record original stream and from preview video

        const chunks = [];
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp9",
        });
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = stopRecording;
        mediaRecorder.start();

        ipcRenderer.sendSync("start-mouse-tracking");

        console.info("start-mouse-tracking");

        setTimeout(() => mediaRecorder.stop(), 10000);
      })
      .catch((error) => console.log(error));

    setMessage(JSON.stringify(sources));
  };

  React.useEffect(() => {
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

  return (
    <React.Fragment>
      <Head>
        <title>SunShot - Beautiful Screen Recordings</title>
      </Head>
      <div>
        <p>
          {message}
          <video id="testvideo"></video>
          <button onClick={onClickWithIpcSync}>Get Sources</button>
          <button onClick={handleOpenEditor}>Open Editor</button>
          {/* <Link href="/next">
            <a>Go to next page</a>
          </Link> */}
        </p>
      </div>
    </React.Fragment>
  );
}

export default Home;
