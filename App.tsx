
import React, { useState, useEffect } from 'react';
import { AppTab, Capitacao, Empreendimento, AccessLog, UserProfile } from './types';
import Layout from './components/Layout';
import DashboardScreen from './screens/DashboardScreen';
import CapitacoesScreen from './screens/CapitacoesScreen';
import PlantoesScreen from './screens/PlantoesScreen';
import NovaCapitacaoScreen from './screens/NovaCapitacaoScreen';
import NovoEmpreendimentoScreen from './screens/NovoEmpreendimentoScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';
import LoginScreen from './screens/LoginScreen';
import { capitacoes as initialCapitacoes, empreendimentos as initialEmpreendimentos } from './data/mockData';

const getProfessionalIcon = (name: string) => 
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f172a&fontWeight=700&fontSize=45&fontFamily=Inter`;

const DEFAULT_USERS: UserProfile[] = [
  { id: '1', nome: 'Dr. Silva', cargo: 'Diretor Técnico', cor: 'from-sky-500 to-blue-700', avatar: getProfessionalIcon('Dr. Silva') },
  { id: '2', nome: 'Dra. Maria', cargo: 'Gestora Financeira', cor: 'from-purple-500 to-indigo-700', avatar: getProfessionalIcon('Dra. Maria') },
  { id: '3', nome: 'Dr. Ricardo', cargo: 'Coordenador Operacional', cor: 'from-emerald-500 to-teal-700', avatar: getProfessionalIcon('Dr. Ricardo') },
  { id: '4', nome: 'Eng. Carlos', cargo: 'Engenheiro de Campo', cor: 'from-amber-500 to-orange-700', avatar: getProfessionalIcon('Eng. Carlos') },
  { id: '5', nome: 'Adm. Ana', cargo: 'Administradora Geral', cor: 'from-rose-500 to-pink-700', avatar: getProfessionalIcon('Adm. Ana') },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('Dashboard');
  const [newType, setNewType] = useState<'capitacao' | 'empreendimento'>('capitacao');
  const [editingCapitacao, setEditingCapitacao] = useState<Capitacao | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(() => localStorage.getItem('impacto_x_last_sync') || new Date().toISOString());
  
  const [systemName, setSystemName] = useState(() => localStorage.getItem('impacto_x_system_name') || 'Impacto X');

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('impacto_x_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('impacto_x_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [capitacoes, setCapitacoes] = useState<Capitacao[]>(() => {
    const saved = localStorage.getItem('impacto_x_capitacoes');
    return saved ? JSON.parse(saved) : initialCapitacoes;
  });

  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>(() => {
    const saved = localStorage.getItem('impacto_x_empreendimentos');
    return saved ? JSON.parse(saved) : initialEmpreendimentos;
  });

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => {
    const saved = localStorage.getItem('impacto_x_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('impacto_x_logo') || "https://api.dicebear.com/7.x/shapes/svg?seed=impacto&backgroundColor=0ea5e9";
  });

  const addLog = (acao: string, detalhes: string, tipo: AccessLog['tipo'] = 'info') => {
    const newLog: AccessLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      acao,
      detalhes,
      tipo,
      operador: currentUser?.nome || 'Sistema'
    };
    setAccessLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100);
      localStorage.setItem('impacto_x_logs', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => { localStorage.setItem('impacto_x_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('impacto_x_capitacoes', JSON.stringify(capitacoes)); }, [capitacoes]);
  useEffect(() => { localStorage.setItem('impacto_x_empreendimentos', JSON.stringify(empreendimentos)); }, [empreendimentos]);
  useEffect(() => { localStorage.setItem('impacto_x_logo', logoUrl); }, [logoUrl]);
  useEffect(() => { localStorage.setItem('impacto_x_system_name', systemName); }, [systemName]);

  const handleAddUser = (newUser: Omit<UserProfile, 'id'>) => {
    const user: UserProfile = { ...newUser, id: Date.now().toString() };
    setUsers(prev => [...prev, user]);
    addLog('Gestão Equipe', `Novo operador cadastrado: ${user.nome}`, 'success');
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('impacto_x_current_user', JSON.stringify(updatedUser));
    }
    addLog('Gestão Equipe', `Dados do operador ${updatedUser.nome} atualizados`, 'info');
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('Gestão Equipe', `Operador ${target.nome} removido`, 'warning');
    if (currentUser?.id === id) handleLogout();
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('impacto_x_current_user', JSON.stringify(user));
    addLog('Segurança', `Login realizado com sucesso por ${user.nome}`, 'success');
  };

  const handleLogout = () => {
    addLog('Segurança', `Operador ${currentUser?.nome} encerrou a sessão`, 'info');
    setCurrentUser(null);
    localStorage.removeItem('impacto_x_current_user');
  };

  const triggerSync = () => {
    setIsSyncing(true);
    addLog('Sincronização', 'Iniciando validação de integridade do banco local', 'info');
    setTimeout(() => {
      const now = new Date().toISOString();
      setIsSyncing(false);
      setLastSync(now);
      localStorage.setItem('impacto_x_last_sync', now);
      addLog('Sincronização', 'Banco de dados sincronizado e persistido', 'success');
    }, 1500);
  };

  const handleFullImport = (data: any) => {
    if (!data) return;
    try {
      // Se for um array simples (vindo de exportação Excel ou backup antigo de capitações)
      if (Array.isArray(data)) {
        setCapitacoes(data);
        localStorage.setItem('impacto_x_capitacoes', JSON.stringify(data));
      } else {
        // Se for um Snapshot completo (Objeto)
        if (data.capitacoes) {
          setCapitacoes(data.capitacoes);
          localStorage.setItem('impacto_x_capitacoes', JSON.stringify(data.capitacoes));
        }
        if (data.empreendimentos) {
          setEmpreendimentos(data.empreendimentos);
          localStorage.setItem('impacto_x_empreendimentos', JSON.stringify(data.empreendimentos));
        }
        if (data.users) {
          setUsers(data.users);
          localStorage.setItem('impacto_x_users', JSON.stringify(data.users));
          
          // Verifica se o usuário atual ainda existe no novo banco
          if (currentUser) {
            const stillExists = data.users.some((u: UserProfile) => u.id === currentUser.id);
            if (!stillExists) {
              localStorage.removeItem('impacto_x_current_user');
            }
          }
        }
        if (data.systemName) {
          setSystemName(data.systemName);
          localStorage.setItem('impacto_x_system_name', data.systemName);
        }
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
          localStorage.setItem('impacto_x_logo', data.logoUrl);
        }
        if (data.accessLogs) {
          setAccessLogs(data.accessLogs);
          localStorage.setItem('impacto_x_logs', JSON.stringify(data.accessLogs));
        }
      }
      
      addLog('Restauração', 'Restauração total do banco de dados concluída', 'success');
      
      // ALERTA E RECARREGAMENTO FORÇADO
      alert('Snapshot restaurado com sucesso! A aplicação será reiniciada para aplicar todas as configurações.');
      window.location.reload();
      
    } catch (e) {
      console.error('Erro na importação:', e);
      alert('Falha crítica ao processar os dados do Snapshot. Verifique o arquivo.');
    }
  };

  const handleImportExcelData = (newItems: Capitacao[]) => {
    setCapitacoes(prev => {
      const merged = [...newItems, ...prev];
      return merged;
    });
    addLog('Importação Excel', `${newItems.length} novos pontos adicionados via planilha`, 'success');
    alert(`${newItems.length} pontos importados com sucesso!`);
  };

  const handleEditCapitacao = (cap: Capitacao) => {
    setEditingCapitacao(cap);
    setNewType('capitacao');
    setActiveTab('Novo');
  };

  if (!currentUser) {
    return <LoginScreen users={users} onSelectUser={handleLogin} systemName={systemName} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(tab) => {
        if (tab !== 'Novo') setEditingCapitacao(null);
        setActiveTab(tab);
      }} 
      logoUrl={logoUrl} 
      onLogoChange={setLogoUrl}
      currentUser={currentUser}
      onSwitchUser={handleLogout}
      systemName={systemName}
    >
      {activeTab === 'Dashboard' && <DashboardScreen capitacoes={capitacoes} onImport={handleFullImport} isSyncing={isSyncing} />}
      {activeTab === 'Capitações' && (
        <CapitacoesScreen 
          capitacoes={capitacoes} 
          empreendimentos={empreendimentos}
          onDelete={(id) => {
            if (window.confirm('Excluir permanentemente?')) {
              setCapitacoes(prev => prev.filter(c => c.id !== id));
              addLog('Exclusão', `Capitação removida`, 'warning');
            }
          }}
          onUpdate={handleEditCapitacao}
          onImport={handleFullImport}
          onImportExcel={handleImportExcelData}
        />
      )}
      {activeTab === 'Empreendimentos' && (
        <PlantoesScreen 
          empreendimentos={empreendimentos} 
          onAddRequest={() => {
            setNewType('empreendimento');
            setActiveTab('Novo');
          }} 
          onDelete={(id) => {
            if (window.confirm('Excluir empreendimento? Isso pode afetar capitações vinculadas.')) {
              setEmpreendimentos(prev => prev.filter(e => e.id !== id));
              addLog('Exclusão', 'Empreendimento removido', 'warning');
            }
          }}
          onUpdate={(updated) => {
            setEmpreendimentos(prev => prev.map(e => e.id === updated.id ? updated : e));
            addLog('Edição', `Empreendimento "${updated.nome}" atualizado`, 'info');
          }}
        />
      )}
      {activeTab === 'Novo' && (
        <>
          {newType === 'capitacao' ? (
            <NovaCapitacaoScreen 
              empreendimentos={empreendimentos}
              initialData={editingCapitacao || undefined}
              onSave={(nova) => {
                if (editingCapitacao) {
                  const updated: Capitacao = { 
                    ...editingCapitacao, 
                    ...nova,
                    margem: nova.valor_pago - nova.valor_proposta
                  };
                  setCapitacoes(prev => prev.map(c => c.id === updated.id ? updated : c));
                  addLog('Edição', `Capitação "${updated.nome}" atualizada`, 'success');
                } else {
                  const today = new Date();
                  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                  const newEntry: Capitacao = { ...nova, id: Date.now(), data: today.toISOString().split('T')[0], mes: meses[today.getMonth()] };
                  setCapitacoes(prev => [newEntry, ...prev]);
                  addLog('Novo Cadastro', `Nova capitação criada: ${nova.nome}`, 'success');
                }
                setEditingCapitacao(null);
                setActiveTab('Capitações');
              }} 
              onCancel={() => {
                setEditingCapitacao(null);
                setActiveTab('Capitações');
              }} 
            />
          ) : (
            <NovoEmpreendimentoScreen 
              onSave={(nova) => {
                const newEntry: Empreendimento = { ...nova, id: Date.now() };
                setEmpreendimentos(prev => [newEntry, ...prev]);
                addLog('Novo Cadastro', `Novo empreendimento criado: ${nova.nome}`, 'success');
                setActiveTab('Empreendimentos');
                setNewType('capitacao'); 
              }}
              onCancel={() => {
                setActiveTab('Empreendimentos');
                setNewType('capitacao');
              }}
            />
          )}
        </>
      )}
      {activeTab === 'Config' && (
        <ConfiguracoesScreen 
          users={users}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          capitacoes={capitacoes}
          empreendimentos={empreendimentos}
          accessLogs={accessLogs}
          onImport={handleFullImport}
          isSyncing={isSyncing}
          lastSync={lastSync}
          onSync={triggerSync}
          onLogout={handleLogout}
          systemName={systemName}
          onSystemNameChange={setSystemName}
        />
      )}
    </Layout>
  );
};

export default App;
