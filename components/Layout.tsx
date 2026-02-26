
import React, { useRef, useState } from 'react';
import { LayoutDashboard, Users, PlusCircle, Settings, Briefcase, Database, LogOut, UserCircle, ShieldCheck, Edit, Menu, X } from 'lucide-react';
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
  onlineUsersCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, logoUrl, onLogoChange, currentUser, onSwitchUser, systemName, onlineUsersCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <span className="bg-gradient-to-br from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
              {name.substring(xPos, xPos + 1)}
            </span>
            {name.substring(xPos + 1)}
          </>
        );
      }
      return name;
    }
    const lastPart = parts.pop();
    return (
      <>
        {parts.join(' ')} <span className="bg-gradient-to-br from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">{lastPart}</span>
      </>
    );
  };

  return (
    <div className="h-screen w-screen bg-[#000000] flex flex-col md:flex-row overflow-hidden text-slate-100 relative">
      {/* Watermark Logo */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0 overflow-hidden">
        <img 
          src={logoUrl} 
          alt="Watermark" 
          className="w-[80vw] h-[80vw] object-contain grayscale rotate-[-15deg] scale-125"
          referrerPolicy="no-referrer"
        />
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#020617]/95 z-[100] md:hidden animate-in fade-in duration-300 backdrop-blur-md">
          <div className="flex flex-col h-full p-8">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <img src={logoUrl} className="h-10 w-10 rounded-xl object-cover border border-sky-500/30" />
                <h1 className="text-lg font-black text-white uppercase tracking-tighter">
                  {renderSystemName(systemName)}
                </h1>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-white transition-all">
                <X size={32} />
              </button>
            </div>

            <nav className="flex-1 space-y-4">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    onTabChange(tab.name);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                    activeTab === tab.name 
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40' 
                      : 'text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon size={24} />
                  {tab.name}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-slate-800">
              <div className="flex items-center gap-4 mb-8">
                <img src={currentUser.avatar} className="w-14 h-14 rounded-2xl bg-slate-800 p-1 border border-sky-500/20" />
                <div>
                  <p className="text-sm font-black text-white uppercase">{currentUser.nome}</p>
                  <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{currentUser.cargo}</p>
                </div>
              </div>
              <button 
                onClick={onSwitchUser}
                className="w-full py-4 bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
              >
                <LogOut size={18} /> Sair do Terminal
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => onTabChange('Config')} 
                className="p-1.5 text-slate-500 hover:text-sky-400 transition-colors"
                title="Editar Perfil"
              >
                <Edit size={14} />
              </button>
              <button 
                onClick={onSwitchUser} 
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-center text-[8px] font-black text-sky-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Firebase Cloud: Ativo</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-[7px] font-black text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400">
                <Users size={10} />
                <span>{onlineUsersCount} Acessos Simultâneos</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-[#000000]">
        {/* Central Elegant Watermark */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img 
            src={logoUrl} 
            className="w-[85%] md:w-[65%] opacity-[0.12] brightness-125 blur-[0.3px] transform -rotate-12 select-none mix-blend-screen" 
            alt="Central Watermark" 
          />
        </div>

        {/* Corner Watermarks */}
        <div className="absolute top-6 right-6 pointer-events-none opacity-10 hidden md:block select-none z-10">
          <img src={logoUrl} className="w-24 h-24 object-contain grayscale brightness-200" alt="Watermark" />
        </div>
        <div className="absolute bottom-6 right-6 pointer-events-none opacity-5 hidden lg:block select-none">
          <img src={logoUrl} className="w-40 h-40 object-contain grayscale brightness-200" alt="Watermark" />
        </div>
        
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-sky-500/10 z-40">
           <div className="flex items-center gap-3">
             <img src={logoUrl} className="h-8 w-8 rounded-lg object-cover border border-sky-500/30" />
             <h1 className="text-xs font-black text-white uppercase tracking-tighter truncate max-w-[120px]">
               {renderSystemName(systemName)}
             </h1>
           </div>
           
           <button 
             onClick={() => setIsMenuOpen(true)}
             className="p-2.5 bg-sky-600/10 text-sky-500 rounded-xl border border-sky-500/20 hover:bg-sky-600 hover:text-white transition-all active:scale-95"
           >
             <Menu size={20} />
           </button>
        </header>
        
        <div className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full pb-24 md:pb-6 overflow-y-auto custom-scrollbar relative z-10">
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
