import { app, ipcMain, screen } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";

const { desktopCapturer } = require("electron");

// require("@electron/remote/main").initialize();

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // mainWindow.webContents.openDevTools();

    // require("@electron/remote/main").enable(mainWindow.webContents);
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

// ipcMain.on("ping-pong", (event, arg) => {
//   event.sender.send("ping-pong", `[ipcMain] "${arg}" received asynchronously.`);
// });

ipcMain.on("get-sources", (event, arg) => {
  // TODO: error handling
  desktopCapturer
    .getSources({ types: ["screen", "window"] })
    .then((sources) => {
      // get size of each source
      // for (const key in sources) {
      //   const source = sources[key];
      //   if (source.name === "Entire screen" || source.name === "Screen 1") {
      //     try {
      //       const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      //       sources[key] = { ...source, width, height } as any;
      //     } catch (e) {
      //       console.error(e);
      //     }
      //   } else {

      //     sources[key] = { ...source, width, height } as any;
      //   }
      // }

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

ipcMain.on("stop-mouse-tracking", (event, arg) => {
  clearInterval(captureInterval);

  console.info("stop-mouse-tracking", startTime, mousePositions);

  // TODO: save mousePositions to file in renderer/public folder

  event.returnValue = true;
});
