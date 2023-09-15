// console.log("PATH", process.env.PATH);

import { app, ipcMain, screen, shell } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import * as fs from "fs";
import { randomUUID } from "crypto";
import Konva from "konva";
import fetch from "electron-fetch";

const { desktopCapturer } = require("electron");
const path = require("path");

const {
  print,
  setTargetWindow,
  setTargetWindowHwnd,
} = require("sunshot-recorder");
const { startWorker } = require("sunshot-creator");
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

const isProd: boolean = process.env.NODE_ENV === "production";

const savePath =
  process.env.NODE_ENV === "production" ? app.getPath("appData") : __dirname;
const userDataPath = app.getPath("userData");
const tempPath = app.getPath("temp");

const apiUrl = isProd ? "https://sunshot.app" : "http://localhost:3000";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let mainWindow = null;
let editorWindow = null;
let licenseWindow = null;
let currentProjectId = null;

(async () => {
  await app.whenReady();

  // check if license key exists
  const licenseKeyExists = fs.existsSync(userDataPath + "/licenseKey.txt");

  if (!licenseKeyExists) {
    console.info("License key not found", userDataPath);
    openLicenseKeyInput();
    return;
  }

  // get stored license key from userData
  const licenseKey = fs.readFileSync(userDataPath + "/licenseKey.txt", "utf8");

  console.info("License key found", licenseKey, userDataPath);

  // verify license key by calling API
  const response = await fetch(apiUrl + "/licenses/" + licenseKey, {
    method: "GET",
  });

  const data = await response.json();

  console.info("license data", data);

  // open necessary window
  if (response.ok && data.key === licenseKey) {
    console.info("License key verified");
    openSourcePicker();
  } else {
    console.warn("License key invalid");
    openLicenseKeyInput();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

// ipcMain.on("ping-pong", (event, arg) => {
//   event.sender.send("ping-pong", `[ipcMain] "${arg}" received asynchronously.`);
// });

// save license
ipcMain.on("save-license-key", (event, { licenseKey }) => {
  console.info("save-license-key", licenseKey);

  fs.writeFileSync(userDataPath + "/licenseKey.txt", licenseKey);

  event.returnValue = true;
});

// open source picker
const openSourcePicker = async () => {
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
};

const openLicenseKeyInput = async () => {
  licenseWindow = createWindow("license", {
    width: 700,
    height: 300,
  });

  // mainWindow.setMenu(null);
  // mainWindow.setResizable(false);

  if (isProd) {
    await licenseWindow.loadURL("app://./license.html");
  } else {
    const port = process.argv[2];
    await licenseWindow.loadURL(`http://localhost:${port}/license`);
  }
};

ipcMain.on("open-source-picker", async (event, arg) => {
  console.info("open-source-picker", arg);
  openSourcePicker();
  event.returnValue = true;
});

ipcMain.on("open-editor", async (event, { projectId }) => {
  editorWindow = createWindow("editor", {
    width: 1200 + 400,
    height: 1200,
  });

  if (isProd) {
    await editorWindow.loadURL("app://./editor.html");
  } else {
    const port = process.argv[2];
    await editorWindow.loadURL(`http://localhost:${port}/editor`);
  }

  event.returnValue = true;
});

ipcMain.on("close-source-picker", (event, arg) => {
  console.info("close-source-picker", arg);

  mainWindow.close();

  event.returnValue = true;
});

ipcMain.on("close-license-key-input", (event, arg) => {
  console.info("close-license-key-input", arg);

  licenseWindow.close();

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

ipcMain.on("save-source-data", (event, { windowTitle, hwnd }) => {
  // TODO: error handling

  // let sourceData = setTargetWindow(windowTitle);
  let sourceData = setTargetWindowHwnd(hwnd);

  sourceData = JSON.parse(sourceData);

  // get screen dpi scaling
  const primaryDisplay = screen.getPrimaryDisplay();
  const { scaleFactor } = primaryDisplay;

  sourceData.scaleFactor = scaleFactor;

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

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  console.info("primaryDisplay", width, height);

  let resolution = "4k";
  if (width <= 1920 && height <= 1080) {
    resolution = "hd";
  }

  // const originalCapture25 = fs.readFileSync(
  //   savePath + `/projects/${currentProjectId}/originalCapture25.webm`
  // );

  event.returnValue = {
    currentProjectId,
    mousePositions,
    originalCapture,
    sourceData,
    resolution,
    // originalCapture25,
  };
});

ipcMain.on("export-video", (event, args) => {
  console.info("export-video", args);

  // use fluent-ffmpeg to convert to 60fps mp4
  ffmpeg(savePath + `/projects/${currentProjectId}/originalCapture.webm`)
    .fps(60)
    .toFormat("mp4")
    .outputOptions(["-crf 5"])
    .on("progress", function (progress) {
      console.info("Processing 60FPS: " + progress.percent + "% done");
      event.sender.send("export-video-pre-progress", progress.percent);
    })
    .on("end", function () {
      console.log("File has been converted succesfully");

      // generate presentation video
      startWorker(
        JSON.stringify({
          duration: args.duration,
          positionsFile:
            savePath + `/projects/${currentProjectId}/mousePositions.json`,
          sourceFile:
            savePath + `/projects/${currentProjectId}/sourceData.json`,
          inputFile: savePath + `/projects/${currentProjectId}/60fps.mp4`,
          outputFile: savePath + `/projects/${currentProjectId}/output.mp4`,
          zoomInfo: args.zoomInfo,
          backgroundInfo: args.backgroundInfo,
        }),
        (progress) => {
          if (progress === -1) {
            console.info("Finished generating presentation video");

            // compression
            ffmpeg(savePath + `/projects/${currentProjectId}/output.mp4`)
              .videoCodec("libx264")
              .outputOptions(["-crf 23"])
              .on("progress", function (progress) {
                console.info(
                  "Compression Progress: " + progress.percent + "% done"
                );
                event.sender.send(
                  "export-video-com-progress",
                  progress.percent
                );
              })
              .on("end", () => {
                console.log("Compression finished.");

                // delete huge video
                fs.unlinkSync(
                  savePath + `/projects/${currentProjectId}/output.mp4`
                );

                console.info("Finished exporting video");

                // open folder containing video
                // spawn("explorer", [savePath + `/projects/${currentProjectId}`]);
                // shell.showItemInFolder(
                //   savePath +
                //     `/projects/${currentProjectId}/output_compressed.mp4`
                // );
                shell.openExternal(
                  "file://" + savePath + `/projects/${currentProjectId}/`
                );
              })
              .on("error", (err) => {
                console.error("Compression Error:", err);
              })
              .save(
                savePath + `/projects/${currentProjectId}/output_compressed.mp4`
              );
          } else {
            console.log("Gen Progress:", progress);
            event.sender.send("export-video-gen-progress", progress);
          }
        }
      );
    })
    .on("error", function (err) {
      console.error("60FPS Error:", err);
    })
    .save(savePath + `/projects/${currentProjectId}/60fps.mp4`);
});
