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
import { AlertCircle } from 'lucide-react';
import { db, testFirestoreConnection } from './lib/database';
import ErrorBoundary from './components/ErrorBoundary';
import { parseCSV } from './lib/importUtils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('Dashboard');
  const [newType, setNewType] = useState<'capitacao' | 'empreendimento'>('capitacao');
  const [editingCapitacao, setEditingCapitacao] = useState<Capitacao | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState("/assets/logo.png");
  const [systemName, setSystemName] = useState('Impacto X');
  const [whatsappTemplate, setWhatsappTemplate] = useState('⚠️ Alerta de vencimento\nO ponto de captação [nome] vence em [data].\nFaltam 5 dias para o término do contrato.\nVerifique no aplicativo.');

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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('impacto_logo');
    if (savedLogo) setLogoUrl(savedLogo);
    
    testFirestoreConnection();

    const timeout = setTimeout(() => {
      if (isInitializing) {
        console.warn("Initialization timed out, forcing login screen");
        setIsInitializing(false);
      }
    }, 8000);

    const unsubscribeAuth = db.auth.onAuthStateChanged(async (user) => {
      try {
        setAuthError(null);
        if (user) {
          console.log("Usuário autenticado:", user.email, user.uid);
          let profile = await db.users.getProfile(user.uid);
          
          const adminEmails = [
            "flaviofabbi@gmail.com",
            "flavio@gmail.com",
            "flaviofabbi@impactox.com"
          ];
          const isAdminEmail = adminEmails.includes(user.email?.toLowerCase() || "");

          if (!profile) {
            console.log("Perfil não encontrado, criando novo...");
            profile = {
              id: user.uid,
              nome: user.isAnonymous ? 'Visitante' : (user.displayName || user.email?.split('@')[0] || 'Operador'),
              email: user.email || 'anonimo@impactox.com',
              cargo: isAdminEmail ? 'ADMIN' : 'Operador',
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.uid}`,
              cor: 'from-sky-500 to-blue-700'
            };
            try {
              await db.users.setProfile(user.uid, profile);
            } catch (err: any) {
              console.error("Erro ao criar perfil:", err);
              setAuthError(`Erro ao criar perfil para ${user.email}. Verifique as permissões do banco de dados.`);
              setCurrentUser(null);
              setIsInitializing(false);
              return;
            }
          } else if (isAdminEmail && profile.cargo !== 'ADMIN') {
            // Atualiza para ADMIN se o e-mail estiver na lista mas o perfil ainda não for ADMIN
            profile.cargo = 'ADMIN';
            await db.users.setProfile(user.uid, profile);
          }

          setCurrentUser(profile);
          await db.users.updatePresence(user.uid, true);
        } else {
          setCurrentUser(null);
          setCapitacoes([]);
          setEmpreendimentos([]);
        }
      } catch (err: any) {
        console.error("Erro na inicialização de perfil:", err);
        setAuthError(`Erro ao carregar perfil (${user?.email || 'sem e-mail'}). Tente fazer Logout e entrar novamente.`);
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
      if (data.whatsappTemplate) setWhatsappTemplate(data.whatsappTemplate);
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

  const handleWhatsappTemplateChange = async (newTemplate: string) => {
    setWhatsappTemplate(newTemplate);
    await db.settings.save({ whatsappTemplate: newTemplate });
  };

  const checkVencimentos = React.useCallback(async () => {
    if (!capitacoes.length) return;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeStr = hoje.toISOString().split('T')[0];
    
    const cincoDiasDepois = new Date(hoje);
    cincoDiasDepois.setDate(hoje.getDate() + 5);
    const cincoDiasDepoisStr = cincoDiasDepois.toISOString().split('T')[0];

    console.log(`Verificando vencimentos... Hoje: ${hojeStr}, Alvo 5D: ${cincoDiasDepoisStr}`);

    for (const ponto of capitacoes) {
      let novoStatus = ponto.status;
      const dataTermino = ponto.dataTermino;

      // Se o contrato já estiver inativo, não mudamos automaticamente para não sobrescrever desativações manuais
      if (ponto.status === 'inativo') continue;

      if (dataTermino < hojeStr) {
        novoStatus = 'vencido';
      } else if (dataTermino <= cincoDiasDepoisStr) {
        novoStatus = 'vencendo';
      } else if (dataTermino > cincoDiasDepoisStr && (ponto.status === 'vencendo' || ponto.status === 'vencido')) {
        // Se foi renovado ou a data mudou para o futuro, volta a ser ativo
        novoStatus = 'ativo';
      }

      // Atualiza status se mudou
      if (novoStatus !== ponto.status) {
        console.log(`Atualizando status de ${ponto.nome}: ${ponto.status} -> ${novoStatus}`);
        await db.capitacoes.updateStatus(ponto.id.toString(), novoStatus);
      }

      // Lógica de notificação WhatsApp (apenas se for exatamente 5 dias e ainda não enviado)
      if (dataTermino === cincoDiasDepoisStr && !ponto.aviso5DiasEnviado && novoStatus === 'vencendo') {
        const msg = encodeURIComponent(whatsappTemplate.replace('[nome]', ponto.nome).replace('[data]', ponto.dataTermino).replace('[empreendimento]', ponto.empreendimentoNome));
        
        console.log(`Notificação de 5 dias para: ${ponto.nome}`);
        console.log(`Mensagem: ${decodeURIComponent(msg)}`);
        
        // Atualiza no banco que o aviso foi processado
        await db.capitacoes.updateAvisoEnviado(ponto.id.toString());
      }
    }
  }, [capitacoes, whatsappTemplate]);

  useEffect(() => {
    // Executa uma vez quando os dados carregam
    if (capitacoes.length > 0) {
      checkVencimentos();
    }
  }, [capitacoes.length > 0]); // Só dispara quando sai de 0 para > 0

  useEffect(() => {
    const handleTrigger = () => checkVencimentos();
    window.addEventListener('trigger-vencimento-check', handleTrigger);
    return () => window.removeEventListener('trigger-vencimento-check', handleTrigger);
  }, [checkVencimentos]);

  const handleImportData = async (data: any) => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      if (data.users && Array.isArray(data.users)) {
        for (const u of data.users) {
          await db.users.setProfile(u.id, u);
        }
      }
      if (data.capitacoes && Array.isArray(data.capitacoes)) {
        for (const c of data.capitacoes) {
          await db.capitacoes.save({ ...c, userId: currentUser.id });
        }
      }
      if (data.empreendimentos && Array.isArray(data.empreendimentos)) {
        for (const e of data.empreendimentos) {
          await db.empreendimentos.save({ ...e, userId: currentUser.id });
        }
      }
      await refreshData();
      alert('Dados importados com sucesso!');
    } catch (e) {
      alert('Erro na importação: ' + e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportFile = async (file: File) => {
    if (!currentUser) return;
    
    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          handleImportData(json);
        } catch (err) {
          alert('Erro ao processar arquivo JSON: ' + err);
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      try {
        const result = await parseCSV(file);
        if (result.errors.length > 0) {
          console.warn('Erros no CSV:', result.errors);
        }
        await handleImportData({
          capitacoes: result.capitacoes,
          empreendimentos: result.empreendimentos
        });
      } catch (err) {
        alert('Erro ao processar arquivo CSV: ' + err);
      }
    } else {
      alert('Formato de arquivo não suportado. Use .json ou .csv');
    }
  };
  
  const handleCloudExport = async (id: string) => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const data = {
        users,
        capitacoes,
        empreendimentos,
        systemName,
        timestamp: new Date().toISOString()
      };
      await db.backups.save(id, data);
      alert(`Backup Cloud salvo com sucesso! ID: ${id}`);
    } catch (e) {
      alert('Erro ao exportar para Cloud: ' + e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudImport = async (id: string) => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const data = await db.backups.get(id);
      if (data) {
        await handleImportData(data);
        alert('Dados importados do Cloud com sucesso!');
      } else {
        alert('Backup Cloud não encontrado para o ID: ' + id);
      }
    } catch (e) {
      alert('Erro ao importar do Cloud: ' + e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-xs text-center">
          {authError ? (
            <>
              <AlertCircle className="text-red-500 w-12 h-12 mb-2" />
              <p className="text-red-400 text-xs font-bold">{authError}</p>
              <button 
                onClick={async () => {
                  await db.auth.logout();
                  window.location.reload();
                }}
                className="mt-4 px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-red-500/20 transition-all"
              >
                Sair e Tentar Novamente
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
              <p className="text-sky-500/50 text-[10px] font-black uppercase tracking-widest animate-pulse">Impacto X Terminal...</p>
            </>
          )}
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
        externalError={authError}
        onLogin={async () => {
          try {
            setAuthError(null);
            setIsInitializing(true);
            await db.auth.loginWithGoogle();
          } catch (e: any) {
            console.error("Erro no login Google:", e);
            setAuthError("Erro ao entrar com Google. Tente novamente.");
            setIsInitializing(false);
          }
        }} 
      />
    );
  }

  return (
    <ErrorBoundary>
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
            onImportFile={handleImportFile}
            logoUrl={logoUrl}
            whatsappTemplate={whatsappTemplate}
            onUpdateAviso={async (id) => {
              await db.capitacoes.updateAvisoEnviado(id);
              await refreshData();
            }}
            onNavigate={(tab) => {
              if (tab === 'NovaCapitacao') {
                setNewType('capitacao');
                setActiveTab('Novo');
              } else if (tab === 'NovoEmpreendimento') {
                setNewType('empreendimento');
                setActiveTab('Novo');
              } else {
                setActiveTab(tab as AppTab);
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
            onImportFile={handleImportFile}
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
            onImport={handleImportData} 
            onImportFile={handleImportFile}
            onCloudExport={handleCloudExport}
            onCloudImport={handleCloudImport}
            isSyncing={isSyncing} lastSync={""} onSync={() => refreshData()}
            onLogout={handleLogout} systemName={systemName} onSystemNameChange={handleSystemNameChange}
            whatsappTemplate={whatsappTemplate} onWhatsappTemplateChange={handleWhatsappTemplateChange}
            onCheckVencimentos={checkVencimentos}
          />
        )}
      </Layout>
    </ErrorBoundary>
  );
};

export default App;