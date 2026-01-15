
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import GameFeedback from './GameFeedback';

interface SurvivalModeProps {
  questions: Question[];
  playerName: string;
  onFinish: (score: number, streak: number) => void;
  onBack: () => void;
}

const SurvivalMode: React.FC<SurvivalModeProps> = ({ questions, playerName, onFinish, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hp, setHp] = useState(100);
  const [feedback, setFeedback] = useState<{correct: boolean, msg: string, explanation?: string} | null>(null);

  const q = questions[currentIdx];

  useEffect(() => {
    let timer: number;
    if (hp > 0 && !feedback) {
      timer = window.setInterval(() => setHp(prev => Math.max(0, prev - 1.2)), 100);
    } else if (hp <= 0) {
      onFinish(score, streak);
    }
    return () => clearInterval(timer);
  }, [hp, feedback]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    const isCorrect = answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
      setHp(prev => Math.min(100, prev + 25));
      setScore(prev => prev + 250);
      setStreak(prev => prev + 1);
      setFeedback({ correct: true, msg: "+25HP ❤️", explanation: q.explanation });
      setTimeout(nextQuestion, 1200);
    } else {
      setHp(prev => Math.max(0, prev - 30));
      setStreak(0);
      setFeedback({ correct: false, msg: "-30HP 💔", explanation: q.explanation });
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onFinish(score, streak);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-4 relative animate-content">
      {feedback && <GameFeedback isCorrect={feedback.correct} message={feedback.msg} explanation={feedback.explanation} onNext={nextQuestion} />}
      
      <div className="flex justify-between items-center px-4 mb-4">
         <button onClick={onBack} className="p-2 hover:bg-rose-50 rounded-xl text-rose-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
         <div className="text-center flex flex-col">
            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Sinh mệnh chiến binh</span>
            <span className="text-[10px] font-black text-slate-700">{playerName}</span>
         </div>
         <div className="w-9"></div> {/* Spacer */}
      </div>

      <div className="mb-8 space-y-2 px-6">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-rose-600">
           <span>Vitality</span>
           <span className={`${hp < 30 ? 'animate-pulse scale-110' : ''}`}>{Math.ceil(hp)}%</span>
        </div>
        <div className="w-full bg-slate-100 h-5 rounded-2xl p-1 border border-slate-200 shadow-inner">
          <div 
            className={`h-full rounded-xl transition-all duration-300 ${hp < 30 ? 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse' : 'bg-gradient-to-r from-rose-500 to-orange-400 shadow-lg shadow-rose-100'}`}
            style={{ width: `${hp}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-[40px] shadow-[0_25px_60px_rgba(225,29,72,0.1)] border border-rose-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </div>
        
        <div className="text-center space-y-8 relative z-10 w-full">
          <span className="inline-block px-5 py-1.5 bg-rose-600 text-white rounded-full text-[9px] font-black uppercase tracking-[4px] shadow-lg shadow-rose-200">LAST STAND</span>
          <h2 className="text-2xl font-black text-slate-800 leading-tight md:text-3xl animate-in slide-in-from-top-4">
            {q.content}
          </h2>

          <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto">
            {q.options?.map((o, i) => (
              <button key={i} onClick={() => handleAnswer(o)} className="bg-white p-5 rounded-2xl border-2 border-slate-50 hover:border-rose-500 hover:bg-rose-50 transition-all text-left flex items-center gap-4 group active:scale-95 shadow-sm">
                <span className="w-8 h-8 bg-slate-50 text-rose-500 rounded-lg flex items-center justify-center font-black text-sm group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">{i + 1}</span>
                <span className="text-[13px] font-bold text-slate-700">{o}</span>
              </button>
            )) || (
               <div className="w-full relative px-2 animate-in fade-in slide-in-from-bottom-2">
                 <input 
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAnswer((e.target as HTMLInputElement).value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-xl font-black text-center focus:border-rose-500 focus:bg-white transition-all outline-none shadow-inner" 
                  placeholder="NHẬP NGAY ĐỂ SỐNG..." 
                />
                <p className="text-center mt-4 text-[8px] font-black text-rose-400 uppercase tracking-[3px]">Cảnh báo: Sai lầm sẽ phải trả giá bằng HP!</p>
               </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center gap-12">
         <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[3px] mb-1">Thành tích</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{score}</p>
         </div>
         <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[3px] mb-1">Combo</p>
            <p className="text-3xl font-black text-rose-600 tabular-nums">{streak}</p>
         </div>
      </div>
    </div>
  );
};

export default SurvivalMode;
