
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

    const textContent = response.text;
    if (!textContent) throw new Error("AI không trả về nội dung.");

    return JSON.parse(textContent) as Question[];
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("QUOTA_EXCEEDED")) {
      throw new Error("Tài khoản của bạn đã hết lượt dùng AI miễn phí. Vui lòng thử lại sau.");
    }
    throw new Error("Lỗi AI: " + errorMsg);
  }
};

/**
 * Regenerates a single question based on the exam context.
 */
export const regenerateSingleQuestion = async (config: ExamConfig, oldQuestion: Question): Promise<Question> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-flash-preview'; 

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
    throw new Error("Lỗi AI: Không thể đổi câu hỏi.");
  }
};

// ==================================================================================
// PHẦN CẬP NHẬT: HỖ TRỢ TỪ ĐIỂN, DỊCH THUẬT & PHÂN TÍCH NGỮ PHÁP
// ==================================================================================

export interface DictionaryResponse {
  type: 'word' | 'phrase' | 'sentence' | 'not_found';
  word?: string;
  ipa?: string;
  meanings?: { partOfSpeech: string; def: string; example: string; synonyms?: string[] }[];
  translation?: string;
  correction?: string;
  grammarAnalysis?: { 
    error: string; 
    fix: string; 
    explanation: string; 
    rule: string 
  }[];
  structure?: string;
  usageNotes?: string;
}

export const analyzeLanguage = async (text: string): Promise<DictionaryResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-flash-preview';

  const prompt = `
    Bạn là một chuyên gia ngôn ngữ học và gia sư Tiếng Anh cao cấp. Hãy phân tích nội dung sau: "${text}"
    
    YÊU CẦU XỬ LÝ THEO ĐỊNH DẠNG JSON:
    1. Nếu nội dung là TỪ ĐƠN (VD: "Education", "Run"):
       - Trả về type: "word"
       - Cung cấp IPA chuẩn (phiên âm quốc tế).
       - Meanings: [{ partOfSpeech, def, example, synonyms }]. Tối đa 4 nghĩa thông dụng.
       - usageNotes: Lưu ý cách dùng hoặc các collocations đi kèm.

    2. Nếu nội dung là CỤM TỪ / THÀNH NGỮ (VD: "Take a break", "Piece of cake"):
       - Trả về type: "phrase"
       - translation: Nghĩa tiếng Việt tương đương.
       - structure: Phân tích thành phần cụm từ.
       - meanings: Giải thích chi tiết và ví dụ.

    3. Nếu là CÂU VĂN / ĐOẠN VĂN:
       - Trả về type: "sentence"
       - translation: Dịch thuật chuẩn xác, mượt mà.
       - correction: Nếu câu có lỗi (ngữ pháp, từ vựng, văn phong), hãy sửa lại cho đúng. Nếu đúng rồi thì để trống.
       - grammarAnalysis: Phân tích các điểm ngữ pháp quan trọng hoặc lỗi sai cụ thể.
       - structure: Sơ đồ cấu trúc câu (VD: S + V + O).

    4. Nếu nội dung vô nghĩa hoặc không xác định:
       - Trả về type: "not_found".

    TRẢ VỀ DUY NHẤT JSON.
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
            type: { type: Type.STRING, enum: ["word", "phrase", "sentence", "not_found"] },
            word: { type: Type.STRING },
            ipa: { type: Type.STRING },
            meanings: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  partOfSpeech: { type: Type.STRING }, 
                  def: { type: Type.STRING }, 
                  example: { type: Type.STRING },
                  synonyms: { type: Type.ARRAY, items: { type: Type.STRING } }
                } 
              } 
            },
            translation: { type: Type.STRING },
            correction: { type: Type.STRING },
            grammarAnalysis: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  error: { type: Type.STRING }, 
                  fix: { type: Type.STRING }, 
                  explanation: { type: Type.STRING }, 
                  rule: { type: Type.STRING } 
                } 
              } 
            },
            structure: { type: Type.STRING },
            usageNotes: { type: Type.STRING }
          }
        }
      }
    });

    const textContent = response.text;
    if (!textContent) throw new Error("AI không phản hồi.");
    return JSON.parse(textContent) as DictionaryResponse;

  } catch (error: any) {
    console.error("Language Analysis Error:", error);
    return { type: 'not_found' };
  }
};
