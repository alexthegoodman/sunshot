import React from "react";
import Head from "next/head";
import Link from "next/link";
import electron from "electron";

const ipcRenderer = electron.ipcRenderer;

// const remote = require("@electron/remote");
// import remote from "@electron/remote";

function Home() {
  const [message, setMessage] = React.useState("no ipc message");

  const onClickWithIpcSync = () => {
    const sources = ipcRenderer.sendSync("test");

    console.info("source", sources[0].id);

    let mousePositions = [];
    let startTime = Date.now();

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sources[0].id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720,
          },
        },
      })
      .then((stream) => {
        console.info("stream", stream);
        const video = document.getElementById("testvideo") as HTMLVideoElement;
        video.srcObject = stream;
        video.width = 1280;
        video.height = 720;
        // video.play();
        video.onloadedmetadata = (e) => video.play();
        // console.info("video", video);
        // const canvas = document.createElement("canvas");
        // const ctx = canvas.getContext("2d");
        // canvas.width = 1280;
        // canvas.height = 720;
        // const captureInterval = setInterval(() => {
        //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        //   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        //   const mousePosition = remote.screen.getCursorScreenPoint();
        //   mousePositions.push({
        //     x: mousePosition.x,
        //     y: mousePosition.y,
        //     timestamp: Date.now() - startTime,
        //   });
        // }, 100);
        // const stopRecording = () => {
        //   clearInterval(captureInterval);
        //   stream.getTracks()[0].stop();
        //   const blob = new Blob(chunks, { type: "video/webm" });
        //   const url = URL.createObjectURL(blob);
        //   const videoElement = document.createElement("video");
        //   videoElement.src = url;
        //   document.body.appendChild(videoElement);
        //   const mousePositionsBlob = new Blob(
        //     [JSON.stringify(mousePositions)],
        //     { type: "application/json" }
        //   );
        //   const mousePositionsUrl = URL.createObjectURL(mousePositionsBlob);
        //   const a = document.createElement("a");
        //   a.href = mousePositionsUrl;
        //   a.download = "mouse_positions.json";
        //   a.click();
        // };
        // const chunks = [];
        // const mediaRecorder = new MediaRecorder(stream, {
        //   mimeType: "video/webm; codecs=vp9",
        // });
        // mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        // mediaRecorder.onstop = stopRecording;
        // mediaRecorder.start();
        // setTimeout(() => mediaRecorder.stop(), 5000);
      })
      .catch((error) => console.log(error));

    setMessage(JSON.stringify(sources));
  };

  // If we use ipcRenderer in this scope, we must check the instance exists
  if (ipcRenderer) {
    // In this scope, the webpack process is the client
  }

  React.useEffect(() => {
    ipcRenderer.on("ping-pong", (event, data) => {
      setMessage(data);
    });

    // onClickWithIpc();

    return () => {
      ipcRenderer.removeAllListeners("ping-pong");
    };
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript)</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ - {message}
          <video id="testvideo"></video>
          <button onClick={onClickWithIpcSync}>Test</button>
          <Link href="/next">
            <a>Go to next page</a>
          </Link>
        </p>
        <img src="/images/logo.png" />
      </div>
    </React.Fragment>
  );
}

export default Home;
