
import React, { useState, useEffect, useCallback } from 'react';
import { Question, LeaderboardEntry } from '../types';

type GameMode = 'quiz' | 'scramble' | 'blitz' | 'survival';

interface GameCenterProps {
  questions: Question[];
  examTitle: string;
}

const GameCenter: React.FC<GameCenterProps> = ({ questions, examTitle }) => {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [selectedMode, setSelectedMode] = useState<GameMode>('quiz');
  const [playerName, setPlayerName] = useState('');
  
  const [gameQuestions, setGameQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState<{correct: boolean, msg: string} | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('edugen_leaderboard');
    if (saved) setLeaderboard(JSON.parse(saved));
    const savedSettings = localStorage.getItem('edugen_settings');
    if (savedSettings) {
      try {
        const s = JSON.parse(savedSettings);
        if (s.teacherName) setPlayerName(s.teacherName);
      } catch (e) {}
    }
  }, []);

  const prepareGameData = (mode: GameMode) => {
    if (questions.length === 0) return [];
    return questions.map(q => {
      if (mode === 'scramble') {
        const text = q.correctAnswer;
        const scrambled = text.split('').sort(() => Math.random() - 0.5).join('');
        return { ...q, scrambled, hint: q.content };
      }
      return q;
    }).sort(() => Math.random() - 0.5);
  };

  const startGame = (mode: GameMode) => {
    if (!playerName) { alert("Vui lòng nhập tên chiến binh!"); return; }
    if (questions.length === 0) { alert("Hãy chọn một đề thi trước!"); return; }
    setSelectedMode(mode);
    setGameQuestions(prepareGameData(mode));
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setLives(mode === 'survival' ? 3 : 99);
    setTimeLeft(mode === 'blitz' ? 7 : 15);
    setGameState('playing');
  };

  const handleAnswer = (answer: string) => {
    if (gameState !== 'playing') return;
    const q = gameQuestions[currentIdx];
    let isCorrect = answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    if (isCorrect) {
      setScore(prev => prev + 100 + timeLeft * 10 + streak * 20);
      setStreak(prev => prev + 1);
      setFeedback({ correct: true, msg: "Quá đỉnh!" });
    } else {
      setStreak(0);
      if (selectedMode === 'survival') setLives(prev => prev - 1);
      setFeedback({ correct: false, msg: `Sai rồi! ${q.correctAnswer}` });
    }
    setTimeout(() => {
      setFeedback(null);
      if ((selectedMode !== 'survival' || (lives > (isCorrect ? 0 : 1))) && currentIdx < gameQuestions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setTimeLeft(selectedMode === 'blitz' ? 7 : 15);
      } else {
        const entry: LeaderboardEntry = { playerName, score, time: new Date().toLocaleTimeString(), topic: examTitle };
        const newLB = [entry, ...leaderboard].sort((a, b) => b.score - a.score).slice(0, 5);
        setLeaderboard(newLB);
        localStorage.setItem('edugen_leaderboard', JSON.stringify(newLB));
        setGameState('result');
      }
    }, isCorrect ? 600 : 1500);
  };

  if (gameState === 'lobby') {
    return (
      <div className="h-full bg-slate-50 flex flex-col items-center py-10 px-4 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight uppercase italic">Arena <span className="text-indigo-600">Studio</span></h1>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[4px]">Vào trận chiến kiến thức</p>
        </div>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 md:p-10 rounded-[32px] border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Tên Chiến Binh</label>
              <input className="w-full bg-slate-50 border p-4 rounded-2xl text-xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 shadow-inner" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Tên bạn..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ModeBtn title="Quiz" icon="🏆" mode="quiz" onClick={startGame} color="bg-indigo-600" />
              <ModeBtn title="Survival" icon="💀" mode="survival" onClick={startGame} color="bg-rose-600" />
              <ModeBtn title="Blitz" icon="⚡" mode="blitz" onClick={startGame} color="bg-amber-500" />
              <ModeBtn title="Scramble" icon="🧩" mode="scramble" onClick={startGame} color="bg-emerald-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl">
            <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-widest mb-4 border-b pb-2">Bảng Vàng</h3>
            <div className="space-y-2">
              {leaderboard.map((e, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
                  <span className="text-[10px] font-black text-slate-700 truncate w-24">{i+1}. {e.playerName}</span>
                  <span className="text-[10px] font-black text-indigo-600">{e.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = gameQuestions[currentIdx];
    return (
      <div className="h-full bg-white flex flex-col p-4 md:p-10 animate-content relative">
        {feedback && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-10">
            <div className={`text-center p-8 rounded-[40px] shadow-2xl border-4 ${feedback.correct ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'}`}>
              <div className="text-4xl mb-2">{feedback.correct ? '✅' : '❌'}</div>
              <h2 className="text-2xl font-black uppercase italic">{feedback.correct ? 'ĐÚNG!' : 'SAI!'}</h2>
              <p className="text-sm font-bold opacity-80 mt-1">{feedback.msg}</p>
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-slate-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg">{currentIdx+1}</div>
              <div>
                <p className="text-xs font-black text-slate-800">{playerName}</p>
                <div className="flex gap-1 mt-0.5">{Array.from({length:3}).map((_,i)=><div key={i} className={`w-2 h-2 rounded-full ${i<lives?'bg-rose-500':'bg-slate-200'}`}></div>)}</div>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-lg ${timeLeft < 5 ? 'border-rose-500 text-rose-500' : 'border-indigo-600 text-indigo-600'}`}>{timeLeft}</div>
            <div className="text-right">
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Score</p>
              <p className="text-xl font-black text-slate-800">{score}</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-lg text-center w-full mb-8 border-b-8 border-slate-100">
              <p className="text-lg md:text-2xl font-black text-slate-900 italic leading-snug">{selectedMode === 'scramble' ? `Từ khóa: ${q.hint}` : q.content}</p>
              {selectedMode === 'scramble' && <div className="mt-6 flex flex-wrap justify-center gap-2">{q.scrambled.split('').map((c:string,i:number)=><div key={i} className="w-8 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl font-black text-indigo-600 border shadow-sm uppercase">{c}</div>)}</div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {q.options?.map((o:string, i:number) => (
                <button key={i} onClick={() => handleAnswer(o)} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left flex items-center gap-4 group active:scale-95">
                  <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm italic group-hover:bg-indigo-600 group-hover:text-white transition-colors">{String.fromCharCode(65+i)}</span>
                  <span className="text-sm font-bold text-slate-700">{o}</span>
                </button>
              )) || (
                <div className="w-full">
                  <input autoFocus onKeyDown={e => e.key === 'Enter' && handleAnswer((e.target as HTMLInputElement).value)} className="w-full bg-slate-50 border-4 border-indigo-100 p-6 rounded-3xl text-2xl font-black text-center outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-200" placeholder="ĐÁP ÁN..." />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-10 md:p-20 rounded-[48px] shadow-2xl border border-slate-200 text-center space-y-6 animate-content max-w-lg w-full">
        <div className="text-6xl">🏆</div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase italic">Kết quả</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-6 rounded-3xl border">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
            <p className="text-3xl font-black text-indigo-600">{score}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</p>
            <p className="text-3xl font-black text-emerald-500">{streak}</p>
          </div>
        </div>
        <button onClick={() => setGameState('lobby')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all">TIẾP TỤC</button>
      </div>
    </div>
  );
};

const ModeBtn: React.FC<{ title: string, icon: string, mode: GameMode, onClick: (m: GameMode) => void, color: string }> = ({ title, icon, mode, onClick, color }) => (
  <button onClick={() => onClick(mode)} className={`p-4 rounded-2xl text-white text-left transition-all flex flex-col gap-1 group shadow-md hover:scale-105 active:scale-95 ${color}`}>
    <span className="text-2xl mb-1 block transition-transform group-hover:rotate-12">{icon}</span>
    <h4 className="font-black uppercase text-[10px] tracking-tight">{title}</h4>
  </button>
);
export default GameCenter;
