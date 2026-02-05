
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const isDev = !app.isPackaged;
  
  const iconPath = isDev 
    ? path.join(__dirname, 'public', 'icon.ico') 
    : path.join(__dirname, 'dist', 'icon.ico');

  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Lưu ý: Cho phép gọi require('electron') từ React
      devTools: isDev
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html')).catch(err => {
        console.error("Lỗi load app:", err);
    });
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

// --- FILE SYSTEM STORAGE ENGINE (UPDATED) ---
const userDataPath = app.getPath('userData');

// Bản đồ ánh xạ Key -> Tên File
const FILE_MAPPING = {
  'edugen_ultimate_db': 'exams.json',
  'edugen_vocab_bank': 'vocab.json',
  'edugen_settings': 'settings.json',
  'edugen_api_key': 'secure_key.json', // Lưu key riêng
  'edugen_leaderboard': 'leaderboard.json',
  'edugen_speaking_manual': 'speaking_manual.json',
  'edugen_speaking_topic_bank': 'speaking_topics.json'
};

// Hàm tiện ích: Lấy đường dẫn file từ key
const getFilePath = (key) => {
  const fileName = FILE_MAPPING[key] || `${key}.json`;
  return path.join(userDataPath, fileName);
};

// 1. Generic Read Handler
ipcMain.handle('db-read', async (event, key) => {
  try {
    const filePath = getFilePath(key);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null; // Trả về null nếu file chưa tồn tại
  } catch (error) {
    console.error(`Read Error (${key}):`, error);
    return null;
  }
});

// 2. Generic Write Handler
ipcMain.handle('db-write', async (event, key, data) => {
  try {
    const filePath = getFilePath(key);
    // Ghi file bất đồng bộ để không chặn luồng chính
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error(`Write Error (${key}):`, error);
    return { success: false, error: error.message };
  }
});

// Giữ lại handler cũ để tương thích ngược nếu cần (vocab cũ)
// Tuy nhiên logic mới trong React sẽ dùng db-read/db-write ở trên.
ipcMain.handle('read-vocab-data', async () => {
    // Redirect sang logic mới
    const filePath = getFilePath('edugen_vocab_bank');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [];
});

ipcMain.handle('save-vocab-data', async (event, data) => {
    const filePath = getFilePath('edugen_vocab_bank');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
});

// --- IMPORT / EXPORT SYSTEM HANDLERS ---

// 1. Export: Lưu nội dung string vào file do người dùng chọn
ipcMain.handle('export-file-dialog', async (event, { content, filename }) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Xuất dữ liệu EduGen',
      defaultPath: path.join(app.getPath('documents'), filename),
      filters: [
        { name: 'EduGen Backup File', extensions: ['json', 'edugen'] }
      ]
    });

    if (canceled || !filePath) return { success: false };

    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// 2. Import: Đọc nội dung từ file do người dùng chọn
ipcMain.handle('import-file-dialog', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Nhập dữ liệu EduGen',
      properties: ['openFile'],
      filters: [
        { name: 'EduGen Backup File', extensions: ['json', 'edugen'] }
      ]
    });

    if (canceled || filePaths.length === 0) return { success: false };

    const content = fs.readFileSync(filePaths[0], 'utf8');
    return { success: true, content };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
