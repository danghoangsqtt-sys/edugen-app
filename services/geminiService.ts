
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

  // Khởi tạo instance AI mới mỗi lần gọi để đảm bảo lấy đúng API Key mới nhất
  const ai = new GoogleGenAI({ apiKey });
  
  // Sử dụng gemini-3-pro-preview cho các tác vụ phức tạp như biên soạn đề thi
  const modelName = 'gemini-3-pro-preview'; 
  
  const sectionsPrompt = config.sections.map(s => 
    `- Dạng bài: ${s.type}, Số lượng: ${s.count} câu, Mức độ Bloom: ${s.bloomLevels.join(', ')}, Điểm/câu: ${s.pointsPerQuestion}`
  ).join('\n');

  const prompt = `
    Bạn là một chuyên gia khảo thí Việt Nam hàng đầu. Hãy tạo một đề thi JSON dựa trên yêu cầu sau:
    - Tiêu đề: ${config.title}
    - Môn học/Chủ đề: ${config.subject} - ${config.topic}
    - Độ khó tổng thể: ${config.difficulty}
    - Yêu cầu riêng: "${config.customRequirement}"
    - Ma trận nội dung:
    ${sectionsPrompt}
    
    YÊU CẦU QUAN TRỌNG:
    1. Nội dung Tiếng Anh phải chuẩn bản ngữ (nếu là môn Tiếng Anh), nội dung kiến thức phải chính xác 100%.
    2. Format đề thi tuân thủ đúng chuẩn giáo dục Việt Nam.
    3. Luôn trả về một mảng JSON các đối tượng câu hỏi.
    4. KHÔNG giải thích gì thêm ngoài khối JSON.
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

    // QUAN TRỌNG: .text là thuộc tính (property), không được sử dụng dấu ngoặc đơn ()
    const textContent = response.text;
    if (!textContent) {
      throw new Error("AI không trả về nội dung.");
    }

    return JSON.parse(textContent) as Question[];
  } catch (error: any) {
    console.error("Gemini API Detail Error:", error);
    
    // Xử lý lỗi đặc thụ nếu API Key sai hoặc hết hạn
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("not found")) {
      throw new Error("API Key không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra lại trong Cài đặt.");
    }
    
    throw new Error("Lỗi AI: " + (error.message || "Không thể kết nối máy chủ AI."));
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
    Dựa trên bối cảnh đề thi: ${config.title} (${config.subject}).
    Hãy tạo lại 01 câu hỏi mới thay thế cho câu cũ, giữ nguyên định dạng và mức độ khó:
    - Dạng bài: ${oldQuestion.type}
    - Mức độ Bloom: ${oldQuestion.bloomLevel}
    - Nội dung cũ: "${oldQuestion.content}"
    Trả về duy nhất 1 đối tượng JSON.
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

    const textContent = response.text;
    if (!textContent) throw new Error("AI không trả về nội dung.");

    return JSON.parse(textContent) as Question;
  } catch (error: any) {
    console.error("Gemini Error during regeneration:", error);
    throw new Error("Lỗi AI khi đổi câu hỏi: " + error.message);
  }
};
