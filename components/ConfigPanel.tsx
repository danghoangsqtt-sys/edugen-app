
import React, { useState, useMemo, useEffect } from 'react';
import { ExamConfig, Difficulty, QuestionType, BloomLevel } from '../types';
import { storage, STORAGE_KEYS } from '../services/storageAdapter';

interface ConfigPanelProps {
  onGenerate: (config: ExamConfig) => void;
  isGenerating: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ onGenerate, isGenerating }) => {
  const [config, setConfig] = useState<ExamConfig>({
    title: 'BÀI KIỂM TRA ĐỊNH KỲ',
    subject: 'Tiếng Anh',
    topic: 'Grammar and Vocabulary',
    duration: 45,
    difficulty: Difficulty.INTERMEDIATE,
    schoolName: '',
    teacherName: '',
    department: '',
    examCode: '101',
    customRequirement: 'Tập trung vào các thì hiện tại, cách thêm s/es và phát âm đuôi.',
    sections: [
      { type: QuestionType.MULTIPLE_CHOICE, count: 10, bloomLevels: [BloomLevel.REMEMBER, BloomLevel.UNDERSTAND], pointsPerQuestion: 0.5 },
      { type: QuestionType.ESSAY, count: 2, bloomLevels: [BloomLevel.APPLY], pointsPerQuestion: 2.5 }
    ]
  });

  useEffect(() => {
    // Load Settings Async
    const loadSettings = async () => {
      const s = await storage.get(STORAGE_KEYS.SETTINGS, {
         schoolName: '',
         teacherName: '',
         department: '',
         defaultDuration: 45,
         defaultDifficulty: Difficulty.INTERMEDIATE
      });

      setConfig(prev => ({
        ...prev,
        schoolName: s.schoolName || prev.schoolName,
        teacherName: s.teacherName || prev.teacherName,
        department: s.department || prev.department,
        duration: s.defaultDuration || prev.duration,
        difficulty: s.defaultDifficulty || prev.difficulty
      }));
    };
    loadSettings();
  }, []);

  const totalPoints = useMemo(() => {
    return config.sections.reduce((sum, s) => sum + (s.count * s.pointsPerQuestion), 0);
  }, [config.sections]);

  const updateSection = (index: number, key: string, value: any) => {
    const newSections = [...config.sections];
    newSections[index] = { ...newSections[index], [key]: value };
    setConfig({ ...config, sections: newSections });
  };

  const toggleBloomLevel = (sectionIdx: number, level: BloomLevel) => {
    const section = config.sections[sectionIdx];
    const newLevels = section.bloomLevels.includes(level)
      ? section.bloomLevels.filter(l => l !== level)
      : [...section.bloomLevels, level];
    updateSection(sectionIdx, 'bloomLevels', newLevels);
  };

  const addSection = () => {
    setConfig({
      ...config,
      sections: [...config.sections, { 
        type: QuestionType.MULTIPLE_CHOICE, 
        count: 5, 
        bloomLevels: [BloomLevel.REMEMBER], 
        pointsPerQuestion: 0.5 
      }]
    });
  };

  const removeSection = (idx: number) => {
    setConfig({
      ...config,
      sections: config.sections.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-xl border border-slate-100 flex flex-col space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-1.5 h-7 bg-indigo-600 rounded-full"></div>
          <div>
            <h2 className="text-base font-black text-slate-800 tracking-tight leading-none">Thiết lập đề</h2>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Smart Generator</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black border transition-colors ${totalPoints === 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
          TỔNG: {totalPoints.toFixed(1)}/10đ
        </div>
      </div>
      
      {/* Form Fields */}
      <div className="space-y-4">
        {/* --- CẬP NHẬT MỚI: Thêm ô nhập Tên Trường & Tổ Chuyên Môn --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên trường / Đơn vị</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:font-normal" 
              value={config.schoolName || ''} 
              onChange={e => setConfig({...config, schoolName: e.target.value})}
              placeholder="VD: TRƯỜNG THPT NGUYỄN TRÃI"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tổ / Bộ môn</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:font-normal" 
              value={config.department || ''} 
              onChange={e => setConfig({...config, department: e.target.value})}
              placeholder="VD: TỔ TOÁN - TIN"
            />
          </div>
        </div>
        {/* ------------------------------------------------------------- */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề chính</label>
            <input className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Môn học</label>
            <input className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px] font-bold outline-none" value={config.subject} onChange={e => setConfig({...config, subject: e.target.value})} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] font-black text-indigo-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            Yêu cầu trọng tâm từ giáo viên
          </label>
          <textarea 
            className="w-full bg-indigo-50/20 border border-indigo-100 p-2.5 rounded-xl text-[10px] focus:ring-2 focus:ring-indigo-100 outline-none min-h-[60px] leading-normal font-medium"
            placeholder="Ví dụ: Tập trung vào ngữ pháp Unit 3, các thì tương lai..."
            value={config.customRequirement}
            onChange={e => setConfig({...config, customRequirement: e.target.value})}
          />
        </div>

        {/* Matrix Section - Redesigned */}
        <div className="pt-2">
          <div className="flex justify-between items-end mb-2.5">
            <div>
              <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Ma trận nội dung</h3>
              <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">Cấu trúc các phần trong đề</p>
            </div>
            <button onClick={addSection} className="bg-slate-50 hover:bg-indigo-50 text-indigo-600 text-[8px] font-black px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              THÊM PHẦN
            </button>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {config.sections.map((section, idx) => (
              <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-[20px] p-3 relative group hover:bg-white hover:shadow-md transition-all duration-300">
                {/* Remove Button */}
                <button onClick={() => removeSection(idx)} className="absolute -top-1.5 -right-1.5 bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 w-5 h-5 flex items-center justify-center rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="space-y-3">
                  {/* Row 1: Type Selection */}
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-indigo-200 rounded-full"></div>
                    <select 
                      className="flex-1 bg-transparent text-[10px] font-black text-slate-700 outline-none appearance-none cursor-pointer"
                      value={section.type} 
                      onChange={e => updateSection(idx, 'type', e.target.value)}
                    >
                      {Object.values(QuestionType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <div className="text-[8px] text-slate-300 font-black">#{idx + 1}</div>
                  </div>

                  {/* Row 2: Inputs Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-xl p-2 border border-slate-100 flex items-center justify-between">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Số câu</span>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number" 
                          className="w-8 text-center text-[10px] font-black text-indigo-600 outline-none" 
                          value={section.count} 
                          onChange={e => updateSection(idx, 'count', parseInt(e.target.value) || 0)} 
                        />
                        <span className="text-[7px] font-black text-slate-300">QT</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-slate-100 flex items-center justify-between">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Điểm/Câu</span>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number" 
                          step="0.1" 
                          className="w-10 text-center text-[10px] font-black text-indigo-600 outline-none" 
                          value={section.pointsPerQuestion} 
                          onChange={e => updateSection(idx, 'pointsPerQuestion', parseFloat(e.target.value) || 0)} 
                        />
                        <span className="text-[7px] font-black text-slate-300">PT</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Bloom Levels Selection */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.values(BloomLevel).map(level => {
                      const isActive = section.bloomLevels.includes(level);
                      return (
                        <button
                          key={level}
                          onClick={() => toggleBloomLevel(idx, level)}
                          className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-tight transition-all border ${
                            isActive 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                              : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Action Button */}
      <button
        disabled={isGenerating}
        onClick={() => onGenerate(config)}
        className={`w-full py-3.5 rounded-2xl text-white font-black text-xs shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 mt-2 ${
          isGenerating ? 'bg-slate-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-500 uppercase tracking-widest text-[9px]">AI đang phân tích...</span>
          </div>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="uppercase tracking-[2px]">BIÊN SOẠN NGAY</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ConfigPanel;
