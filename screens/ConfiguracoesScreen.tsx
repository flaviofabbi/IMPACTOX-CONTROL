import React, { useRef, useState } from 'react';
import { Bell, Shield, Smartphone, Globe, LogOut, ChevronRight, User, Download, Database, RotateCcw, UploadCloud, FileSpreadsheet, Terminal, Activity, Clock, ShieldCheck, HardDrive, RefreshCcw, UserPlus, Edit, Trash2, X, Save, Palette, AlertTriangle, Type, HelpCircle, Info, Share2, Send, DownloadCloud, Copy, Check, Mail } from 'lucide-react';
import { Capitacao, Empreendimento, AccessLog, UserProfile } from '../types';

interface Props {
  users: UserProfile[];
  onAddUser: (user: Omit<UserProfile, 'id'>) => void;
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (id: string) => void;
  onLogout: () => void;
  onImport: (data: any) => void;
  capitacoes: Capitacao[];
  empreendimentos: Empreendimento[];
  accessLogs: AccessLog[];
  isSyncing: boolean;
  lastSync: string;
  onSync: () => void;
  systemName: string;
  onSystemNameChange: (name: string) => void;
}

const GRADIENTS = [
  'from-sky-500 to-blue-700',
  'from-purple-500 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-700',
  'from-rose-500 to-pink-700',
  'from-slate-500 to-slate-700',
  'from-cyan-500 to-blue-500'
];

const getProfessionalIcon = (name: string) => 
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f172a&fontWeight=700&fontSize=45&fontFamily=Inter`;

const ConfiguracoesScreen: React.FC<Props> = ({ 
  users, onAddUser, onUpdateUser, onDeleteUser,
  onLogout, onImport, capitacoes, empreendimentos, accessLogs, isSyncing, lastSync, onSync,
  systemName, onSystemNameChange
}) => {
  const [dbId] = useState(() => localStorage.getItem('ix_db_id') || 'DB-' + Math.random().toString(36).substr(2, 6).toUpperCase());
  const [editingUser, setEditingUser] = useState<UserProfile | Partial<UserProfile> | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  
  const snapshotInputRef = useRef<HTMLInputElement>(null);

  const calculateStorageSize = () => {
    const data = JSON.stringify(localStorage);
    return (data.length / 1024).toFixed(2);
  };

  const getSnapshotObject = () => ({
    dbId,
    timestamp: new Date().toISOString(),
    version: "2.6.0",
    users,
    capitacoes,
    empreendimentos,
    systemName
  });

  const handleCopySnapshot = () => {
    const data = getSnapshotObject();
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareSnapshot = async () => {
    const data = getSnapshotObject();
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `ImpactoX_Backup_${new Date().toISOString().split('T')[0]}.json`;
    
    if (navigator.share) {
      try {
        const file = new File([jsonString], fileName, { type: 'application/json' });
        await navigator.share({
          title: `Backup: ${systemName}`,
          files: [file]
        });
      } catch (err) {
        handleDownloadSnapshot();
      }
    } else {
      handleDownloadSnapshot();
    }
  };

  const handleDownloadSnapshot = () => {
    const data = getSnapshotObject();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Snapshot_${systemName.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.nome || !editingUser?.cargo || !editingUser?.email) return;
    
    if ('id' in editingUser) {
      onUpdateUser({ 
        ...editingUser, 
        avatar: getProfessionalIcon(editingUser.nome) 
      } as UserProfile);
    } else {
      onAddUser({ 
        nome: editingUser.nome!, 
        email: editingUser.email!,
        cargo: editingUser.cargo!, 
        cor: editingUser.cor || GRADIENTS[0], 
        avatar: getProfessionalIcon(editingUser.nome!) 
      });
    }
    setEditingUser(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-20 px-1">
      <input type="file" ref={snapshotInputRef} className="hidden" accept=".json" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => onImport(JSON.parse(ev.target?.result as string));
          reader.readAsText(file);
        }
      }} />

      <div className="mb-8">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Configurações</h2>
        <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Terminal de Operações Local</p>
      </div>

      <div className="space-y-4">
        {/* Painel de Transferência */}
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1">Backup & Transferência</h3>
            <p className="text-sky-100 text-[10px] mb-6 font-medium leading-relaxed max-w-[240px]">
              O sistema utiliza armazenamento local. Exporte os dados para garantir que não os perca.
            </p>
            
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleShareSnapshot} className="flex flex-col items-center gap-2 p-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
                <Share2 size={16} className="text-white" />
                <span className="text-[7px] font-black text-white uppercase">Enviar</span>
              </button>
              <button onClick={handleCopySnapshot} className="flex flex-col items-center gap-2 p-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-white" />}
                <span className="text-[7px] font-black text-white uppercase">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button onClick={() => snapshotInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 bg-slate-950/20 border border-white/10 rounded-2xl hover:bg-slate-950/40 transition-all">
                <DownloadCloud size={16} className="text-emerald-400" />
                <span className="text-[7px] font-black text-white uppercase">Receber</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info do Terminal */}
        <div className="x-glass border border-sky-500/10 rounded-[2rem] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl">
              <Terminal size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">ID: {dbId}</p>
              <div className="text-[7px] text-sky-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="w-1 h-1 bg-sky-400 rounded-full animate-pulse"></div>
                Impacto X Cloud Ativo
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-sky-500">Sincronizado</p>
            <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest">Tempo Real</p>
          </div>
        </div>

        {/* Gestão de Operadores */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Operadores Ativos</h3>
            <button 
              onClick={() => setEditingUser({ cor: GRADIENTS[0] })} 
              className="px-4 py-2 bg-sky-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all"
            >
              <UserPlus size={14} />
              Add Novo
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-sky-500/30 transition-all">
                <img src={u.avatar} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 p-0.5" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] font-black text-white truncate">{u.nome}</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase truncate">{u.cargo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingUser(u)} 
                    className="p-2.5 text-sky-400 hover:bg-sky-500/10 bg-slate-800/50 rounded-xl transition-all active:scale-90"
                    title="Editar Operador"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => { if(window.confirm('Excluir este operador?')) onDeleteUser(u.id); }} 
                    className="p-2.5 text-rose-400 hover:bg-rose-500/10 bg-slate-800/50 rounded-xl transition-all active:scale-90"
                    title="Excluir Operador"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onLogout} className="w-full py-5 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-[2rem] border border-red-500/10 hover:bg-red-500/10 transition-all active:scale-[0.98]">
          Desconectar Operador
        </button>
      </div>

      {/* Modal de Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[250] flex items-center justify-center p-6">
          <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase mb-8">Perfil de Operador</h3>
            <form onSubmit={handleSaveUser} className="space-y-5">
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1.5 ml-1">Nome</label>
                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-white text-xs outline-none" value={editingUser.nome || ''} onChange={(e) => setEditingUser({...editingUser, nome: e.target.value})} required />
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1.5 ml-1">E-mail</label>
                <input type="email" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-white text-xs outline-none" value={editingUser.email || ''} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} required />
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1.5 ml-1">Cargo</label>
                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-white text-xs outline-none" value={editingUser.cargo || ''} onChange={(e) => setEditingUser({...editingUser, cargo: e.target.value})} required />
              </div>
              <div className="flex flex-wrap justify-center gap-3 py-2">
                {GRADIENTS.map((g) => (
                  <button key={g} type="button" onClick={() => setEditingUser({...editingUser, cor: g})} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-4 transition-all ${editingUser.cor === g ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-30'}`} />
                ))}
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl text-[10px] uppercase">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-sky-600 text-white font-bold rounded-2xl text-[10px] uppercase">Gravar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesScreen;