
import React, { useRef, useState } from 'react';
import { Bell, Shield, Smartphone, Globe, LogOut, ChevronRight, User, Download, Database, RotateCcw, UploadCloud, FileSpreadsheet, Terminal, Activity, Clock, ShieldCheck, HardDrive, RefreshCcw, CloudCheck, UserPlus, Edit, Trash2, X, Save, Palette, AlertTriangle, Type, HelpCircle, Info, Share2, Send, DownloadCloud } from 'lucide-react';
import { Capitacao, Empreendimento, AccessLog, UserProfile } from '../types';
import * as XLSX from 'xlsx';

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
  const [dbId] = useState(() => localStorage.getItem('impacto_x_db_id') || 'DB-' + Math.random().toString(36).substr(2, 6).toUpperCase());
  const [editingUser, setEditingUser] = useState<UserProfile | Partial<UserProfile> | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [tempSystemName, setTempSystemName] = useState(systemName);
  const [showHelp, setShowHelp] = useState(false);
  
  const snapshotInputRef = useRef<HTMLInputElement>(null);

  const calculateStorageSize = () => {
    const data = JSON.stringify(localStorage);
    return (data.length / 1024).toFixed(2);
  };

  const getSnapshotObject = () => ({
    dbId,
    timestamp: new Date().toISOString(),
    version: "2.5.0",
    users,
    capitacoes,
    empreendimentos,
    accessLogs,
    systemName,
    logoUrl: localStorage.getItem('impacto_x_logo')
  });

  const handleShareSnapshot = async () => {
    const data = getSnapshotObject();
    const fileName = `Update_${systemName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    const jsonString = JSON.stringify(data, null, 2);
    
    // Tenta usar a API de compartilhamento do navegador (Mobile)
    if (navigator.share) {
      try {
        const file = new File([jsonString], fileName, { type: 'application/json' });
        await navigator.share({
          title: `Atualização: ${systemName}`,
          text: `Segue a base de dados atualizada do sistema ${systemName}.`,
          files: [file]
        });
      } catch (err) {
        console.log('Share cancelado ou não suportado com arquivos.');
        handleDownloadSnapshot(); // Fallback para download simples
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
    link.download = `Snapshot_${systemName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSnapshot = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          if (window.confirm('Deseja atualizar este aplicativo com os dados recebidos? Isso substituirá suas informações atuais.')) {
            onImport(data);
          }
        } catch (err) {
          alert('Arquivo de atualização inválido ou corrompido.');
        }
      };
      reader.readAsText(file);
    }
    if (event.target) event.target.value = '';
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.nome || !editingUser?.cargo) return;
    if ('id' in editingUser) {
      onUpdateUser({ ...editingUser, avatar: getProfessionalIcon(editingUser.nome!) } as UserProfile);
    } else {
      onAddUser({ nome: editingUser.nome!, cargo: editingUser.cargo!, cor: editingUser.cor || GRADIENTS[0], avatar: getProfessionalIcon(editingUser.nome!) });
    }
    setEditingUser(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-20 px-1">
      <input type="file" ref={snapshotInputRef} className="hidden" accept=".json" onChange={handleImportSnapshot} />

      <div className="mb-8 flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Configurações</h2>
          <div className="flex items-center gap-2 mt-2">
             <div className="h-1 w-8 bg-sky-500 rounded-full"></div>
             <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em]">Gestão de Terminal</p>
          </div>
        </div>
        <button onClick={() => setShowHelp(!showHelp)} className="p-3 bg-slate-900 border border-slate-800 text-sky-400 rounded-2xl hover:bg-sky-500 hover:text-white transition-all shadow-xl">
          <HelpCircle size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Painel de Sincronização e Envio (NOVO) */}
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-[2.5rem] p-6 shadow-2xl shadow-sky-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Send size={120} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1">Transferir Atualizações</h3>
            <p className="text-sky-100 text-[10px] mb-6 font-medium leading-relaxed max-w-[200px]">
              Envie seus dados atuais para outro membro da equipe ou importe uma atualização recebida.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleShareSnapshot}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl hover:bg-white/20 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-sky-600 shadow-lg">
                  <Share2 size={20} />
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Enviar Dados</span>
              </button>
              
              <button 
                onClick={() => snapshotInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-950/20 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-slate-950/40 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <DownloadCloud size={20} />
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Receber Dados</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Técnica do Terminal */}
        <div className="x-glass border border-sky-500/10 rounded-[2rem] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
              <Terminal size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Núcleo {dbId}</p>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[7px] text-slate-500 font-bold uppercase">Armazenamento Local Ativo</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-sky-500 leading-none mb-0.5">{calculateStorageSize()} KB</p>
            <p className="text-[7px] text-slate-600 font-black uppercase tracking-tighter">Cache Ocupado</p>
          </div>
        </div>

        {/* Ajuda Contextual */}
        {showHelp && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <Info className="text-amber-500 shrink-0" size={18} />
              <div>
                <h4 className="text-[10px] font-black text-white uppercase mb-2">Como compartilhar?</h4>
                <ul className="space-y-2">
                  <li className="text-[9px] text-slate-400 leading-relaxed italic">
                    1. Clique em <strong>"Enviar Dados"</strong> acima.
                  </li>
                  <li className="text-[9px] text-slate-400 leading-relaxed italic">
                    2. Escolha o WhatsApp da pessoa que deve receber.
                  </li>
                  <li className="text-[9px] text-slate-400 leading-relaxed italic">
                    3. A outra pessoa salva o arquivo, abre o app dela, vai em Configurações e clica em <strong>"Receber Dados"</strong> selecionando o arquivo recebido.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Gestão de Operadores */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <User size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Operadores</h3>
            </div>
            <button 
              onClick={() => setEditingUser({ cor: GRADIENTS[0] })}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-900/40"
            >
              Add Novo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-sky-500/30 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${u.cor} p-0.5 shrink-0`}>
                  <img src={u.avatar} className="w-full h-full rounded-[0.7rem] bg-slate-900 object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] font-black text-white truncate">{u.nome}</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter truncate">{u.cargo}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingUser(u)} className="p-2 text-slate-400 hover:text-sky-400 bg-slate-800 rounded-lg"><Edit size={12} /></button>
                  <button onClick={() => setUserToDelete(u)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outras Configurações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 text-center">Identidade Visual</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tempSystemName}
                  onChange={(e) => setTempSystemName(e.target.value)}
                  className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-white text-[10px] font-bold outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button onClick={() => onSystemNameChange(tempSystemName)} className="px-4 bg-sky-600 text-white rounded-xl text-[8px] font-black uppercase">Ok</button>
              </div>
           </div>

           <button 
            onClick={() => {
              const dataToExport = capitacoes.map(item => ({ 'Nome': item.nome, 'CNPJ': item.cnpj, 'Pago': item.valor_pago, 'Proposta': item.valor_proposta }));
              const worksheet = XLSX.utils.json_to_sheet(dataToExport);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");
              XLSX.writeFile(workbook, `Relatorio_Excel.xlsx`);
            }}
            className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-colors group"
          >
            <FileSpreadsheet size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Extrair Planilha</span>
          </button>
        </div>

        <button onClick={onLogout} className="w-full py-5 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-[2rem] border border-red-500/10 hover:bg-red-500/10 transition-all active:scale-[0.98] shadow-lg shadow-red-950/10">
          Desconectar Operador
        </button>
      </div>

      {/* Modal de Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[250] flex items-center justify-center p-6">
          <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] border border-slate-800 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-white uppercase mb-8 flex items-center gap-3">
              <Palette size={20} className="text-sky-400" /> Perfil de Acesso
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-5">
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nome do Operador</label>
                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-white text-xs outline-none focus:ring-1 focus:ring-sky-500" value={editingUser.nome || ''} onChange={(e) => setEditingUser({...editingUser, nome: e.target.value})} required />
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Cargo Técnico</label>
                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-white text-xs outline-none focus:ring-1 focus:ring-sky-500" value={editingUser.cargo || ''} onChange={(e) => setEditingUser({...editingUser, cargo: e.target.value})} required />
              </div>
              <div className="flex flex-wrap justify-center gap-3 py-2">
                {GRADIENTS.map((g) => (
                  <button key={g} type="button" onClick={() => setEditingUser({...editingUser, cor: g})} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-4 transition-all ${editingUser.cor === g ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-30 hover:opacity-100'}`} />
                ))}
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl text-[10px] uppercase tracking-widest">Sair</button>
                <button type="submit" className="flex-[2] py-4 bg-sky-600 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-sky-900/40">Gravar Perfil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[300] flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900 w-full max-w-xs rounded-[2.5rem] border border-red-500/20 p-8 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-base font-black text-white mb-2 uppercase">Revogar?</h3>
            <p className="text-slate-400 text-[10px] mb-8 leading-relaxed uppercase tracking-tighter">O acesso para <strong>{userToDelete.nome}</strong> será excluído deste terminal permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl text-[10px] uppercase tracking-widest">Manter</button>
              <button onClick={() => { onDeleteUser(userToDelete.id); setUserToDelete(null); }} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-red-900/40">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesScreen;
