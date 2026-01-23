
import React, { useState, useEffect, useRef } from 'react';
import { VocabularyItem } from '../types';
import { extractVocabularyFromFile } from '../services/geminiService';
import VocabArena from './VocabArena';

const VocabBankPanel: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [topic, setTopic] = useState('Unit 1: Leisure Time');
  const [isExtracting, setIsExtracting] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('edugen_vocab_bank');
    if (saved) setVocabList(JSON.parse(saved));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        alert("Vui lòng chỉ chọn tệp PDF hoặc Hình ảnh.");
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    setIsExtracting(true);
    try {
      const base64Data = await fileToBase64(selectedFile);
      const newItems = await extractVocabularyFromFile(base64Data, selectedFile.type, topic);
      
      const updatedList = [...newItems, ...vocabList];
      setVocabList(updatedList);
      localStorage.setItem('edugen_vocab_bank', JSON.stringify(updatedList));
      
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert(`AI đã bóc tách thành công ${newItems.length} từ vựng từ tệp tin!`);
    } catch (e) {
      console.error(e);
      alert("Lỗi trích xuất AI. Vui lòng kiểm tra lại tệp tin hoặc API Key.");
    } finally {
      setIsExtracting(false);
    }
  };

  const deleteItem = (id: string) => {
    if (!window.confirm("Xóa từ vựng này?")) return;
    const newList = vocabList.filter(v => v.id !== id);
    setVocabList(newList);
    localStorage.setItem('edugen_vocab_bank', JSON.stringify(newList));
  };

  const groupedVocab = vocabList.reduce((acc, item) => {
    const t = item.topic || "Chung";
    if (!acc[t]) acc[t] = [];
    acc[t].push(item);
    return acc;
  }, {} as Record<string, VocabularyItem[]>);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden bg-slate-50/30 relative">
      {showArena && <VocabArena vocabList={vocabList} onClose={() => setShowArena(false)} />}
      
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Vocab <span className="text-indigo-600">Vault</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Hệ thống bóc tách học liệu AI</p>
        </div>
        
        <button 
          disabled={vocabList.length < 5}
          onClick={() => setShowArena(true)}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-[22px] font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:grayscale"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Luyện tập ngay
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Input Area */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100 space-y-6">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              Tải tài liệu từ vựng
            </h3>
            
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên chủ đề / Unit</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="VD: Unit 1: Leisure Time"
              />
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[24px] p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFile ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,image/*" className="hidden" />
              
              {selectedFile ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    {selectedFile.type === 'application/pdf' ? (
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6l-4-4H9z" /></svg>
                    ) : (
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]">{selectedFile.name}</p>
                  <p className="text-[8px] text-slate-400 uppercase mt-1">Sẵn sàng trích xuất</p>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nhấn để chọn<br/>PDF hoặc Ảnh</p>
                </>
              )}
            </div>

            <button 
              onClick={handleExtract}
              disabled={isExtracting || !selectedFile}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-100"
            >
              {isExtracting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  AI ĐANG "ĐỌC" FILE...
                </div>
              ) : "TRÍCH XUẤT TỪ VỰNG"}
            </button>
          </div>
        </div>

        {/* List Area */}
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dữ liệu từ vựng đã nạp ({vocabList.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
            {(Object.entries(groupedVocab) as [string, VocabularyItem[]][]).map(([topicName, items]) => (
              <div key={topicName} className="space-y-4">
                <div className="flex items-center gap-4">
                   <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full">{topicName}</h4>
                   <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map(item => (
                    <div key={item.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all relative">
                      <button onClick={() => deleteItem(item.id)} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-black text-slate-800">{item.word}</span>
                        <span className="text-[10px] font-medium text-indigo-400 italic">{item.pronunciation}</span>
                        <span className="text-[8px] font-black text-slate-300 uppercase">({item.partOfSpeech})</span>
                      </div>
                      <p className="text-[12px] font-bold text-slate-600">{item.meaning}</p>
                      {item.example && <p className="text-[10px] text-slate-400 italic mt-1 leading-snug">"{item.example}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabBankPanel;
