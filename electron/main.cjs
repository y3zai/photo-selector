const { app, BrowserWindow, session } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Auto-approve File System Access API prompts only for our own UI —
  // packaged app loads file://, dev loads http://localhost:3000. Any other
  // origin (e.g. something a compromised renderer navigated to) falls through
  // to Electron's default deny.
  const allowedPermissions = new Set(['fileSystem', 'fileSystem:read', 'fileSystem:write']);
  const trustedOrigins = ['file://', 'http://localhost:3000'];
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const url = webContents.getURL();
    const isTrusted = trustedOrigins.some((origin) => url.startsWith(origin));
    callback(isTrusted && allowedPermissions.has(permission));
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
