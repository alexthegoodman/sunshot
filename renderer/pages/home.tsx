import React from "react";
import Head from "next/head";
import Link from "next/link";
import electron from "electron";

const ipcRenderer = electron.ipcRenderer;

function Home() {
  const [message, setMessage] = React.useState("no ipc message");

  const onClickWithIpcSync = () => {
    const sources = ipcRenderer.sendSync("get-sources");

    console.info("source", sources[0].id);

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
      } as any)
      .then((stream) => {
        console.info("stream", stream);

        // show selected stream
        const video = document.getElementById("testvideo") as HTMLVideoElement;
        video.srcObject = stream;
        video.width = 1280;
        video.height = 720;
        video.onloadedmetadata = (e) => video.play();

        const stopRecording = () => {
          // clearInterval(captureInterval);
          ipcRenderer.sendSync("stop-mouse-tracking");

          stream.getTracks()[0].stop();
          const blob = new Blob(chunks, { type: "video/webm" });

          // TODO: save blob

          // const url = URL.createObjectURL(blob);
          // const videoElement = document.createElement("video");
          // videoElement.src = url;
          // document.body.appendChild(videoElement);

          // const mousePositionsBlob = new Blob(
          //   [JSON.stringify(mousePositions)],
          //   { type: "application/json" }
          // );
          // const mousePositionsUrl = URL.createObjectURL(mousePositionsBlob);
          // const a = document.createElement("a");
          // a.href = mousePositionsUrl;
          // a.download = "mouse_positions.json";
          // a.click();
        };

        const chunks = [];
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp9",
        });
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = stopRecording;
        mediaRecorder.start();

        ipcRenderer.sendSync("start-mouse-tracking");

        setTimeout(() => mediaRecorder.stop(), 5000);
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
          {/* <Link href="/next">
            <a>Go to next page</a>
          </Link> */}
        </p>
      </div>
    </React.Fragment>
  );
}

export default Home;
