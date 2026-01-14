
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const isDev = !app.isPackaged;
  
  // Xác định đường dẫn thư mục tài nguyên
  // Khi đóng gói, __dirname thường là thư mục gốc của asar
  const iconPath = isDev 
    ? path.join(__dirname, 'public', 'icon.png') 
    : path.join(__dirname, 'dist', 'icon.png');

  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    icon: iconPath, // Icon cho Taskbar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true // Bật để debug nếu cần
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    // Đường dẫn chính xác tới file index.html trong thư mục dist
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      win.loadFile(indexPath).catch(err => {
        console.error("Lỗi khi load tệp index:", err);
      });
    } else {
      // Nếu không tìm thấy tệp dist/index.html, thử load trực tiếp (fallback)
      win.loadFile('dist/index.html').catch(() => {
        console.error("Không thể tìm thấy tệp index.html ở bất kỳ đâu.");
      });
    }
  }

  // Window control IPC
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('window-close', () => win.close());
  
  // Xử lý lỗi khi nội dung không hiển thị (trắng trang)
  win.webContents.on('did-fail-load', () => {
    console.error("Giao diện không thể tải được.");
    if (!isDev) win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Giảm thiểu lỗi crash khi khởi động
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
