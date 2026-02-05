
import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyItem, SpeakingQuestion, SpeakingFeedback } from "../types";

const getApiKey = (): string => {
  const manualKey = localStorage.getItem('edugen_api_key');
  return manualKey || process.env.API_KEY || '';
};

const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

/**
 * Tạo câu hỏi phỏng vấn dựa trên danh sách từ vựng của chủ đề (Topic Mode)
 */
export const generateSpeakingQuestions = async (topic: string, vocabList: VocabularyItem[]): Promise<SpeakingQuestion[]> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key.");

  const ai = new GoogleGenAI({ apiKey });
  const words = vocabList.map(v => v.word).join(", ");
  
  const prompt = `
    Bạn là một giám khảo thi nói tiếng Anh IELTS.
    Hãy tạo 5 câu hỏi phỏng vấn ngắn (Speaking Part 1 & 2) xoay quanh chủ đề: "${topic}".
    Yêu cầu học sinh phải sử dụng được một số từ vựng sau: ${words}.
    Đặc biệt: Hãy cung cấp một "sampleAnswer" (câu trả lời mẫu) ngắn gọn, hay và tự nhiên cho mỗi câu hỏi để giáo viên dùng làm đáp án.
    Trả về định dạng JSON array.
  `;

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
              question: { type: Type.STRING },
              sampleAnswer: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: ["question", "sampleAnswer"]
          }
        }
      }
    });
    
    const rawQuestions = JSON.parse(cleanJsonResponse(response.text));
    return rawQuestions.map((q: any, idx: number) => ({
      ...q,
      id: `ai-speak-${Date.now()}-${idx}`,
      topic: topic
    }));
  } catch (error) {
    console.error("Gen Speaking Error:", error);
    throw error;
  }
};

/**
 * Đánh giá bài nói (Audio) của học sinh
 */
export const evaluateSpeakingSession = async (
  question: string, 
  audioBase64: string, 
  sampleAnswer?: string
): Promise<SpeakingFeedback> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Xây dựng prompt
  let promptText = `
    Đóng vai giám khảo chấm thi Speaking. 
    Câu hỏi là: "${question}". 
    Hãy nghe audio câu trả lời của thí sinh.
  `;
  
  if (sampleAnswer) {
    promptText += ` So sánh ý nghĩa với câu trả lời mẫu này (không cần giống hệt từ ngữ, chỉ cần đúng ý): "${sampleAnswer}".`;
  }

  promptText += `
    Yêu cầu trả về JSON object gồm:
    - transcription: Nội dung bạn nghe được (Text).
    - score: Điểm số (0-100).
    - pronunciation: Nhận xét chi tiết về phát âm (nêu lỗi sai cụ thể nếu có).
    - grammar: Nhận xét ngữ pháp và từ vựng.
    - betterVersion: Đề xuất một cách nói tự nhiên và hay hơn (Native speaker style).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Dùng flash cho nhanh, hoặc gemini-2.5-flash-native-audio-preview
      contents: [
        { text: promptText },
        { inlineData: { mimeType: 'audio/webm', data: audioBase64 } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            score: { type: Type.NUMBER },
            pronunciation: { type: Type.STRING },
            grammar: { type: Type.STRING },
            betterVersion: { type: Type.STRING }
          },
          required: ["score", "pronunciation", "grammar", "betterVersion", "transcription"]
        }
      }
    });

    return JSON.parse(cleanJsonResponse(response.text)) as SpeakingFeedback;
  } catch (error) {
    console.error("Evaluate Speaking Error:", error);
    throw error;
  }
};
