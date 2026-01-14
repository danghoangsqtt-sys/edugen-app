
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    frame: false, // Sử dụng Custom Titlebar để đẹp hơn
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Trong môi trường development, load từ localhost hoặc file
  win.loadFile('index.html');
  
  // Mở DevTools nếu cần
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
