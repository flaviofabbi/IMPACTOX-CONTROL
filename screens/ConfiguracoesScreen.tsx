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
  logoUrl: string;
  onLogoChange: (url: string) => void;
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
  systemName, onSystemNameChange, logoUrl, onLogoChange
}) => {
  const [dbId] = useState(() => localStorage.getItem('ix_db_id') || 'DB-' + Math.random().toString(36).substr(2, 6).toUpperCase());
  const [editingUser, setEditingUser] = useState<UserProfile | Partial<UserProfile> | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  
  const snapshotInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Configurações</h2>
          <p className="text-sky-500/60 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Terminal de Operações Cloud (Shared)</p>
        </div>
        <img src={logoUrl} className="w-12 h-12 rounded-xl object-cover border border-sky-500/20 shadow-lg" alt="Logo" />
      </div>

      <div className="space-y-4">
        {/* Status do Banco de Dados Cloud (Firebase) */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Ativo</span>
            </div>
          </div>

          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Database size={14} className="text-sky-500" /> Firebase Cloud Database
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Capitações Sincronizadas</p>
              <p className="text-xl font-black text-white">{capitacoes.length}</p>
            </div>
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Empreendimentos Ativos</p>
              <p className="text-xl font-black text-white">{empreendimentos.length}</p>
            </div>
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Usuários Registrados</p>
              <p className="text-xl font-black text-white">{users.length}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
                <RefreshCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
              </div>
              <div>
                <p className="text-[9px] font-black text-white uppercase tracking-widest">Última Sincronização</p>
                <p className="text-[8px] text-slate-500 font-bold">{lastSync || 'Agora mesmo'}</p>
              </div>
            </div>
            <button 
              onClick={onSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-[8px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              Forçar Sync
            </button>
          </div>
        </div>

        {/* Gestão de Logotipo e Identidade */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Palette size={14} className="text-sky-500" /> Identidade Visual
          </h3>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
                <img src={logoUrl} className="w-full h-full object-cover" alt="Logo Atual" />
              </div>
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 bg-sky-600 text-white rounded-xl shadow-lg hover:bg-sky-500 transition-all active:scale-90"
              >
                <Edit size={14} />
              </button>
              <input 
                type="file" 
                ref={logoInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => onLogoChange(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </div>
            
            <div className="flex-1 space-y-3 w-full">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Sistema</label>
                <input 
                  type="text" 
                  value={systemName} 
                  onChange={(e) => onSystemNameChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-sky-500/50 transition-all"
                  placeholder="Ex: Impacto X"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => logoInputRef.current?.click()}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[8px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Alterar Logotipo
                </button>
                <button 
                  onClick={() => onLogoChange("https://picsum.photos/seed/impacto-x/400/400")}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-500 hover:text-rose-400 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notificações Automáticas (WhatsApp) */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Send size={14} className="text-emerald-500" /> Alertas de Vencimento (5 Dias)
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status do Robô</p>
                <span className="text-[8px] font-black text-emerald-500 uppercase px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Configurado</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                O sistema verifica diariamente contratos que vencem em exatamente 5 dias e envia alertas automáticos para os números configurados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/30 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <Smartphone size={14} />
                </div>
                <div>
                  <p className="text-[7px] font-black text-slate-500 uppercase">WhatsApp 1</p>
                  <p className="text-[9px] font-bold text-white">+55 11 98959-0038</p>
                </div>
              </div>
              <div className="p-3 bg-slate-950/30 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <Smartphone size={14} />
                </div>
                <div>
                  <p className="text-[7px] font-black text-slate-500 uppercase">WhatsApp 2</p>
                  <p className="text-[9px] font-bold text-white">+55 11 99448-9140</p>
                </div>
              </div>
            </div>

            <button 
              onClick={async () => {
                // Esta função será implementada no App.tsx e passada via props ou injetada
                // Por enquanto, simulamos o disparo
                if (window.confirm('Deseja executar a verificação de vencimentos agora?')) {
                  const event = new CustomEvent('trigger-vencimento-check');
                  window.dispatchEvent(event);
                  alert('Verificação iniciada! O sistema processará os contratos em segundo plano.');
                }
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              Executar Verificação Agora
            </button>
          </div>
        </div>

        {/* Painel de Transferência */}
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1">Backup & Transferência</h3>
            <p className="text-sky-100 text-[10px] mb-6 font-medium leading-relaxed max-w-[240px]">
              O sistema agora utiliza sincronização Cloud em tempo real. Exporte backups para segurança extra.
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