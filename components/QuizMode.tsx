
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import GameFeedback from './GameFeedback';

interface QuizModeProps {
  questions: Question[];
  playerName: string;
  onFinish: (score: number, streak: number) => void;
  onBack: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ questions, playerName, onFinish, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState<{correct: boolean, msg: string, explanation?: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = questions[currentIdx];

  useEffect(() => {
    let timer: number;
    if (timeLeft > 0 && !feedback) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !feedback) {
      handleAnswer("");
    }
    return () => clearInterval(timer);
  }, [timeLeft, feedback]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    const isCorrect = answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
      const bonus = timeLeft * 10 + streak * 20;
      setScore(prev => prev + 100 + bonus);
      setStreak(prev => prev + 1);
      setFeedback({ correct: true, msg: "Bạn làm rất tốt!", explanation: q.explanation });
      setTimeout(nextQuestion, 1200);
    } else {
      setStreak(0);
      setFeedback({ correct: false, msg: `Đáp án: ${q.correctAnswer}`, explanation: q.explanation });
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(15);
    } else {
      onFinish(score, streak);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-4 relative animate-content">
      {feedback && <GameFeedback isCorrect={feedback.correct} message={feedback.msg} explanation={feedback.explanation} onNext={nextQuestion} />}
      
      <div className="flex justify-between items-center mb-6 bg-white p-3 px-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 transition-colors mr-1">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
          </button>
          <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-slate-200">{currentIdx + 1}</div>
          <div className="hidden sm:block">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Chiến binh</p>
            <span className="text-[10px] font-black text-slate-700">{playerName}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">SCORE</p>
            <p className="text-lg font-black text-indigo-600 tabular-nums">{score}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm transition-colors ${timeLeft < 5 ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-indigo-500 text-indigo-500'}`}>{timeLeft}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="bg-slate-50 p-6 md:p-10 rounded-[32px] text-center w-full border-b-4 border-slate-100 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-[3px] shadow-lg shadow-indigo-100">QUIZ ARENA</span>
          <p className="text-lg md:text-xl font-black text-slate-800 leading-snug">{q.content}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {q.options?.map((o, i) => (
            <button key={i} onClick={() => handleAnswer(o)} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-center gap-4 group active:scale-95 shadow-sm">
              <span className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center font-black text-xs italic group-hover:bg-indigo-600 group-hover:text-white transition-all">{String.fromCharCode(65 + i)}</span>
              <span className="text-[13px] font-bold text-slate-700">{o}</span>
            </button>
          )) || (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2">
              <input 
                ref={inputRef}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAnswer((e.target as HTMLInputElement).value)} 
                className="w-full bg-white border-2 border-slate-100 p-5 rounded-2xl text-lg font-black text-center outline-none focus:border-indigo-500 shadow-sm transition-all uppercase placeholder:text-slate-200" 
                placeholder="Câu trả lời của bạn..." 
              />
              <p className="text-center mt-3 text-[8px] font-black text-slate-400 uppercase tracking-[2px]">Nhấn <span className="text-indigo-600">Enter</span> để xác nhận</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
