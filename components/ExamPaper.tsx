import React, { useState } from 'react';
import { ExamPaper as ExamPaperType, QuestionType, Question } from '../types';
import { regenerateSingleQuestion } from '../services/geminiService';

interface Props {
  data: ExamPaperType;
  onUpdateQuestion: (index: number, updated: Question) => void;
}

const ExamPaper: React.FC<Props> = ({ data, onUpdateQuestion }) => {
  const { config, questions } = data;
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const handleRegenerate = async (index: number) => {
    setRegeneratingIndex(index);
    try {
      const newQuestion = await regenerateSingleQuestion(config, questions[index]);
      onUpdateQuestion(index, { ...newQuestion, id: questions[index].id });
    } catch (err) {
      alert("Không thể tạo lại câu hỏi. Vui lòng thử lại.");
    } finally {
      setRegeneratingIndex(null);
    }
  };

  return (
    <div className="a4-container font-times text-black bg-white shadow-2xl p-[15mm] min-h-[297mm] w-[210mm] relative overflow-hidden print:overflow-visible print:block print:h-auto print:shadow-none print:p-[10mm] print:m-0 flex flex-col">
      {/* Header chuẩn hành chính - Đã sửa lỗi xuống dòng & canh lề */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="text-center">
          {/* Tên trường & Tổ chuyên môn */}
          <p className="font-bold uppercase text-[10pt] md:text-[11pt] whitespace-nowrap">
            {config.schoolName || "TRƯỜNG THCS & THPT ..."}
          </p>
          <p className="font-bold border-b border-black inline-block px-1 pb-0.5 text-[10pt] md:text-[11pt]">
            {config.department || "TỔ CHUYÊN MÔN"}
          </p>
        </div>
        
        <div className="text-center">
          {/* Quốc hiệu & Tiêu ngữ - Sử dụng whitespace-nowrap để chống rớt dòng */}
          <p className="font-bold uppercase text-[10pt] md:text-[11pt] whitespace-nowrap">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="font-bold border-b border-black inline-block px-1 pb-0.5 text-[11pt] md:text-[12pt] whitespace-nowrap">
            Độc lập - Tự do - Hạnh phúc
          </p>
        </div>
      </div>

      {/* Tiêu đề đề thi */}
      <div className="text-center mb-5">
        <h1 className="text-[12pt] md:text-[14pt] font-bold uppercase mb-1 tracking-tight">{config.title}</h1>
        <p className="text-[10pt] md:text-[12pt] font-bold">MÔN: {config.subject.toUpperCase()}</p>
        <p className="italic text-[9pt] mt-0.5">Thời gian làm bài: {config.duration} phút</p>
        <p className="font-bold mt-0.5 text-[10pt]">Mã đề thi: {config.examCode}</p>
      </div>

      {/* Thông tin thí sinh */}
      <div className="border border-black p-2.5 mb-5 text-[10pt] md:text-[11pt] space-y-2">
        <div className="flex items-baseline">
          <span className="whitespace-nowrap font-bold">Họ và tên:</span>
          <div className="flex-1 border-b border-dotted border-black ml-2 opacity-50"></div>
          <span className="ml-3 font-bold">Lớp:</span>
          <div className="w-16 border-b border-dotted border-black ml-2 opacity-50"></div>
        </div>
        <div className="flex items-baseline">
          <span className="whitespace-nowrap font-bold">SBD:</span>
          <div className="w-32 border-b border-dotted border-black ml-2 opacity-50"></div>
        </div>
      </div>

      {/* Nội dung chính các câu hỏi */}
      <div className="flex-1 space-y-5 text-[11pt] md:text-[12pt] leading-relaxed relative">
        {config.sections.map((section, sIdx) => {
          const sectionQuestions = questions.filter(q => q.type === section.type);
          if (sectionQuestions.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-3">
              <h3 className="font-bold uppercase text-[10pt] flex items-center bg-gray-50/50 p-1">
                <span className="mr-2">PHẦN {sIdx + 1}: {section.type.toUpperCase()}</span>
                <span className="font-normal lowercase italic text-[9pt]">({sectionQuestions.length} câu, {section.pointsPerQuestion} đ/câu)</span>
              </h3>
              <div className="space-y-3">
                {sectionQuestions.map((q) => {
                  const globalIdx = questions.indexOf(q);
                  return (
                    <div key={q.id} className="group relative pl-1 break-inside-avoid">
                      <div className="flex items-start">
                        <span className="font-bold mr-1.5 whitespace-nowrap">Câu {globalIdx + 1}.</span>
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap">{q.content}</p>
                          
                          {q.type === QuestionType.MULTIPLE_CHOICE && q.options && (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-1.5">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-baseline">
                                  <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === QuestionType.MATCHING && q.matchingLeft && q.matchingRight && (
                            <div className="grid grid-cols-2 gap-x-10 mt-2 border border-gray-100 p-3 bg-gray-50/20">
                              <div className="space-y-1">
                                {q.matchingLeft.map((item, i) => (
                                  <div key={i} className="flex text-[10pt]"><span className="w-5 font-bold">{i+1}.</span> <span className="flex-1">{item}</span></div>
                                ))}
                              </div>
                              <div className="space-y-1">
                                {q.matchingRight.map((item, i) => (
                                  <div key={i} className="flex text-[10pt]"><span className="w-5 font-bold">{String.fromCharCode(97 + i)}.</span> <span className="flex-1">{item}</span></div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(q.type === QuestionType.ESSAY || 
                            q.type === QuestionType.WORD_ORDER || 
                            q.type === QuestionType.SPELLING ||
                            q.type === QuestionType.FILL_BLANKS) && (
                            <div className="mt-2 space-y-3">
                              <div className="border-b border-dotted border-black w-full h-3.5 opacity-20"></div>
                              <div className="border-b border-dotted border-black w-full h-3.5 opacity-20"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="hidden group-hover:flex items-center no-print ml-2 self-start">
                           <button 
                            onClick={() => handleRegenerate(globalIdx)}
                            disabled={regeneratingIndex === globalIdx}
                            className="p-1 bg-white hover:bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100 shadow-sm"
                            title="Đổi câu hỏi"
                          >
                            <svg className={`w-3 h-3 ${regeneratingIndex === globalIdx ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        <p className="font-bold uppercase tracking-[3px] text-[9pt]">--- HẾT ---</p>
      </div>

      <div className="mt-6 grid grid-cols-2 text-center text-[10pt] md:text-[11pt] break-inside-avoid">
        <div className="space-y-1">
          <p className="font-bold uppercase">XÁC NHẬN TỔ CHUYÊN MÔN</p>
          <div className="h-16"></div>
          <p className="font-bold">{config.department || "..........................."}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold uppercase">GIÁO VIÊN RA ĐỀ</p>
          <div className="h-16"></div>
          <p className="font-bold">{config.teacherName || "..........................."}</p>
        </div>
      </div>

      {/* Footer Bản Quyền DHsystem */}
      <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-[7pt] text-slate-400 font-medium italic">
        <span>Mã đề: {config.examCode} | Trang 1/1</span>
        <span className="text-right">Lập trình & sáng tạo bởi Đăng Hoàng; DHsystem 2026 ©</span>
      </div>
    </div>
  );
};

export default ExamPaper;