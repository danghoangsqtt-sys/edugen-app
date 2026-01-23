
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExamConfig, Question, QuestionType, BloomLevel, VocabularyItem } from "../types";

const getApiKey = (): string => {
  const manualKey = localStorage.getItem('edugen_api_key');
  return manualKey || process.env.API_KEY || '';
};

const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

/**
 * Sinh ảnh minh họa cho từ vựng (Sử dụng cho game Vision Linker)
 */
export const generateVocabImage = async (word: string, meaning: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Cần API Key để sinh ảnh.");
  
  const ai = new GoogleGenAI({ apiKey });
  // Sử dụng gemini-2.5-flash-image cho tốc độ và chất lượng tốt
  const prompt = `A clear, simple, and high-quality educational illustration for the vocabulary word: "${word}" (meaning: ${meaning}). Style: Flat design, bright colors, white background, no text inside.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Không tìm thấy dữ liệu ảnh.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

/**
 * Trích xuất từ vựng trực tiếp từ File (PDF hoặc Image)
 */
export const extractVocabularyFromFile = async (base64Data: string, mimeType: string, topic: string): Promise<VocabularyItem[]> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key trong phần Cài đặt.");
  
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';

  const prompt = `
    Nhiệm vụ: Phân tích tài liệu đính kèm (bảng từ vựng sách giáo khoa).
    Chủ đề: "${topic}"
    Yêu cầu: Trích xuất danh sách từ vựng thành mảng JSON.
    Mỗi đối tượng gồm: word, pronunciation (IPA), partOfSpeech, meaning (tiếng Việt), example (ngắn), topic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: mimeType } }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJsonResponse(response.text)) as VocabularyItem[];
  } catch (error: any) {
    throw new Error(error?.message || "Lỗi AI không thể đọc file.");
  }
};

export const generateExamContent = async (config: ExamConfig): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = `Tạo đề thi tiếng Anh JSON cho chủ đề: ${config.topic}. Ma trận: ${JSON.stringify(config.sections)}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              content: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchingLeft: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchingRight: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              bloomLevel: { type: Type.STRING },
              points: { type: Type.NUMBER }
            },
            required: ["id", "content", "correctAnswer", "type", "bloomLevel"]
          }
        }
      }
    });
    return JSON.parse(cleanJsonResponse(response.text)) as Question[];
  } catch (error) { throw error; }
};

/**
 * FIX: Thêm hàm regenerateSingleQuestion để cho phép giáo viên đổi câu hỏi bất kỳ
 */
export const regenerateSingleQuestion = async (config: ExamConfig, oldQuestion: Question): Promise<Question> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key.");
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Tạo một câu hỏi tiếng Anh mới thay thế cho câu hỏi cũ này: "${oldQuestion.content}".
    Yêu cầu:
    - Loại câu hỏi: ${oldQuestion.type}
    - Mức độ Bloom: ${oldQuestion.bloomLevel}
    - Chủ đề chính: ${config.topic}
    - Yêu cầu bổ sung: ${config.customRequirement}
    Trả về một đối tượng JSON câu hỏi duy nhất.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchingLeft: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchingRight: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            bloomLevel: { type: Type.STRING },
            points: { type: Type.NUMBER }
          },
          required: ["content", "correctAnswer", "explanation"]
        }
      }
    });

    const result = JSON.parse(cleanJsonResponse(response.text));
    return {
      ...result,
      id: oldQuestion.id,
      type: oldQuestion.type,
      bloomLevel: result.bloomLevel || oldQuestion.bloomLevel
    };
  } catch (error) {
    console.error("Regenerate Question Error:", error);
    throw error;
  }
};

export const analyzeLanguage = async (text: string): Promise<DictionaryResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = `Phân tích từ/câu: "${text}"`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text)) as DictionaryResponse;
};

export interface DictionaryResponse {
  type: 'word' | 'phrase' | 'sentence' | 'not_found';
  word?: string;
  ipa?: string;
  meanings?: { partOfSpeech: string; def: string; example: string }[];
  translation?: string;
  correction?: string;
  grammarAnalysis?: { error: string; fix: string; explanation: string }[];
  structure?: string;
  usageNotes?: string;
}
