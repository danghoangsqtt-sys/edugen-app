const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const isDev = !app.isPackaged;
  
  // SỬA LỖI ICON:
  // Vite copy file trong 'public/' ra thẳng 'dist/'. 
  // File gốc là 'icon.ico', nên trong dist cũng là 'icon.ico'.
  const iconPath = isDev 
    ? path.join(__dirname, 'public', 'icon.ico') 
    : path.join(__dirname, 'dist', 'icon.ico');

  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    icon: iconPath, // Set icon cho cửa sổ
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Lưu ý: Về lâu dài nên set true và dùng preload script để bảo mật hơn
      devTools: isDev // Chỉ bật DevTools khi dev
    }
  });

  // SỬA LỖI LOAD FILE TRẮNG TRANG:
  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools(); // Mở devtool khi code
  } else {
    // Load file từ thư mục dist đã build
    win.loadFile(path.join(__dirname, 'dist', 'index.html')).catch(err => {
        console.error("Lỗi load app:", err);
    });
    // Tắt menu mặc định của trình duyệt trong bản build
    win.setMenu(null);
  }

  // Window control IPC
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('window-close', () => win.close());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});