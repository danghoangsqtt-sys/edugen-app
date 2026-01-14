
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Kiểm tra xem ứng dụng đang chạy ở chế độ dev hay đã build
  const isDev = !app.isPackaged;

  if (isDev) {
    // Trong môi trường dev, load từ server của Vite
    win.loadURL('http://localhost:5173');
  } else {
    // Sau khi build, load file từ thư mục dist
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
