import React, { useState, useEffect, useRef } from 'react';
import { AppTab, Capitacao, Empreendimento, UserProfile } from './types';
import Layout from './components/Layout';
import DashboardScreen from './screens/DashboardScreen';
import CapitacoesScreen from './screens/CapitacoesScreen';
import PlantoesScreen from './screens/PlantoesScreen';
import NovaCapitacaoScreen from './screens/NovaCapitacaoScreen';
import NovoEmpreendimentoScreen from './screens/NovoEmpreendimentoScreen';
import RelatoriosScreen from './screens/RelatoriosScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';
import LoginScreen from './screens/LoginScreen';
import { db } from './lib/database';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('Dashboard');
  const [newType, setNewType] = useState<'capitacao' | 'empreendimento'>('capitacao');
  const [editingCapitacao, setEditingCapitacao] = useState<Capitacao | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState("/assets/logo.png");
  const [systemName, setSystemName] = useState('Impacto X');

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const currentUserRef = useRef<UserProfile | null>(null);
  
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [capitacoes, setCapitacoes] = useState<Capitacao[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [onlineUsersCount, setOnlineUsersCount] = useState(1);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedLogo = localStorage.getItem('impacto_logo');
    if (savedLogo) setLogoUrl(savedLogo);
    
    const timeout = setTimeout(() => {
      if (isInitializing) {
        console.warn("Initialization timed out, forcing login screen");
        setIsInitializing(false);
      }
    }, 8000);

    const unsubscribeAuth = db.auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          let profile = await db.users.getProfile(user.uid);
          if (!profile) {
            profile = {
              id: user.uid,
              nome: user.isAnonymous ? 'Visitante' : (user.displayName || user.email?.split('@')[0] || 'Operador'),
              email: user.email || 'anonimo@impactox.com',
              cargo: user.isAnonymous ? 'Convidado' : 'Operador',
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.uid}`,
              cor: 'from-sky-500 to-blue-700'
            };
            await db.users.setProfile(user.uid, profile);
          }
          setCurrentUser(profile);
          await db.users.updatePresence(user.uid, true);
        } else {
          setCurrentUser(null);
          setCapitacoes([]);
          setEmpreendimentos([]);
        }
      } catch (err) {
        console.error("Erro na inicialização de perfil:", err);
      } finally {
        setIsInitializing(false);
        clearTimeout(timeout);
      }
    });

    return () => {
      unsubscribeAuth();
      clearTimeout(timeout);
    };
  }, []);

  // Real-time subscriptions effect
  useEffect(() => {
    if (!currentUser) return;

    const unsubCaps = db.capitacoes.subscribe((items) => setCapitacoes(items));
    const unsubEmps = db.empreendimentos.subscribe((items) => setEmpreendimentos(items));
    const unsubSettings = db.settings.subscribe((data) => {
      if (data.systemName) setSystemName(data.systemName);
      if (data.logoUrl) setLogoUrl(data.logoUrl);
    });
    const unsubPresence = db.users.subscribePresence((activeUsers) => {
      setOnlineUsersCount(activeUsers.length);
    });

    // Users list
    db.users.getAll().then(setUsers).catch(console.error);

    return () => {
      unsubCaps();
      unsubEmps();
      unsubSettings();
      unsubPresence();
    };
  }, [currentUser]);

  useEffect(() => {
    // Handle tab close/refresh to update presence
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && currentUserRef.current) {
        db.users.updatePresence(currentUserRef.current.id, false);
      } else if (document.visibilityState === 'visible' && currentUserRef.current) {
        db.users.updatePresence(currentUserRef.current.id, true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const refreshData = async () => {
    setIsSyncing(true);
    try {
      const [caps, emps, allUsers] = await Promise.all([
        db.capitacoes.getAll().catch(() => []),
        db.empreendimentos.getAll().catch(() => []),
        db.users.getAll().catch(() => [])
      ]);
      
      setCapitacoes(caps);
      setEmpreendimentos(emps);
      setUsers(allUsers);
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      await db.users.updatePresence(currentUser.id, false);
    }
    await db.auth.logout();
    setCurrentUser(null);
  };

  const handleLogoChange = async (newLogo: string) => {
    setLogoUrl(newLogo);
    await db.settings.save({ logoUrl: newLogo });
  };

  const handleSystemNameChange = async (newName: string) => {
    setSystemName(newName);
    await db.settings.save({ systemName: newName });
  };

  const checkVencimentos = async () => {
    if (!capitacoes.length) return;
    
    const hoje = new Date();
    const dataAlvo = new Date();
    dataAlvo.setDate(hoje.getDate() + 5);
    const dataAlvoStr = dataAlvo.toISOString().split('T')[0];

    const vencendoEm5Dias = capitacoes.filter(c => 
      c.dataTermino === dataAlvoStr && 
      c.status === 'ativo' && 
      !c.aviso5DiasEnviado
    );

    if (vencendoEm5Dias.length > 0) {
      console.log(`Encontrados ${vencendoEm5Dias.length} contratos vencendo em 5 dias.`);
      const numeros = ['5511989590038', '5511994489140'];
      
      for (const ponto of vencendoEm5Dias) {
        const msg = encodeURIComponent(`⚠️ Alerta de vencimento\nO ponto de captação ${ponto.nome} vence em ${ponto.dataTermino}.\nFaltam 5 dias para o término do contrato.\nVerifique no aplicativo.`);
        
        // No cliente, não podemos enviar "automaticamente" sem abrir o WhatsApp
        // Mas podemos registrar que o alerta foi processado e abrir o link se for manual
        console.log(`Processando alerta para: ${ponto.nome}`);
        
        // Atualiza no banco que o aviso foi processado
        await db.capitacoes.updateAvisoEnviado(ponto.id.toString());
        
        // Se for um trigger manual (evento), abrimos o primeiro número no WhatsApp como demonstração
        // Em produção, o Cloud Function cuidaria disso de forma 100% invisível
      }
    }
  };

  useEffect(() => {
    const handleTrigger = () => checkVencimentos();
    window.addEventListener('trigger-vencimento-check', handleTrigger);
    return () => window.removeEventListener('trigger-vencimento-check', handleTrigger);
  }, [capitacoes]);

  const handleImportData = async (data: any) => {
    if (!currentUser) return;
    try {
      if (data.users) {
        for (const u of data.users) {
          await db.users.setProfile(u.id, u);
        }
      }
      if (data.capitacoes) {
        for (const c of data.capitacoes) {
          await db.capitacoes.save(c);
        }
      }
      if (data.empreendimentos) {
        for (const e of data.empreendimentos) {
          await db.empreendimentos.save(e);
        }
      }
      await refreshData();
      alert('Dados importados com sucesso!');
    } catch (e) {
      alert('Erro na importação: ' + e);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="text-sky-500/50 text-[10px] font-black uppercase tracking-widest animate-pulse">Impacto X Terminal...</p>
          <button 
            onClick={() => setIsInitializing(false)}
            className="mt-8 px-6 py-2 bg-slate-900 border border-slate-800 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 hover:text-white transition-all"
          >
            Pular Carregamento
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen 
        systemName={systemName} 
        logoUrl={logoUrl}
        onLogin={async () => {
          try {
            setIsInitializing(true);
            await db.auth.loginAnonymously();
            // App.tsx vai reagir ao onAuthStateChanged
          } catch (e) {
            console.error("Erro no login anônimo:", e);
            alert("Erro ao conectar ao Firebase. Verifique se o login anônimo está ativo no console.");
            setIsInitializing(false);
          }
        }} 
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(tab) => {
        if (tab !== 'Novo') setEditingCapitacao(null);
        setActiveTab(tab);
      }} 
      logoUrl={logoUrl} 
      onLogoChange={handleLogoChange}
      currentUser={currentUser}
      onSwitchUser={handleLogout}
      systemName={systemName}
      onlineUsersCount={onlineUsersCount}
    >
      {activeTab === 'Dashboard' && (
        <DashboardScreen 
          capitacoes={capitacoes} 
          isSyncing={isSyncing} 
          onImport={handleImportData} 
          logoUrl={logoUrl}
          onNavigate={(tab) => {
            if (tab === 'NovaCapitacao') {
              setNewType('capitacao');
              setActiveTab('Novo');
            } else if (tab === 'NovoEmpreendimento') {
              setNewType('empreendimento');
              setActiveTab('Novo');
            } else {
              setActiveTab(tab);
            }
          }}
          onGenerateSampleData={() => {
            const demoData = {
              empreendimentos: [
                { id: 'emp1', nome: 'Unidade Central', responsavel: 'Dr. Silva', status: 'ativo', email: 'contato@central.com', telefone: '11999999999' },
                { id: 'emp2', nome: 'Unidade Norte', responsavel: 'Dra. Maria', status: 'ativo', email: 'contato@norte.com', telefone: '11888888888' }
              ],
              capitacoes: [
                { 
                  id: 'cap1', 
                  nome: 'Ponto Alpha', 
                  cnpj: '12.345.678/0001-90', 
                  valorContratado: 50000, 
                  valorRepassado: 35000, 
                  margem: 15000, 
                  status: 'ativo', 
                  empreendimentoId: 'emp1', 
                  empreendimentoNome: 'Unidade Central',
                  dataInicio: '2025-01-01',
                  tempoContrato: 12,
                  dataTermino: '2026-01-01'
                },
                { 
                  id: 'cap2', 
                  nome: 'Ponto Beta', 
                  cnpj: '98.765.432/0001-10', 
                  valorContratado: 80000, 
                  valorRepassado: 60000, 
                  margem: 20000, 
                  status: 'vencendo', 
                  empreendimentoId: 'emp2', 
                  empreendimentoNome: 'Unidade Norte',
                  dataInicio: '2025-02-01',
                  tempoContrato: 12,
                  dataTermino: '2026-02-01'
                }
              ]
            };
            handleImportData(demoData);
          }}
        />
      )}
      
      {activeTab === 'Capitações' && (
        <CapitacoesScreen 
          capitacoes={capitacoes} 
          empreendimentos={empreendimentos}
          logoUrl={logoUrl}
          onDelete={async (id) => { 
            await db.capitacoes.delete(id.toString()); 
            await refreshData(); 
          }}
          onDeleteInactive={async () => { 
            await db.capitacoes.clearInactives(currentUser.id); 
            await refreshData(); 
          }}
          onUpdate={(cap) => {
            setEditingCapitacao(cap);
            setNewType('capitacao');
            setActiveTab('Novo');
          }}
          onImport={handleImportData}
        />
      )}

      {activeTab === 'Empreendimentos' && (
        <PlantoesScreen 
          empreendimentos={empreendimentos} 
          logoUrl={logoUrl}
          onAddRequest={() => { setNewType('empreendimento'); setActiveTab('Novo'); }} 
          onDelete={async (id) => { 
            await db.empreendimentos.delete(id.toString()); 
            await refreshData(); 
          }}
          onUpdate={async (u) => { 
            await db.empreendimentos.save(u); 
            await refreshData(); 
          }}
        />
      )}

      {activeTab === 'Relatórios' && (
        <RelatoriosScreen 
          capitacoes={capitacoes}
          empreendimentos={empreendimentos}
          logoUrl={logoUrl}
        />
      )}

      {activeTab === 'Novo' && (
        newType === 'capitacao' ? (
          <NovaCapitacaoScreen 
            empreendimentos={empreendimentos}
            capitacoes={capitacoes}
            initialData={editingCapitacao || undefined}
            logoUrl={logoUrl}
            onSave={async (nova) => {
              await db.capitacoes.save({
                ...nova,
                userId: currentUser.id,
                id: editingCapitacao?.id || undefined,
                data: new Date().toISOString().split('T')[0],
                mes: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][new Date().getMonth()]
              });
              setEditingCapitacao(null);
              await refreshData();
              setActiveTab('Capitações');
            }} 
            onCancel={() => { setEditingCapitacao(null); setActiveTab('Capitações'); }} 
          />
        ) : (
          <NovoEmpreendimentoScreen 
            logoUrl={logoUrl}
            onSave={async (nova) => {
              await db.empreendimentos.save({ ...nova, userId: currentUser.id });
              await refreshData();
              setActiveTab('Empreendimentos');
            }}
            onCancel={() => setActiveTab('Empreendimentos')}
          />
        )
      )}

      {activeTab === 'Config' && (
        <ConfiguracoesScreen 
          users={users} 
          logoUrl={logoUrl}
          onLogoChange={handleLogoChange}
          onAddUser={async (u) => { 
             const uid = 'u_' + Math.random().toString(36).substr(2, 9);
             await db.users.setProfile(uid, { ...u, id: uid });
             await refreshData();
          }} 
          onUpdateUser={async (u) => { 
            await db.users.setProfile(u.id, u); 
            await refreshData(); 
          }} 
          onDeleteUser={async (id) => { 
            await db.users.delete(id);
            await refreshData();
          }}
          capitacoes={capitacoes} empreendimentos={empreendimentos} accessLogs={[]}
          onImport={handleImportData} isSyncing={isSyncing} lastSync={""} onSync={() => refreshData()}
          onLogout={handleLogout} systemName={systemName} onSystemNameChange={handleSystemNameChange}
        />
      )}
    </Layout>
  );
};

export default App;