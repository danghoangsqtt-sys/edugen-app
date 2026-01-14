
import { GoogleGenAI, Type } from "@google/genai";
import { ExamConfig, Question, QuestionType, BloomLevel } from "../types";

/**
 * Lấy API Key từ localStorage hoặc biến môi trường
 */
const getApiKey = () => {
  const savedKey = localStorage.getItem('edugen_api_key');
  return savedKey || process.env.API_KEY || "";
};

/**
 * Generates the full content for an exam paper based on the provided configuration.
 */
export const generateExamContent = async (config: ExamConfig): Promise<Question[]> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key. Vui lòng vào phần Cài đặt.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-flash-preview'; 
  
  const sectionsPrompt = config.sections.map(s => 
    `- Dạng bài: ${s.type}, Số lượng: ${s.count} câu, Mức độ Bloom: ${s.bloomLevels.join(', ')}, Điểm/câu: ${s.pointsPerQuestion}`
  ).join('\n');

  const prompt = `
    Bạn là một chuyên gia khảo thí Việt Nam hàng đầu. Hãy tạo một đề thi JSON dựa trên yêu cầu:
    - Tiêu đề: ${config.title}
    - Môn học/Chủ đề: ${config.subject} - ${config.topic}
    - Độ khó tổng thể: ${config.difficulty}
    - Yêu cầu riêng: "${config.customRequirement}"
    - Ma trận: ${sectionsPrompt}
    
    LƯU Ý QUAN TRỌNG:
    1. Nội dung Tiếng Anh phải chuẩn bản ngữ, nội dung Lý thuyết phải chính xác 100%.
    2. Format đề thi tuân thủ đúng chuẩn giáo dục Việt Nam (Thông tư 06/2019/TT-BGDĐT).
    3. Trả về JSON mảng các đối tượng câu hỏi với giải thích chi tiết.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(QuestionType) },
              content: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchingLeft: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchingRight: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              bloomLevel: { type: Type.STRING, enum: Object.values(BloomLevel) },
              points: { type: Type.NUMBER }
            },
            required: ["id", "type", "content", "correctAnswer", "explanation", "bloomLevel"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]") as Question[];
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("Lỗi AI: " + (error.message || "Không thể kết nối máy chủ AI. Kiểm tra lại API Key."));
  }
};

/**
 * Regenerates a single question based on the exam context.
 */
export const regenerateSingleQuestion = async (config: ExamConfig, oldQuestion: Question): Promise<Question> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-pro-preview'; 

  const prompt = `
    Dựa trên cấu trúc đề thi: ${config.title} (${config.subject}).
    Tạo lại 01 câu hỏi mới thay thế cho câu cũ (cùng dạng và độ khó):
    - Dạng: ${oldQuestion.type}
    - Mức độ: ${oldQuestion.bloomLevel}
    - Cũ: ${oldQuestion.content}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: Object.values(QuestionType) },
            content: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchingLeft: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchingRight: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            bloomLevel: { type: Type.STRING, enum: Object.values(BloomLevel) },
            points: { type: Type.NUMBER }
          },
          required: ["id", "type", "content", "correctAnswer", "explanation", "bloomLevel"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as Question;
  } catch (error: any) {
    console.error("Gemini Error during regeneration:", error);
    throw new Error("Lỗi AI khi đổi câu hỏi.");
  }
};
