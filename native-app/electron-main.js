const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { app, BrowserWindow, Menu, dialog, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const { createDatabase } = require("./src/database-factory");
const { createServer } = require("./server");

const APP_NAME = "PAOFI LP Database";
const DATA_FOLDER_NAME = "PAOFI-LP-Database-Data";
const PREFERRED_PORT = 3417;

let mainWindow = null;
let backendDatabase = null;
let backendServer = null;
let appBaseUrl = "";

function dataRoot() {
  const base = process.env.LOCALAPPDATA || app.getPath("userData");
  return path.join(base, DATA_FOLDER_NAME);
}

function appRoot() {
  return app.getAppPath();
}

function canListen(port) {
  return new Promise(resolve => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function availablePort(preferredPort) {
  for (let port = preferredPort; port < preferredPort + 40; port += 1) {
    if (await canListen(port)) return port;
  }

  throw new Error("Could not find an available local port for the application backend.");
}

function requestStats(baseUrl) {
  return new Promise((resolve, reject) => {
    const request = http.get(`${baseUrl}api/stats`, response => {
      response.resume();
      response.on("end", () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Backend returned HTTP ${response.statusCode}.`));
        }
      });
    });

    request.setTimeout(700, () => {
      request.destroy(new Error("Backend startup timed out."));
    });
    request.on("error", reject);
  });
}

async function waitForBackend(baseUrl) {
  let lastError = null;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await requestStats(baseUrl);
      return;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  throw lastError || new Error("Backend did not start.");
}

async function startBackend() {
  const port = await availablePort(PREFERRED_PORT);
  const localDataRoot = dataRoot();
  appBaseUrl = `http://127.0.0.1:${port}/`;

  process.env.LPDB_DB_PATH = path.join(localDataRoot, "lp_database.sqlite");
  process.env.NO_OPEN = "1";
  process.env.PORT = String(port);

  backendDatabase = await createDatabase();
  backendServer = createServer(backendDatabase);

  await new Promise((resolve, reject) => {
    backendServer.once("error", reject);
    backendServer.listen(port, "127.0.0.1", () => {
      backendServer.off("error", reject);
      resolve();
    });
  });

  await waitForBackend(appBaseUrl);
}

function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    title: APP_NAME,
    backgroundColor: "#f6f8f5",
    autoHideMenuBar: true,
    icon: path.join(appRoot(), "public", "assets", "paofi-logo.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url || url === "about:blank") {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 940,
          height: 760,
          title: "Print Record",
          autoHideMenuBar: true,
          backgroundColor: "#ffffff",
          icon: path.join(appRoot(), "public", "assets", "paofi-logo.png"),
          webPreferences: {
            contextIsolation: false,
            nodeIntegration: false,
            sandbox: false
          }
        }
      };
    }

    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(appBaseUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadURL(appBaseUrl);
}

function notifyRenderer(eventName, detail) {
  if (!mainWindow || mainWindow.webContents.isDestroyed()) return;

  mainWindow.webContents.executeJavaScript(
    `window.dispatchEvent(new CustomEvent(${JSON.stringify(eventName)}, { detail: ${JSON.stringify(detail)} }))`
  ).catch(() => {});
}

function setupAutoUpdates() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", info => {
    notifyRenderer("lpdb:update-status", `Downloading update ${info.version}...`);
  });

  autoUpdater.on("update-downloaded", async info => {
    if (!mainWindow) return;

    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["Restart Now", "Later"],
      defaultId: 0,
      cancelId: 1,
      title: "Update Ready",
      message: `PAOFI LP Database ${info.version} has been downloaded.`,
      detail: "Restart the application now to install the update, or install it automatically when you close the app."
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  autoUpdater.on("error", error => {
    console.error("Auto-update failed:", error.message || error);
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(error => {
      console.error("Auto-update check failed:", error.message || error);
    });
  }, 3000);
}

function stopBackend() {
  if (backendServer) {
    backendServer.close();
    backendServer = null;
  }

  if (backendDatabase) {
    Promise.resolve(backendDatabase.close()).catch(() => {});
    backendDatabase = null;
  }
}

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady()
    .then(startBackend)
    .then(createWindow)
    .then(setupAutoUpdates)
    .catch(error => {
      dialog.showErrorBox(APP_NAME, error.message || String(error));
      app.quit();
    });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && appBaseUrl) {
      createWindow();
    }
  });

  app.on("window-all-closed", () => {
    app.quit();
  });

  app.on("before-quit", stopBackend);
}
