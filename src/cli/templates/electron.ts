export function electronMain(): string {
  return `import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`;
}

export function electronPreload(): string {
  return `import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
`;
}

// Nasti Electron templates — main/preload live under src/electron/ and output CJS
export function nastiElectronMain(): string {
  return `import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Nasti outputs preload as preload.cjs by default
      preload: path.resolve(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
    },
  })

  // Nasti injects the dev server URL via NASTI_DEV_SERVER_URL
  if (process.env.NASTI_DEV_SERVER_URL) {
    await win.loadURL(process.env.NASTI_DEV_SERVER_URL)
  } else {
    await win.loadFile(path.resolve(__dirname, 'renderer/index.html'))
  }
}

ipcMain.handle('ping', () => 'pong')

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
`;
}

export function nastiElectronPreload(): string {
  return `import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  ping: () => ipcRenderer.invoke('ping'),
})
`;
}
