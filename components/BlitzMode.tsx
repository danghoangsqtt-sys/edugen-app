
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import GameFeedback from './GameFeedback';

interface BlitzModeProps {
  questions: Question[];
  playerName: string;
  onFinish: (score: number, streak: number) => void;
  onBack: () => void;
}

const BlitzMode: React.FC<BlitzModeProps> = ({ questions, playerName, onFinish, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(500); // 5.00 seconds in 10ms units
  const [feedback, setFeedback] = useState<{correct: boolean, msg: string, explanation?: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const q = questions[currentIdx];

  useEffect(() => {
    let timer: number;
    if (timeLeft > 0 && !feedback) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 10);
    } else if (timeLeft === 0 && !feedback) {
      handleAnswer("");
    }
    return () => clearInterval(timer);
  }, [timeLeft, feedback]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    const isCorrect = answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
      const speedBonus = Math.floor(timeLeft * 2);
      setScore(prev => prev + 200 + speedBonus);
      setStreak(prev => prev + 1);
      setFeedback({ correct: true, msg: `+${200 + speedBonus}⚡`, explanation: q.explanation });
      setTimeout(nextQuestion, 600);
    } else {
      setStreak(0);
      setFeedback({ correct: false, msg: "HẾT TỐC ĐỘ!", explanation: q.explanation });
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(500);
    } else {
      onFinish(score, streak);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full py-4 relative bg-[#0a0a0c] text-white p-6 rounded-[40px] border border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.1)] animate-content">
      {feedback && <GameFeedback isCorrect={feedback.correct} message={feedback.msg} explanation={feedback.explanation} onNext={nextQuestion} />}
      
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-yellow-500/30 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            ⚡ BLITZ ZONE
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-yellow-500/50 uppercase tracking-widest">VOLTAGE</p>
          <p className="text-3xl font-black italic text-yellow-500 leading-none shadow-yellow-500/50">{score}</p>
        </div>
      </div>

      <div className="w-full bg-white/5 h-2.5 rounded-full mb-10 overflow-hidden p-0.5 border border-white/5">
        <div 
          className={`h-full transition-all duration-75 rounded-full ${timeLeft < 150 ? 'bg-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]'}`}
          style={{ width: `${(timeLeft / 500) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
        <div className="relative">
          <svg className="w-16 h-16 absolute -top-12 -left-12 text-yellow-500/10" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-tight animate-in slide-in-from-top-4">
            {q.content}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full px-4">
          {q.options?.slice(0, 4).map((o, i) => (
            <button 
              key={i} 
              onClick={() => handleAnswer(o)} 
              className="group relative overflow-hidden bg-white/5 border-2 border-white/10 p-5 rounded-2xl hover:border-yellow-500 hover:bg-yellow-500 hover:text-black transition-all active:scale-95 shadow-lg"
            >
              <span className="relative z-10 text-lg font-black tracking-tight">{o}</span>
              <div className="absolute inset-0 bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity -z-0"></div>
            </button>
          )) || (
             <div className="w-full relative px-6">
                <input 
                  ref={inputRef}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAnswer((e.target as HTMLInputElement).value)} 
                  className="w-full bg-transparent border-b-4 border-yellow-500/30 p-6 text-3xl font-black text-center outline-none focus:border-yellow-500 transition-all uppercase placeholder:text-white/5" 
                  placeholder="NHẬP NGAY!" 
                />
                <p className="text-[8px] font-black text-yellow-500/30 uppercase tracking-[4px] mt-4">Tốc độ là chìa khóa!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlitzMode;
