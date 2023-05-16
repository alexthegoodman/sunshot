import { app, ipcMain, screen } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import * as fs from "fs";
import { randomUUID } from "crypto";
import Konva from "konva";

const { desktopCapturer } = require("electron");
const path = require("path");

const { print, setTargetWindow } = require("sunshot-recorder");
const { spawn } = require("child_process");

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

const savePath =
  process.env.NODE_ENV === "production" ? app.getPath("appData") : __dirname;

const tempPath = app.getPath("temp");

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
    height: 750,
  });

  // mainWindow.setMenu(null);
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
  currentProjectId = randomUUID();

  fs.mkdirSync(savePath + `/projects/${currentProjectId}`, {
    recursive: true,
  });

  event.returnValue = { projectId: currentProjectId };
});

ipcMain.on("get-sources", (event, arg) => {
  // TODO: error handling

  desktopCapturer
    .getSources({ types: ["screen", "window"] })
    .then((sources) => {
      event.returnValue = sources;
    });
});

ipcMain.on("save-source-data", (event, { windowTitle }) => {
  // TODO: error handling

  const sourceData = setTargetWindow(windowTitle);

  fs.writeFileSync(
    savePath + `/projects/${currentProjectId}/sourceData.json`,
    JSON.stringify(sourceData)
  );

  event.returnValue = sourceData;
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
    savePath + `/projects/${projectId}/mousePositions.json`,
    JSON.stringify(mousePositions)
  );

  event.returnValue = true;
});

ipcMain.on("save-video-blob", (event, { projectId, buffer, sourceId }) => {
  console.info("save-video-blob", event, projectId, buffer, sourceId);

  // save buffer to custom project file format
  fs.writeFileSync(
    savePath + `/projects/${projectId}/originalCapture.webm`,
    buffer
  );

  event.returnValue = true;

  // // use ffmpeg to size down 1/4th
  // const inputVideoPath = path.join(
  //   savePath,
  //   `/projects/${projectId}/originalCapture.webm`
  // );
  // const outputVideoPath = path.join(
  //   savePath,
  //   `/projects/${projectId}/originalCapture25.webm`
  // );

  // // resize with fluent-ffmpeg
  // ffmpeg(inputVideoPath)
  //   .outputOptions(["-vf scale=iw/4:ih/4"])
  //   .save(outputVideoPath)
  //   .on("end", () => {
  //     console.log("resized video");
  //     event.returnValue = true;
  //   });
});

let blobsSaved = 0;

ipcMain.on("save-transformed-blob", (event, { buffer }) => {
  console.info("save-transformed-blob", event, buffer);

  // save buffer to custom project file format
  fs.writeFileSync(
    savePath +
      `/projects/${currentProjectId}/transformedBlob${blobsSaved}.webm`,
    buffer
  );

  blobsSaved++;

  event.returnValue = true;
});

ipcMain.on("combine-blobs", (event, args) => {
  console.info("combine-blobs");

  const videoFiles = new Array(blobsSaved).fill(0).map((_, i) => {
    return (
      savePath + `\\projects\\${currentProjectId}\\transformedBlob${i}.webm`
    );
  });

  const outputPath = savePath + `\\projects\\${currentProjectId}\\output.webm`;

  let command = ffmpeg(videoFiles[0]);

  let otherFiles = videoFiles.slice(1, videoFiles.length);

  console.info("videoFiles", videoFiles[0], otherFiles, outputPath);

  otherFiles.forEach((file, i) => {
    command.input(file);
  });

  command
    .on("error", (err) => {
      console.error("Error concatenating videos:", err);
    })
    .on("end", () => {
      console.log("Videos concatenated successfully!");
    })
    .mergeToFile(outputPath, tempPath);

  // only plays first video
  // const command = ffmpeg();

  // videoFiles.forEach((file) => {
  //   command.input(file);
  // });

  // command.output(outputPath);

  // command.run();

  // console.info("videoFiles", videoFiles);

  // simply fails, may work with input.txt file, may not spawn in package
  // const ffmpeg = spawn("ffmpeg", [
  //   "-f",
  //   "concat",
  //   "-i",
  //   "concat:" + videoFiles.join("|"), // requires input.txt file
  //   "-c",
  //   "copy",
  //   outputPath,
  // ]);

  // console.info("ffmpeg", ffmpeg);

  // // print progress
  // // ffmpeg.stderr.on("data", (data) => {
  // //   console.log(data.toString());
  // // });

  // // Wait for the FFmpeg process to finish
  // ffmpeg.on("exit", (code) => {
  //   if (code === 0) {
  //     console.log("Concatenation successful!");
  //   } else {
  //     console.log("Concatenation failed!");
  //   }
  // });
});

