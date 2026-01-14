
import React from 'react';
import { ExamPaper as ExamPaperType } from '../types';

interface Props {
  data: ExamPaperType;
}

const AnswerSheet: React.FC<Props> = ({ data }) => {
  const { questions, config } = data;

  return (
    <div className="a4-container font-times text-black bg-white shadow-2xl mx-auto p-[20mm] min-h-[297mm] page-break mt-10 print:mt-0 print:shadow-none flex flex-col">
      <div className="text-center mb-10">
        <h1 className="text-[16pt] font-bold uppercase mb-1">ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI CHI TIẾT</h1>
        <p className="text-[13pt] font-bold uppercase">{config.title} - MÔN: {config.subject}</p>
        <p className="italic text-[11pt] mt-1">Mã đề: {data.version || config.examCode}</p>
      </div>

      {/* Bảng Đáp án nhanh */}
      <div className="mb-12">
        <h2 className="font-bold uppercase mb-4 text-[12pt] border-b border-black pb-1 inline-block">I. BẢNG ĐÁP ÁN NHANH</h2>
        <table className="w-full border-collapse border border-black text-center text-[12pt]">
          <thead>
            <tr className="bg-gray-50 font-bold">
              <th className="border border-black p-2 w-20">Câu</th>
              <th className="border border-black p-2">Đáp án</th>
              <th className="border border-black p-2 w-40">Mức độ Bloom</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="border border-black p-2 font-bold">{idx + 1}</td>
                <td className="border border-black p-2 text-red-600 font-bold whitespace-pre-wrap">{q.correctAnswer}</td>
                <td className="border border-black p-2 text-[11pt] italic">{q.bloomLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phần Giải thích chi tiết */}
      <div className="flex-1 space-y-8">
        <h2 className="font-bold uppercase text-[12pt] border-b border-black pb-1 inline-block">II. HƯỚNG DẪN GIẢI CHI TIẾT</h2>
        {questions.map((q, idx) => (
          <div key={idx} className="text-[12pt] space-y-2 border-l-4 border-indigo-100 pl-4 py-1 break-inside-avoid">
            <div className="flex items-start">
              <span className="font-bold mr-2 text-indigo-900">Câu {idx + 1}:</span>
              <p className="flex-1 font-medium italic text-gray-700">{q.content}</p>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold mr-2 text-red-600">➔ Đáp án:</span>
              <span className="font-bold text-red-600">{q.correctAnswer}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11pt] leading-relaxed">
              <span className="font-bold text-slate-800 flex items-center mb-1">
                <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Phân tích & Giải thích:
              </span> 
              <p className="text-slate-600 whitespace-pre-wrap">{q.explanation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Answer Sheet */}
      <div className="mt-16 pt-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10pt] uppercase tracking-widest font-bold mb-2">EduGen Pro - Hệ thống hỗ trợ giáo viên chuyên nghiệp</p>
        <p className="text-[8pt] text-slate-300 italic font-medium">Lập trình và sáng tạo bởi Đăng Hoàng; trong hệ sinh thái của DHsystem 2026 ©</p>
      </div>
    </div>
  );
};

export default AnswerSheet;
