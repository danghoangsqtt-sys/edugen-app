import React, { useState, useEffect } from 'react';
import { Difficulty, AppUpdate } from '../types';
import { CURRENT_VERSION, checkAppUpdate } from '../services/updateService';

interface SystemSettings {
  teacherName: string;
  schoolName: string;
  department: string;
  defaultDuration: number;
  defaultDifficulty: Difficulty;
  apiKey: string;
}

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    teacherName: '',
    schoolName: 'Trường THCS & THPT Tri Thức',
    department: 'Tổ Ngoại Ngữ',
    defaultDuration: 45,
    defaultDifficulty: Difficulty.INTERMEDIATE,
    apiKey: '',
  });

  const [message, setMessage] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<AppUpdate | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('edugen_settings');
    const savedApiKey = localStorage.getItem('edugen_api_key');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          apiKey: savedApiKey || '',
        }));
      } catch (e) {}
    } else if (savedApiKey) {
      setSettings(prev => ({ ...prev, apiKey: savedApiKey }));
    }
  }, []);

  const saveSettings = () => {
    const { apiKey, ...otherSettings } = settings;
    localStorage.setItem('edugen_settings', JSON.stringify(otherSettings));
    localStorage.setItem('edugen_api_key', apiKey);
    
    setMessage('Hệ thống đã cập nhật thiết lập mới!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    const result = await checkAppUpdate();
    setUpdateInfo(result);
    setIsCheckingUpdate(false);
    if (!result.hasUpdate) {
      setMessage("Ứng dụng đã là bản mới nhất!");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="h-full bg-slate-50/50 flex flex-col items-center py-10 px-6 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-3xl space-y-8 pb-24">
        
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cài đặt <span className="text-indigo-600">Hệ thống</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1.5">Tham số vận hành & Bảo mật</p>
            </div>
          </div>
          <button onClick={saveSettings} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Lưu cấu hình</button>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 px-6 py-4 rounded-2xl text-emerald-600 text-[10px] font-black uppercase text-center tracking-[4px] animate-in slide-in-from-right-4">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* AI Configuration Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-[11px] font-black text-indigo-600 uppercase tracking-[4px] flex items-center gap-3">
              <span className="w-2 h-5 bg-indigo-600 rounded-full"></span> Trí tuệ nhân tạo (AI Engine)
            </h2>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Google Gemini API Key</label>
              <div className="relative">
                <input 
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[14px] font-mono outline-none focus:ring-4 focus:ring-indigo-100 transition-all border-dashed"
                  placeholder="Dán API Key của bạn tại đây..."
                  value={settings.apiKey}
                  onChange={e => setSettings({...settings, apiKey: e.target.value})}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </div>
              </div>

              {/* --- PHẦN BỔ SUNG: HƯỚNG DẪN LẤY API KEY --- */}
              <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <h3 className="text-[11px] font-black text-indigo-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Hướng dẫn lấy Key (Miễn phí)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-[12px] text-slate-600 font-medium ml-1">
                    <li>
                    Truy cập <strong>Google AI Studio</strong>:{" "}
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                        https://aistudio.google.com/app/apikey
                    </a>
                    </li>
                    <li>Đăng nhập bằng tài khoản Google (Gmail).</li>
                    <li>Nhấn vào nút <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold border border-slate-300">Create API key</span>.</li>
                    <li>Copy chuỗi ký tự (bắt đầu bằng <code>AIza...</code>) và dán vào ô bên trên.</li>
                    <li>Nhấn <strong>LƯU CẤU HÌNH</strong> để hoàn tất.</li>
                </ol>
              </div>
               {/* --- KẾT THÚC PHẦN BỔ SUNG --- */}

            </div>
          </div>

          {/* Update Checker Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[4px] flex items-center gap-3">
                <span className="w-2 h-5 bg-emerald-500 rounded-full"></span> Phiên bản & Cập nhật
              </h2>
              <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full">v{CURRENT_VERSION}</span>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {updateInfo?.hasUpdate ? "Có phiên bản mới!" : "Bạn đang sử dụng bản mới nhất"}
                </p>
                <p className="text-[10px] font-medium text-slate-400">
                  {updateInfo?.hasUpdate ? `Phiên bản mới v${updateInfo.version} đã sẵn sàng.` : "Hệ thống tự động kiểm tra định kỳ."}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {updateInfo?.hasUpdate ? (
                   <a 
                    href={updateInfo.downloadUrl} 
                    target="_blank"
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
                   >
                     Cập nhật ngay
                   </a>
                ) : (
                  <button 
                    onClick={handleCheckUpdate}
                    disabled={isCheckingUpdate}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    {isCheckingUpdate && <div className="w-3 h-3 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>}
                    Kiểm tra cập nhật
                  </button>
                )}
              </div>
            </div>

            {updateInfo?.hasUpdate && updateInfo.changelog.length > 0 && (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 animate-in fade-in slide-in-from-top-2">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3">Tính năng mới ở v{updateInfo.version}:</p>
                <ul className="space-y-1.5">
                  {updateInfo.changelog.map((item, i) => (
                    <li key={i} className="text-[11px] font-medium text-indigo-700 flex items-center gap-2">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full"></span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* New Optimized Information Section */}
          <div className="bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-10 rounded-[40px] border border-indigo-100/50 shadow-xl shadow-slate-100 relative overflow-hidden">
            <div className="absolute right-[-30px] bottom-[-30px] text-indigo-600/5 rotate-[-15deg]">
              <svg className="w-72 h-72" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
              </svg>
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[3px] rounded-full shadow-lg shadow-indigo-100">
                      System Info
                    </span>
                    <div className="h-px flex-1 md:w-24 bg-indigo-100 hidden md:block"></div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
                    DHsystem <span className="text-indigo-600 font-light italic">Ecosystem</span>
                  </h2>
                </div>
                
                <div className="hidden md:block">
                  <div className="bg-white/80 backdrop-blur-md border border-indigo-100 px-6 py-3 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-1">Copyright</p>
                    <p className="text-xs font-bold text-slate-800 italic">© DHsystem 2026</p>
                  </div>
                </div>
              </div>

              <div className="max-w-xl">
                <p className="text-[15px] font-medium leading-relaxed text-slate-600">
                  Giải pháp biên soạn đề thi thông minh được sáng tạo và phát triển bởi 
                  <span className="text-indigo-600 font-extrabold mx-1.5 border-b-2 border-indigo-100 hover:border-indigo-600 transition-all cursor-default">
                    Đăng Hoàng
                  </span>. 
                  Một sản phẩm trong hệ sinh thái giáo dục số toàn diện <span className="text-slate-800 font-bold uppercase tracking-wider text-[13px]">DHsystem 2026</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-indigo-50">
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Core Engine</p>
                    <p className="text-sm font-extrabold text-slate-800">DH-Engine v4.0 <span className="text-emerald-500 ml-1">●</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Distribution</p>
                    <p className="text-sm font-extrabold text-slate-800 italic">2026.02.EduGen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;