ipcMain.on("get-project-data", (event, args) => {
  console.info("get-project-data", args);

  const mousePositions = JSON.parse(
    fs.readFileSync(
      savePath + `/projects/${currentProjectId}/mousePositions.json`
    ) as unknown as string
  );

  const sourceData = JSON.parse(
    fs.readFileSync(
      savePath + `/projects/${currentProjectId}/sourceData.json`
    ) as unknown as string
  );

  const originalCapture = fs.readFileSync(
    savePath + `/projects/${currentProjectId}/originalCapture.webm`
  );

  // const originalCapture25 = fs.readFileSync(
  //   savePath + `/projects/${currentProjectId}/originalCapture25.webm`
  // );

  event.returnValue = {
    currentProjectId,
    mousePositions,
    originalCapture,
    sourceData,
    // originalCapture25,
  };
});

// ipcMain.on("export-video", (event, args) => {
//   console.info("export-video", args);

//   const mousePositions = JSON.parse(
//     fs.readFileSync(
//       savePath + `/projects/${currentProjectId}/mousePositions.json`
//     ) as unknown as string
//   );

//   const sourceData = JSON.parse(
//     fs.readFileSync(
//       savePath + `/projects/${currentProjectId}/sourceData.json`
//     ) as unknown as string
//   );

//   const originalCapture = fs.readFileSync(
//     savePath + `/projects/${currentProjectId}/originalCapture.webm`
//   );

//   const divider = 1;
//   const width25 = 3840 / divider;
//   const height25 = 2160 / divider;
//   const innerWidth = width25 * 0.8;
//   const innerHeight = height25 * 0.8;

//   // create Konva canvas similar to editor
//   const stage = new Konva.Stage({
//     container: null,
//     width: width25,
//     height: height25,
//   });

//   const layer = new Konva.Layer();

//   // TODO: how?
//   var imageObj = new Image();
//   imageObj.src =
//     savePath + `/projects/${currentProjectId}/originalCapture.webm`;

//   const video = new Konva.Image({
//     image: imageObj,
//     width: innerWidth,
//     height: innerHeight,
//     x: (width25 - innerWidth) / 2,
//     y: (height25 - innerHeight) / 2,
//   });
// });

// unused ffmpeg implementation
// ipcMain.on("get-transformed-video", (event, { zoomTracks }) => {
//   console.info("get-transformed-video", currentProjectId, zoomTracks);

//   // const mousePositions = JSON.parse(
//   //   fs.readFileSync(
//   //     savePath + `/projects/${currentProjectId}/mousePositions.json`
//   //   ) as unknown as string
//   // );

//   // const originalCapture = fs.readFileSync(
//   //   savePath + `/projects/${currentProjectId}/originalCapture.webm`
//   // );

//   const inputVideoPath = path.join(
//     savePath,
//     `/projects/${currentProjectId}/originalCapture.webm`
//   );
//   const outputVideoPath = path.join(
//     savePath,
//     `/projects/${currentProjectId}/transformedCapture.webm`
//   );

//   // Define the cubic-bezier control points
//   const easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

//   const gradientStops = [
//     { color: "#000000", position: 0 },
//     { color: "#FFFFFF", position: 1 },
//   ];

//   // Apply zoom and pan effect with cubic-bezier easing
//   ffmpeg(inputVideoPath)
//     .videoCodec("libvpx-vp9")
//     .noAudio()
//     .complexFilter([
//       // `[0:v]zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=100`,
//       // `zoompan=z='min(zoom+0.0015,1.5)':d=700:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=100`,
//       // `zoompan=z=pzoom+0.01:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1280x720:fps=30`,
//       // Add a gradient background
//       `[0:v]drawbox=c=gradient:w=iw:h=ih:t=0.5:s=${gradientStops
//         .map((s) => `${s.color}@${s.position}`)
//         .join(":")}[bg]`,
//       // Apply zoom and pan effect with easing
//       // `[bg]zoompan=z=pzoom+0.01:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1280x720:fps=30[zoomed]`,
//       // // Overlay the zoomed video onto the gradient background
//       // `[zoomed][bg]overlay=(W-w)/2:(H-h)/2`,
//     ])
//     .output(outputVideoPath)
//     .on("start", (commandLine) => {
//       console.log("Started FFMpeg with command:", commandLine);
//     })
//     .on("progress", (progress) => {
//       console.log("Processing: " + JSON.stringify(progress));
//     })
//     .on("end", () => {
//       console.log("Finished processing the video");
//     })
//     .on("error", (error) => {
//       console.error(
//         "An error occurred while processing the video:",
//         error.message
//       );
//     })
//     .run();

//   event.returnValue = {};
// });
