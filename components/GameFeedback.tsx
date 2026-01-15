
import React from 'react';

interface GameFeedbackProps {
  isCorrect: boolean;
  message: string;
  explanation?: string;
  onNext: () => void;
}

const GameFeedback: React.FC<GameFeedbackProps> = ({ isCorrect, message, explanation, onNext }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className={`max-w-md w-full p-6 rounded-[32px] shadow-2xl border-t-8 ${isCorrect ? 'border-emerald-500 bg-white' : 'border-rose-500 bg-white'}`}>
        <div className="text-4xl mb-2 text-center">{isCorrect ? '🎯' : '⚠️'}</div>
        <h2 className={`text-xl font-black text-center uppercase tracking-tight ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isCorrect ? 'CHÍNH XÁC!' : 'CHƯA ĐÚNG!'}
        </h2>
        <p className="text-sm font-bold text-slate-700 mt-1 text-center">{message}</p>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-[12px] font-medium text-slate-600 border border-slate-100 leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar">
          <span className="block text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">Giải thích trí tuệ:</span>
          {explanation || "Câu hỏi này đòi hỏi sự tập trung và kiến thức nền tảng vững chắc."}
        </div>

        <button 
          onClick={onNext} 
          className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
        >
          Tiếp tục ngay
        </button>
      </div>
    </div>
  );
};

export default GameFeedback;
