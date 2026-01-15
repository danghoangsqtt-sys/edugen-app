
import React, { useState, useEffect } from 'react';
import { ExamConfig, ExamPaper as ExamPaperType, Question } from './types';
import { generateExamContent } from './services/geminiService';
import { checkAppUpdate } from './services/updateService';
import ConfigPanel from './components/ConfigPanel';
import ExamPaper from './components/ExamPaper';
import AnswerSheet from './components/AnswerSheet';
import GameCenter from './components/GameCenter';
import SettingsPanel from './components/SettingsPanel';
import LibraryPanel from './components/LibraryPanel';
import ChatbotPanel from './components/ChatbotPanel';

const electron = (window as any).require ? (window as any).require('electron') : null;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'game' | 'chatbot' | 'settings'>('create');
  const [examList, setExamList] = useState<ExamPaperType[]>([]);
  const [currentExamIndex, setCurrentExamIndex] = useState<number>(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'exam' | 'answer' | 'both'>('exam');
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newUpdateAvailable, setNewUpdateAvailable] = useState(false);

  const currentExam = currentExamIndex >= 0 ? examList[currentExamIndex] : null;

  useEffect(() => {
    const savedExams = localStorage.getItem('edugen_ultimate_db');
    if (savedExams) {
      try {
        const parsed = JSON.parse(savedExams);
        setExamList(parsed);
      } catch (e) {
        console.error("Lỗi đọc dữ liệu:", e);
      }
    }

    const checkUpdates = async () => {
      try {
        const update = await checkAppUpdate();
        if (update.hasUpdate) {
          setNewUpdateAvailable(true);
        }
      } catch (err) {}
    };
    checkUpdates();
  }, []);

  const handleMinimize = () => electron?.ipcRenderer.send('window-minimize');
  const handleMaximize = () => electron?.ipcRenderer.send('window-maximize');
  const handleClose = () => electron?.ipcRenderer.send('window-close');

  const handleGenerate = async (config: ExamConfig) => {
    setIsGenerating(true);
    try {
      const questions = await generateExamContent(config);
      const newExam: ExamPaperType = {
        id: `EXAM-${Date.now()}`,
        config,
        questions,
        createdAt: new Date().toISOString(),
        version: config.examCode
      };
      const newList = [newExam, ...examList];
      setExamList(newList);
      localStorage.setItem('edugen_ultimate_db', JSON.stringify(newList));
      setCurrentExamIndex(0);
      setActiveTab('library');
    } catch (err: any) {
      alert(err.message || 'Lỗi không xác định.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateQuestion = (index: number, updated: Question) => {
    if (currentExamIndex < 0) return;
    const updatedExamList = [...examList];
    const updatedExam = { ...updatedExamList[currentExamIndex] };
    const updatedQuestions = [...updatedExam.questions];
    updatedQuestions[index] = updated;
    updatedExam.questions = updatedQuestions;
    updatedExamList[currentExamIndex] = updatedExam;
    setExamList(updatedExamList);
    localStorage.setItem('edugen_ultimate_db', JSON.stringify(updatedExamList));
  };

  const deleteExam = (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;
    const newList = examList.filter(e => e.id !== id);
    setExamList(newList);
    localStorage.setItem('edugen_ultimate_db', JSON.stringify(newList));
    if (currentExam?.id === id) setCurrentExamIndex(-1);
  };

  const handlePrint = (mode: 'exam' | 'answer' | 'both') => {
    setViewMode(mode);
    setShowPrintMenu(false);
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="desktop-window">
      <div className="title-bar no-print">
        <div className="flex items-center gap-3">
           <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
             <span className="text-[10px] text-white font-black">E</span>
           </div>
           <span className="text-[10px] font-black text-slate-700 uppercase tracking-[2px]">EduGen Studio</span>
        </div>
        <div className="flex-1"></div>
        <div className="window-controls">
          <button onClick={handleMinimize} className="control-btn">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
          </button>
          <button onClick={handleMaximize} className="control-btn">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          </button>
          <button onClick={handleClose} className="control-btn close-btn">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="app-body">
        <nav className="nav-rail no-print">
          <RailItem icon="plus" active={activeTab === 'create'} onClick={() => setActiveTab('create')} label="Soạn" />
          <RailItem icon="library" active={activeTab === 'library'} onClick={() => { setActiveTab('library'); setCurrentExamIndex(-1); }} label="Kho" />
          <RailItem icon="chatbot" active={activeTab === 'chatbot'} onClick={() => setActiveTab('chatbot')} label="Trợ lý AI" />
          <RailItem icon="game" active={activeTab === 'game'} onClick={() => setActiveTab('game')} label="Arena" />
          
          <div className="mt-auto border-t w-full pt-4 flex flex-col items-center gap-4">
            <div className="relative">
              <RailItem icon="settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Cài đặt" />
              {newUpdateAvailable && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-bounce"></div>
              )}
            </div>
          </div>
        </nav>

        {activeTab === 'create' && isSidebarOpen && (
          <aside className="sidebar-panel no-print">
            <div className="p-3 h-full overflow-y-auto custom-scrollbar">
              <ConfigPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>
          </aside>
        )}

        <main className="main-workspace">
          {activeTab === 'settings' ? (
            <div className="animate-content h-full"><SettingsPanel /></div>
          ) : activeTab === 'chatbot' ? (
            <div className="animate-content h-full"><ChatbotPanel /></div>
          ) : activeTab === 'game' ? (
            <div className="animate-content h-full">
              <GameCenter 
                initialQuestions={currentExam?.questions || []} 
                initialExamTitle={currentExam?.config.title || ""} 
                examList={examList}
              />
            </div>
          ) : activeTab === 'library' && !currentExam ? (
            <div className="animate-content h-full">
              <LibraryPanel 
                exams={examList} 
                onSelect={(id) => setCurrentExamIndex(examList.findIndex(e => e.id === id))} 
                onDelete={deleteExam}
              />
            </div>
          ) : isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">AI đang biên soạn trí tuệ...</p>
            </div>
          ) : currentExam ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden animate-content">
              <div className="h-14 bg-white border-b px-4 md:px-8 flex justify-between items-center no-print shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentExamIndex(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex bg-slate-50 p-1 rounded-xl border">
                    <button onClick={() => setViewMode('exam')} className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all ${viewMode === 'exam' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>ĐỀ THI</button>
                    <button onClick={() => setViewMode('answer')} className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all ${viewMode === 'answer' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>ĐÁP ÁN</button>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setShowPrintMenu(!showPrintMenu)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[9px] tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    XUẤT PDF
                  </button>
                  {showPrintMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border py-1.5 z-50">
                      <button onClick={() => handlePrint('exam')} className="w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-indigo-50">In đề thi</button>
                      <button onClick={() => handlePrint('answer')} className="w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-indigo-50">In đáp án</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100/50">
                <div className="a4-wrapper">
                  {viewMode === 'exam' ? <ExamPaper data={currentExam} onUpdateQuestion={handleUpdateQuestion} /> : <AnswerSheet data={currentExam} />}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-4 h-full grayscale p-10 text-center">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <h2 className="text-xl font-black uppercase tracking-[10px]">EduGen Studio</h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const RailItem: React.FC<{ icon: string; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => {
  const getIcon = () => {
    switch (icon) {
      case 'plus': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;
      case 'library': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
      case 'chatbot': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
      case 'game': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
      case 'settings': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      default: return null;
    }
  };
  return (
    <div className="flex flex-col items-center">
      <div onClick={onClick} className={`rail-item ${active ? 'active' : ''}`}>{getIcon()}</div>
      <span className={`text-[7px] font-black uppercase mt-0.5 tracking-tight ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
};

export default App;
