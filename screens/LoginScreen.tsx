
import React, { useState } from 'react';
import { db } from '../lib/database';
import { Fingerprint, Lock, Mail, User, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

interface Props {
  systemName: string;
  onLogin: () => void;
}

const getAvatar = (name: string) => 
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f172a&fontWeight=700&fontSize=45&fontFamily=Inter`;

const LoginScreen: React.FC<Props> = ({ systemName, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!name) throw new Error("Nome é obrigatório");
        const userCredential = await db.auth.signup(email, password);
        const profile = {
          id: userCredential.user.uid,
          nome: name,
          email: email,
          cargo: 'Operador',
          avatar: getAvatar(name),
          cor: 'from-sky-500 to-blue-700'
        };
        await db.users.setProfile(userCredential.user.uid, profile);
      } else {
        await db.auth.login(email, password);
      }
      onLogin();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') setError('Senha incorreta.');
      else if (err.code === 'auth/user-not-found') setError('Usuário não encontrado.');
      else if (err.code === 'auth/email-already-in-use') setError('E-mail já cadastrado.');
      else setError('Falha na autenticação: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] z-[200] flex flex-col items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-md text-center mb-8 animate-in fade-in zoom-in duration-700">
        <div className="inline-flex p-5 rounded-full bg-sky-500/10 mb-6 border border-sky-500/20">
          <Fingerprint size={48} className="text-sky-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
          Impacto <span className="text-sky-500">X</span> Mobile
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Cloud Backend Ativo</p>
      </div>

      <div className="w-full max-w-sm x-glass p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Nome Completo</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="text" placeholder="Como quer ser chamado?" className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-xs outline-none focus:border-sky-500/50" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-2">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input required type="email" placeholder="seu@email.com" className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-xs outline-none focus:border-sky-500/50" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input required type="password" placeholder="Mínimo 6 caracteres" className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-xs outline-none focus:border-sky-500/50" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            disabled={isLoading}
            type="submit"
            className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest shadow-xl shadow-sky-900/40 active:scale-95 cursor-pointer"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                {isRegistering ? 'Criar Conta' : 'Acessar Cloud'}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-sky-400 transition-colors"
          >
            {isRegistering ? 'Já possui conta? Entrar' : 'Novo por aqui? Criar acesso Cloud'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
