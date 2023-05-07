import { app, ipcMain, screen } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import * as fs from "fs";
import { randomUUID } from "crypto";

const { desktopCapturer } = require("electron");
const path = require("path");

const { print, setTargetWindow } = require('sunshot-recorder');

// https://alexandercleasby.dev/blog/use-ffmpeg-electron
const ffmpeg = require("fluent-ffmpeg");

const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
const ffprobePath = require("ffprobe-static").path.replace(
  "app.asar",
  "app.asar.unpacked"
);

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// require("@electron/remote/main").initialize();

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let mainWindow = null;
let editorWindow = null;
let currentProjectId = null;

(async () => {
  await app.whenReady();

  mainWindow = createWindow("main", {
    width: 500,
    height: 335,
  });

  mainWindow.setMenu(null);
  // mainWindow.setResizable(false);

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

// ipcMain.on("ping-pong", (event, arg) => {
//   event.sender.send("ping-pong", `[ipcMain] "${arg}" received asynchronously.`);
// });

ipcMain.on("open-editor", async (event, { projectId }) => {
  currentProjectId = projectId;

  editorWindow = createWindow("editor", {
    width: 1440,
    height: 1024,
  });

  if (isProd) {
    await editorWindow.loadURL("app://./editor.html");
  } else {
    const port = process.argv[2];
    await editorWindow.loadURL(`http://localhost:${port}/editor`);
  }
});

ipcMain.on("close-source-picker", (event, arg) => {
  console.info("close-source-picker", arg);

  mainWindow.close();

  event.returnValue = true;
});

ipcMain.on("create-project", (event, arg) => {
  console.info("create-project", arg);
  const projectId = randomUUID();

  fs.mkdirSync(__dirname + `/projects/${projectId}`, {
    recursive: true,
  });

  event.returnValue = { projectId };
});

ipcMain.on("get-sources", (event, arg) => {
  // TODO: error handling

  console.log(print("test"));
  console.info(setTargetWindow())

  desktopCapturer
    .getSources({ types: ["screen", "window"] })
    .then((sources) => {
      event.returnValue = sources;
    });
});

let captureInterval = null;
let mousePositions = null;
let startTime = null;

ipcMain.on("start-mouse-tracking", (event, arg) => {
  mousePositions = [];
  startTime = Date.now();

  captureInterval = setInterval(() => {
    const mousePosition = screen.getCursorScreenPoint();
    mousePositions.push({
      x: mousePosition.x,
      y: mousePosition.y,
      timestamp: Date.now() - startTime,
    });
  }, 100);

  console.info("start-mouse-tracking");

  event.returnValue = true;
});

ipcMain.on("stop-mouse-tracking", (event, { projectId }) => {
  clearInterval(captureInterval);

  console.info("stop-mouse-tracking", startTime, mousePositions);

  fs.writeFileSync(
    __dirname + `/projects/${projectId}/mousePositions.json`,
    JSON.stringify(mousePositions)
  );

  event.returnValue = true;
});

ipcMain.on("save-video-blob", (event, { projectId, buffer, sourceId }) => {
  console.info("save-video-blob", event, projectId, buffer, sourceId);

  // save buffer to custom project file format
  fs.writeFileSync(
    __dirname + `/projects/${projectId}/originalCapture.webm`,
    buffer
  );

  // use ffmpeg to size down 1/4th
  const inputVideoPath = path.join(
    __dirname,
    `/projects/${projectId}/originalCapture.webm`
  );
  const outputVideoPath = path.join(
    __dirname,
    `/projects/${projectId}/originalCapture25.webm`
  );

  // resize with fluent-ffmpeg
  ffmpeg(inputVideoPath)
    .outputOptions(["-vf scale=iw/4:ih/4"])
    .save(outputVideoPath)
    .on("end", () => {
      console.log("resized video");
      event.returnValue = true;
    });
});

ipcMain.on("get-project-data", (event, args) => {
  console.info("get-project-data", args);

  const mousePositions = JSON.parse(
    fs.readFileSync(
      __dirname + `/projects/${currentProjectId}/mousePositions.json`
    ) as unknown as string
  );

  const originalCapture = fs.readFileSync(
    __dirname + `/projects/${currentProjectId}/originalCapture.webm`
  );

  const originalCapture25 = fs.readFileSync(
    __dirname + `/projects/${currentProjectId}/originalCapture25.webm`
  );

  event.returnValue = {
    mousePositions,
    originalCapture,
    originalCapture25,
  };
});

ipcMain.on("get-transformed-video", (event, { zoomTracks }) => {
  console.info("get-transformed-video", currentProjectId, zoomTracks);

  // const mousePositions = JSON.parse(
  //   fs.readFileSync(
  //     __dirname + `/projects/${currentProjectId}/mousePositions.json`
  //   ) as unknown as string
  // );

  // const originalCapture = fs.readFileSync(
  //   __dirname + `/projects/${currentProjectId}/originalCapture.webm`
  // );

  const inputVideoPath = path.join(
    __dirname,
    `/projects/${currentProjectId}/originalCapture.webm`
  );
  const outputVideoPath = path.join(
    __dirname,
    `/projects/${currentProjectId}/transformedCapture.webm`
  );

  // Define the cubic-bezier control points
  const easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  const gradientStops = [
    { color: "#000000", position: 0 },
    { color: "#FFFFFF", position: 1 },
  ];

  // Apply zoom and pan effect with cubic-bezier easing
  ffmpeg(inputVideoPath)
    .videoCodec("libvpx-vp9")
    .noAudio()
    .complexFilter([
      // `[0:v]zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=100`,
      // `zoompan=z='min(zoom+0.0015,1.5)':d=700:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=100`,
      // `zoompan=z=pzoom+0.01:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1280x720:fps=30`,
      // Add a gradient background
      `[0:v]drawbox=c=gradient:w=iw:h=ih:t=0.5:s=${gradientStops
        .map((s) => `${s.color}@${s.position}`)
        .join(":")}[bg]`,
      // Apply zoom and pan effect with easing
      // `[bg]zoompan=z=pzoom+0.01:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1280x720:fps=30[zoomed]`,
      // // Overlay the zoomed video onto the gradient background
      // `[zoomed][bg]overlay=(W-w)/2:(H-h)/2`,
    ])
    .output(outputVideoPath)
    .on("start", (commandLine) => {
      console.log("Started FFMpeg with command:", commandLine);
    })
    .on("progress", (progress) => {
      console.log("Processing: " + JSON.stringify(progress));
    })
    .on("end", () => {
      console.log("Finished processing the video");
    })
    .on("error", (error) => {
      console.error(
        "An error occurred while processing the video:",
        error.message
      );
    })
    .run();

  event.returnValue = {};
});
