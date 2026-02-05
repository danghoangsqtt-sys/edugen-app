
import { vocabStorage } from './localDataService';
import { storage, STORAGE_KEYS } from './storageAdapter';

// Định nghĩa cấu trúc file Backup
interface EduGenBackupData {
  meta: {
    version: string;
    timestamp: number;
    platform: string;
  };
  data: {
    exams: any[]; // edugen_ultimate_db
    vocab: any[]; // vocabStorage
    settings: any; // edugen_settings
    apiKey?: string; // edugen_api_key (Optional)
    speakingManual: any[]; // edugen_speaking_manual
    speakingTopicBank: any[]; // edugen_speaking_topic_bank
    leaderboard: any[]; // edugen_leaderboard
  };
}

const isElectron = () => {
  return typeof window !== 'undefined' && (window as any).require && typeof (window as any).require === 'function';
};

export const dataTransferService = {
  /**
   * Thu thập toàn bộ dữ liệu và đóng gói (ASYNC)
   */
  exportData: async (includeSensitive = true): Promise<boolean> => {
    try {
      // 1. Gom dữ liệu từ Storage Adapter (Async)
      const exams = await storage.get(STORAGE_KEYS.EXAMS, []);
      const settings = await storage.get(STORAGE_KEYS.SETTINGS, {});
      const apiKey = await storage.get(STORAGE_KEYS.API_KEY, '');
      const speakingManual = await storage.get(STORAGE_KEYS.SPEAKING_MANUAL, []);
      const speakingTopicBank = await storage.get(STORAGE_KEYS.SPEAKING_TOPIC_BANK, []);
      const leaderboard = await storage.get(STORAGE_KEYS.LEADERBOARD, []);

      // 2. Gom dữ liệu từ Vocab Storage
      const vocab = await vocabStorage.getAll();

      // 3. Đóng gói
      const backup: EduGenBackupData = {
        meta: {
          version: '2.0', // Updated version for new storage engine
          timestamp: Date.now(),
          platform: 'EduGen Pro'
        },
        data: {
          exams,
          vocab,
          settings,
          apiKey: includeSensitive ? (apiKey as string) : undefined,
          speakingManual,
          speakingTopicBank,
          leaderboard
        }
      };

      const jsonString = JSON.stringify(backup, null, 2);
      const filename = `EduGen_Backup_${new Date().toISOString().slice(0, 10)}.json`;

      // 4. Lưu file
      if (isElectron()) {
        const { ipcRenderer } = (window as any).require('electron');
        const result = await ipcRenderer.invoke('export-file-dialog', { content: jsonString, filename });
        if (result.success) {
          alert("Xuất dữ liệu thành công!");
          return true;
        }
      } else {
        // Fallback cho Web Browser
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return true;
      }
    } catch (e) {
      console.error("Export Failed", e);
      alert("Lỗi xuất dữ liệu: " + (e as any).message);
    }
    return false;
  },

  /**
   * Đọc file backup và khôi phục dữ liệu (ASYNC)
   */
  importData: async (): Promise<boolean> => {
    try {
      let jsonContent = '';

      if (isElectron()) {
        const { ipcRenderer } = (window as any).require('electron');
        const result = await ipcRenderer.invoke('import-file-dialog');
        if (!result.success) return false; // User cancelled
        jsonContent = result.content;
      } else {
        alert("Tính năng Import trực tiếp chỉ hỗ trợ trên Desktop App.");
        return false;
      }

      // 1. Parse và Validate
      const backup = JSON.parse(jsonContent) as EduGenBackupData;
      
      if (!backup.meta || !backup.data) {
        throw new Error("File không đúng định dạng EduGen Backup.");
      }

      // 2. Khôi phục dữ liệu qua Storage Adapter
      const { data } = backup;

      if (data.exams) await storage.set(STORAGE_KEYS.EXAMS, data.exams);
      if (data.settings) await storage.set(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.apiKey) await storage.set(STORAGE_KEYS.API_KEY, data.apiKey);
      if (data.speakingManual) await storage.set(STORAGE_KEYS.SPEAKING_MANUAL, data.speakingManual);
      if (data.speakingTopicBank) await storage.set(STORAGE_KEYS.SPEAKING_TOPIC_BANK, data.speakingTopicBank);
      if (data.leaderboard) await storage.set(STORAGE_KEYS.LEADERBOARD, data.leaderboard);

      // 3. Khôi phục Vocab
      if (data.vocab && Array.isArray(data.vocab)) {
        await vocabStorage.saveAll(data.vocab);
      }

      alert("Nhập dữ liệu thành công! Ứng dụng sẽ tự khởi động lại để áp dụng thay đổi.");
      window.location.reload();
      return true;

    } catch (e) {
      console.error("Import Failed", e);
      alert("Lỗi nhập dữ liệu: " + (e as any).message);
      return false;
    }
  }
};
