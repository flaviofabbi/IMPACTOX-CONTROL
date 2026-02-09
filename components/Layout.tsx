
import React, { useRef } from 'react';
import { LayoutDashboard, Users, PlusCircle, Settings, Briefcase, Database, LogOut, UserCircle, ShieldCheck } from 'lucide-react';
import { AppTab, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  logoUrl: string;
  onLogoChange: (newLogo: string) => void;
  currentUser: UserProfile;
  onSwitchUser: () => void;
  systemName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, logoUrl, onLogoChange, currentUser, onSwitchUser, systemName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { name: 'Dashboard' as AppTab, icon: LayoutDashboard },
    { name: 'Capitações' as AppTab, icon: Users },
    { name: 'Empreendimentos' as AppTab, icon: Briefcase },
    { name: 'Novo' as AppTab, icon: PlusCircle },
    { name: 'Config' as AppTab, icon: Settings },
  ];

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderSystemName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) {
      if (name.toUpperCase().includes('X')) {
        const xPos = name.toUpperCase().indexOf('X');
        return (
          <>
            {name.substring(0, xPos)}
            <span className="text-sky-500">{name.substring(xPos, xPos + 1)}</span>
            {name.substring(xPos + 1)}
          </>
        );
      }
      return name;
    }
    const lastPart = parts.pop();
    return (
      <>
        {parts.join(' ')} <span className="text-sky-500">{lastPart}</span>
      </>
    );
  };

  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col md:flex-row overflow-hidden text-slate-100">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      <aside className="hidden md:flex flex-col w-64 bg-slate-900/40 backdrop-blur-xl text-white z-50 border-r border-sky-500/10 shrink-0">
        <div className="p-8 flex flex-col items-center gap-4 pt-10 mb-2">
          <div onClick={handleLogoClick} className="relative cursor-pointer group">
            <div className="p-1 bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 rounded-3xl shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all group-hover:scale-105 group-hover:rotate-3">
              <img src={logoUrl} className="w-24 h-24 rounded-[1.5rem] object-cover bg-slate-950" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-[#020617] shadow-xl">
               <ShieldCheck size={14} className="text-white" />
            </div>
          </div>
          <div className="text-center mt-2 px-4">
            <h1 className="text-xl font-black uppercase tracking-tighter leading-tight break-words drop-shadow-lg">
              {renderSystemName(systemName)}
            </h1>
            <div className="h-0.5 w-10 bg-sky-500 mx-auto mt-2 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
          </div>
        </div>

        <div className="px-4 py-3 mb-2">
          <div className="p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10 flex items-center gap-3">
            <img src={currentUser.avatar} className="w-10 h-10 rounded-xl bg-slate-800 p-0.5 border border-sky-500/20 shadow-md" />
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-black text-white truncate">{currentUser.nome}</p>
              <p className="text-[8px] font-black text-sky-500/60 uppercase tracking-widest truncate">{currentUser.cargo}</p>
            </div>
            <button onClick={onSwitchUser} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => onTabChange(tab.name)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-sky-600 text-white shadow-xl translate-x-1' 
                    : 'text-slate-400 hover:bg-sky-500/10 hover:text-sky-400'
                }`}
              >
                <Icon size={18} />
                <span className="font-black text-[10px] uppercase tracking-widest">{tab.name}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-6 bg-slate-950/40 border-t border-sky-500/10">
          <div className="flex items-center gap-2 justify-center text-[8px] font-black text-sky-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Auto-Save: Persistência AES-256 OK</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-[#020617]">
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-sky-500/10">
           <div className="flex items-center gap-3">
             <img src={logoUrl} className="h-8 w-8 rounded-lg object-cover border border-sky-500/30" />
             <h1 className="text-xs font-black text-white uppercase tracking-tighter truncate max-w-[120px]">
               {renderSystemName(systemName)}
             </h1>
           </div>
           <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-[10px] font-black text-white uppercase">{currentUser.nome}</p>
               <p className="text-[8px] font-bold text-sky-500 uppercase">{currentUser.cargo}</p>
             </div>
             <img src={currentUser.avatar} className="w-9 h-9 rounded-xl bg-slate-800 p-0.5 border border-sky-500/20 shadow-lg shadow-sky-900/10" />
           </div>
        </header>
        
        <div className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full pb-24 md:pb-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-sky-500/10 flex h-20 px-6 pb-4 z-50 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.name)}
              className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40'}`}
            >
              <div className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-2 ${isActive ? 'text-sky-400' : 'text-slate-500'}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
