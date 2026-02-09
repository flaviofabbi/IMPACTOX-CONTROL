
import React from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, ChevronRight, Fingerprint, Lock } from 'lucide-react';

interface Props {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  systemName: string;
}

const LoginScreen: React.FC<Props> = ({ users, onSelectUser, systemName }) => {
  const renderSystemName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) {
      if (name.toUpperCase().includes('X')) {
        const xPos = name.toUpperCase().indexOf('X');
        return (
          <>
            {name.substring(0, xPos)}
            <span className="text-sky-500 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">{name.substring(xPos, xPos + 1)}</span>
            {name.substring(xPos + 1)}
          </>
        );
      }
      return name;
    }
    const lastPart = parts.pop();
    return (
      <>
        {parts.join(' ')} <span className="text-sky-500 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">{lastPart}</span>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#020617] z-[200] flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-sky-500/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 bg-sky-600/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md text-center mb-12 animate-in fade-in slide-in-from-top-6 duration-1000 relative z-10">
        <div className="inline-flex p-5 rounded-[2rem] bg-sky-500/5 mb-6 border border-sky-500/15 shadow-xl">
          <Fingerprint size={40} className="text-sky-500 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">
          {renderSystemName(systemName)}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <div className="h-[1px] w-6 bg-sky-500/20"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Secure Access</span>
          <div className="h-[1px] w-6 bg-sky-500/20"></div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 relative z-10">
        <p className="text-center text-[9px] font-black text-sky-500/40 uppercase tracking-widest mb-4">Selecione Perfil Autorizado</p>
        
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="group w-full relative p-4 bg-slate-900/40 backdrop-blur-md border border-sky-500/10 rounded-[2rem] flex items-center gap-4 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all duration-300 active:scale-95 text-left shadow-lg"
          >
            <div className={`absolute inset-y-5 left-0 w-1 rounded-r-full bg-gradient-to-b ${user.cor}`}></div>
            
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${user.cor} p-0.5 shrink-0 shadow-xl group-hover:scale-105 transition-transform`}>
              <img src={user.avatar} className="w-full h-full rounded-[0.9rem] bg-slate-950 object-cover" alt={user.nome} />
            </div>

            <div className="flex-1 overflow-hidden">
              <h3 className="text-base font-black text-white leading-none mb-1 group-hover:text-sky-400 transition-colors truncate">{user.nome}</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{user.cargo}</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600 group-hover:bg-sky-500 group-hover:text-white transition-all">
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-16 text-slate-600 text-[8px] font-black uppercase tracking-[0.5em] flex flex-col items-center gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-emerald-500/50" /> 
          <span>AES-256 Persistent</span>
        </div>
        <div className="h-0.5 w-8 bg-sky-500/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default LoginScreen;
