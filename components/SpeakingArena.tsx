
import React, { useState } from 'react';
import SpeakingExamCreator from './SpeakingExamCreator';
import SpeakingBasicMode from './SpeakingBasicMode';
import SpeakingTopicMode from './SpeakingTopicMode';

const SpeakingArena: React.FC = () => {
  const [mode, setMode] = useState<'lobby' | 'basic' | 'topic' | 'exam-creator'>('lobby');

  // --- ROUTER ---
  if (mode === 'exam-creator') {
    const savedManual = localStorage.getItem('edugen_speaking_manual');
    const initialManual = savedManual ? JSON.parse(savedManual) : [];
    return <SpeakingExamCreator onBack={() => setMode('lobby')} initialManualQuestions={initialManual} />;
  }

  if (mode === 'basic') {
    return <SpeakingBasicMode onBack={() => setMode('lobby')} />;
  }

  if (mode === 'topic') {
    return <SpeakingTopicMode onBack={() => setMode('lobby')} />;
  }

  // --- LOBBY ---
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50 space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-2">Speaking <span className="text-indigo-600">Lab</span></h2>
        <p className="text-slate-400 font-bold uppercase tracking-[4px] text-xs">Phòng luyện phản xạ & phát âm</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <button onClick={() => setMode('basic')} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-indigo-200 transition-all text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <span className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-indigo-200">🎤</span>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Basic Interview</h3>
            <p className="text-[11px] text-slate-500 font-medium">Luyện tập với bộ câu hỏi cơ bản do giáo viên biên soạn.</p>
          </div>
        </button>

        <button onClick={() => setMode('topic')} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <span className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-emerald-200">🤖</span>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Topic Challenge</h3>
            <p className="text-[11px] text-slate-500 font-medium">Thử thách nói ngẫu nhiên cùng AI theo chủ đề.</p>
          </div>
        </button>

        <button onClick={() => setMode('exam-creator')} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-rose-200 transition-all text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <span className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-rose-200">📄</span>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Tạo Đề Thi Nói</h3>
            <p className="text-[11px] text-slate-500 font-medium">Ghép câu hỏi thành đề thi PDF & Đáp án chấm thi.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SpeakingArena;
