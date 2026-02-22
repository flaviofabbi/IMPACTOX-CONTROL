import React, { useState, useEffect } from 'react';
import { AppTab, Capitacao, Empreendimento, UserProfile } from './types';
import Layout from './components/Layout';
import DashboardScreen from './screens/DashboardScreen';
import CapitacoesScreen from './screens/CapitacoesScreen';
import PlantoesScreen from './screens/PlantoesScreen';
import NovaCapitacaoScreen from './screens/NovaCapitacaoScreen';
import NovoEmpreendimentoScreen from './screens/NovoEmpreendimentoScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';
import LoginScreen from './screens/LoginScreen';
import { db } from './lib/database';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('Dashboard');
  const [newType, setNewType] = useState<'capitacao' | 'empreendimento'>('capitacao');
  const [editingCapitacao, setEditingCapitacao] = useState<Capitacao | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [systemName, setSystemName] = useState('Impacto X Mobile');
  const [logoUrl, setLogoUrl] = useState("https://api.dicebear.com/7.x/shapes/svg?seed=impacto&backgroundColor=0ea5e9");

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [capitacoes, setCapitacoes] = useState<Capitacao[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = db.auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const profile = await db.users.getProfile(user.uid);
          if (profile) {
            setCurrentUser(profile);
            await refreshData(profile.id);
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Erro na inicialização de perfil:", err);
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshData = async (userId: string) => {
    setIsSyncing(true);
    try {
      const [caps, emps, allUsers] = await Promise.all([
        db.capitacoes.getAll(userId),
        db.empreendimentos.getAll(userId),
        db.users.getAll()
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
    await db.auth.logout();
    setCurrentUser(null);
  };

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
      await refreshData(currentUser.id);
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
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen systemName={systemName} onLogin={() => {}} />;
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
      {activeTab === 'Dashboard' && <DashboardScreen capitacoes={capitacoes} isSyncing={isSyncing} onImport={handleImportData} />}
      
      {activeTab === 'Capitações' && (
        <CapitacoesScreen 
          capitacoes={capitacoes} 
          empreendimentos={empreendimentos}
          onDelete={async (id) => { 
            await db.capitacoes.delete(id.toString()); 
            await refreshData(currentUser.id); 
          }}
          onDeleteInactive={async () => { 
            await db.capitacoes.clearInactives(currentUser.id); 
            await refreshData(currentUser.id); 
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
          onAddRequest={() => { setNewType('empreendimento'); setActiveTab('Novo'); }} 
          onDelete={async (id) => { 
            await db.empreendimentos.delete(id.toString()); 
            await refreshData(currentUser.id); 
          }}
          onUpdate={async (u) => { 
            await db.empreendimentos.save(u); 
            await refreshData(currentUser.id); 
          }}
        />
      )}

      {activeTab === 'Novo' && (
        newType === 'capitacao' ? (
          <NovaCapitacaoScreen 
            empreendimentos={empreendimentos}
            initialData={editingCapitacao || undefined}
            onSave={async (nova) => {
              await db.capitacoes.save({
                ...nova,
                userId: currentUser.id,
                id: editingCapitacao?.id || undefined,
                data: new Date().toISOString().split('T')[0],
                mes: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][new Date().getMonth()]
              });
              setEditingCapitacao(null);
              await refreshData(currentUser.id);
              setActiveTab('Capitações');
            }} 
            onCancel={() => { setEditingCapitacao(null); setActiveTab('Capitações'); }} 
          />
        ) : (
          <NovoEmpreendimentoScreen 
            onSave={async (nova) => {
              await db.empreendimentos.save({ ...nova, userId: currentUser.id });
              await refreshData(currentUser.id);
              setActiveTab('Empreendimentos');
            }}
            onCancel={() => setActiveTab('Empreendimentos')}
          />
        )
      )}

      {activeTab === 'Config' && (
        <ConfiguracoesScreen 
          users={users} 
          onAddUser={async (u) => { 
             const uid = 'u_' + Math.random().toString(36).substr(2, 9);
             await db.users.setProfile(uid, { ...u, id: uid });
             await refreshData(currentUser.id);
          }} 
          onUpdateUser={async (u) => { 
            await db.users.setProfile(u.id, u); 
            await refreshData(currentUser.id); 
          }} 
          onDeleteUser={async (id) => { 
            const updatedUsers = users.filter(u => u.id !== id);
            localStorage.setItem('ix_users', JSON.stringify(updatedUsers));
            await refreshData(currentUser.id);
          }}
          capitacoes={capitacoes} empreendimentos={empreendimentos} accessLogs={[]}
          onImport={handleImportData} isSyncing={isSyncing} lastSync={""} onSync={() => refreshData(currentUser.id)}
          onLogout={handleLogout} systemName={systemName} onSystemNameChange={setSystemName}
        />
      )}
    </Layout>
  );
};

export default App;