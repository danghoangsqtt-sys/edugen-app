
import { VocabularyItem } from '../types';
import { storage, STORAGE_KEYS } from './storageAdapter';

export const vocabStorage = {
  /**
   * Lấy toàn bộ danh sách từ vựng từ Ổ CỨNG (Async)
   */
  getAll: async (): Promise<VocabularyItem[]> => {
    return await storage.get<VocabularyItem[]>(STORAGE_KEYS.VOCAB, []);
  },

  /**
   * Lưu toàn bộ danh sách từ vựng xuống Ổ CỨNG (Async)
   */
  saveAll: async (data: VocabularyItem[]): Promise<boolean> => {
    await storage.set(STORAGE_KEYS.VOCAB, data);
    return true;
  },

  /**
   * Lấy danh sách Topics (Unit) duy nhất
   */
  getTopics: async (): Promise<string[]> => {
    const list = await vocabStorage.getAll();
    const topics = new Set(list.map(v => v.topic || "Chung"));
    return Array.from(topics);
  },

  /**
   * Lấy từ vựng theo Topic
   */
  getByTopic: async (topic: string): Promise<VocabularyItem[]> => {
    const list = await vocabStorage.getAll();
    return list.filter(v => v.topic === topic);
  }
};
