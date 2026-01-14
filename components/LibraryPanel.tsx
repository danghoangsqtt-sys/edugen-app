
import React, { useState, useMemo } from 'react';
import { ExamPaper } from '../types';

interface LibraryPanelProps {
  exams: ExamPaper[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ exams, onSelect, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('Tất cả');

  const subjects = useMemo(() => {
    const s = new Set(exams.map(e => e.config.subject));
    return ['Tất cả', ...Array.from(s)];
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      const matchSearch = e.config.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.config.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSubject = filterSubject === 'Tất cả' || e.config.subject === filterSubject;
      return matchSearch && matchSubject;
    });
  }, [exams, searchTerm, filterSubject]);

  return (
    <div className="h-full flex flex-col p-4 md:p-8 space-y-6 overflow-y-auto bg-slate-50/30">
      {/* Header & Search Section - Refined sizes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
            Kho <span className="text-indigo-600">Lưu Trữ</span>
          </h1>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[3px]">
            Hệ thống quản lý học liệu thông minh
          </p>
        </div>

        <div className="flex flex-1 max-w-xl gap-2">
          <div className="flex-1 relative group">
            <svg className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tiêu đề hoặc môn học..." 
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-[11px] font-semibold focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-200 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase outline-none focus:ring-4 focus:ring-indigo-50/50 shadow-sm cursor-pointer appearance-none pr-8 relative"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid Display - Improved Cards */}
      {filteredExams.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
           <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
           </div>
           <p className="text-[10px] font-black uppercase text-slate-300 tracking-[5px]">Kho dữ liệu trống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 pb-10">
          {filteredExams.map(exam => (
            <div 
              key={exam.id} 
              onClick={() => onSelect(exam.id)}
              className="group bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all cursor-pointer relative flex flex-col h-full active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Header Card Action */}
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(exam.id); }}
                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Xóa đề thi"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 flex flex-col space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-2 min-h-[2rem] group-hover:text-indigo-600 transition-colors">
                    {exam.config.title}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[7px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">{exam.config.subject}</span>
                    <span className="text-[7px] font-black px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md uppercase tracking-wider">MÃ: {exam.config.examCode}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 mt-auto flex items-center justify-between text-[8.5px] font-black text-slate-400 uppercase tracking-tighter">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                    {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {exam.config.duration}'
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPanel;
