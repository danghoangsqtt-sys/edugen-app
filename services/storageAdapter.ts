
// Đây là module trung gian mới giúp chuyển đổi giữa LocalStorage và FileSystem
// Giúp ứng dụng không bị phụ thuộc cứng vào LocalStorage

export const STORAGE_KEYS = {
  EXAMS: 'edugen_ultimate_db',
  VOCAB: 'edugen_vocab_bank',
  SETTINGS: 'edugen_settings',
  API_KEY: 'edugen_api_key',
  LEADERBOARD: 'edugen_leaderboard',
  SPEAKING_MANUAL: 'edugen_speaking_manual',
  SPEAKING_TOPIC_BANK: 'edugen_speaking_topic_bank'
};

const isElectron = () => {
  return typeof window !== 'undefined' && (window as any).require && typeof (window as any).require === 'function';
};

export const storage = {
  /**
   * Đọc dữ liệu (Tự động parse JSON)
   */
  get: async <T>(key: string, defaultValue: T): Promise<T> => {
    if (isElectron()) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        // Gọi xuống main.js để đọc file
        const data = await ipcRenderer.invoke('db-read', key);
        if (data === null || data === undefined) return defaultValue;
        return data as T;
      } catch (e) {
        console.error(`[Electron] Read error for ${key}:`, e);
      }
    }
    
    // Fallback cho trình duyệt hoặc nếu lỗi
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      // Trường hợp API Key là string trơn không phải JSON
      return (localStorage.getItem(key) as unknown as T) || defaultValue;
    }
  },

  /**
   * Lưu dữ liệu
   */
  set: async (key: string, value: any): Promise<void> => {
    if (isElectron()) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        // Gọi xuống main.js để ghi file
        await ipcRenderer.invoke('db-write', key, value);
        return;
      } catch (e) {
        console.error(`[Electron] Write error for ${key}:`, e);
      }
    }

    // Fallback LocalStorage
    if (typeof value === 'string') {
        localStorage.setItem(key, value);
    } else {
        localStorage.setItem(key, JSON.stringify(value));
    }
  },

  /**
   * Xóa dữ liệu (nếu cần)
   */
  remove: async (key: string): Promise<void> => {
      // Hiện tại chỉ hỗ trợ ghi đè bằng mảng rỗng hoặc null, 
      // nhưng có thể mở rộng để xóa file vật lý nếu cần.
      await storage.set(key, null);
  }
};
