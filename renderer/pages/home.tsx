import React from "react";
import Head from "next/head";
import Link from "next/link";
import electron from "electron";

const ipcRenderer = electron.ipcRenderer;

function Home() {
  const [message, setMessage] = React.useState("no ipc message");

  const onClickWithIpcSync = () => {
    const sources = ipcRenderer.sendSync("get-sources");

    // TODO: source selection modal
    // TODO: small window with record button
    // could be one window. select source, then record button
    // play 5 second tick sound before recording starts ?

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
