
import React, { useState } from 'react';
import { db } from '../lib/database';
import { Fingerprint, Lock, Mail, User, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

interface Props {
  systemName: string;
  logoUrl: string;
  onLogin: () => Promise<void> | void;
}

const getAvatar = (name: string) => 
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f172a&fontWeight=700&fontSize=45&fontFamily=Inter`;

const LoginScreen: React.FC<Props> = ({ systemName, logoUrl, onLogin }) => {
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
        // Garantir que o perfil foi salvo antes de prosseguir
        await db.users.setProfile(userCredential.user.uid, profile);
        console.log("Perfil criado com sucesso para:", email);
      } else {
        await db.auth.login(email, password);
        console.log("Login realizado com sucesso para:", email);
      }
      // O App.tsx vai reagir ao onAuthStateChanged
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos. Se for seu primeiro acesso, clique em "Criar acesso" abaixo.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('E-mail já cadastrado. Tente fazer login ou use outro e-mail.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O método de login por e-mail/senha não está habilitado no Console do Firebase. Por favor, habilite-o em Authentication > Sign-in method.');
      } else {
        setError('Falha na autenticação: ' + (err.message || 'Erro desconhecido'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Por favor, insira seu e-mail para recuperar a senha.');
      return;
    }
    setIsLoading(true);
    try {
      await db.auth.resetPassword(email);
      setError('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setError('Erro ao enviar e-mail: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] z-[200] flex flex-col items-center justify-center p-6 md:p-8 overflow-hidden">
      {/* Corner Watermarks */}
      <div className="absolute top-10 left-10 opacity-10 pointer-events-none hidden lg:block">
        <img src={logoUrl} className="w-40 h-40 object-contain grayscale brightness-200" alt="Watermark" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none hidden lg:block">
        <img src={logoUrl} className="w-40 h-40 object-contain grayscale brightness-200" alt="Watermark" />
      </div>

      <div className="w-full max-w-md text-center mb-8 animate-in fade-in zoom-in duration-700">
        <div className="inline-flex mb-6">
          <img src={logoUrl} className="w-32 h-32 rounded-3xl object-cover" alt="Logo" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
          {systemName}
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Terminal de Operações Ativo</p>
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
            <div className="flex justify-between items-center ml-2">
              <label className="text-[9px] font-black text-slate-500 uppercase">Senha</label>
              {!isRegistering && (
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[8px] font-black text-sky-500 uppercase hover:text-sky-400 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
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
                {isRegistering ? 'Criar Conta' : 'Acessar Terminal'}
                <ChevronRight size={18} />
              </>
            )}
          </button>

          {!isRegistering && (
            <div className="pt-2">
              <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <span className="relative px-4 bg-[#0f172a] text-[8px] font-black text-slate-600 uppercase tracking-widest">Ou Acesso Rápido</span>
              </div>
              
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await onLogin();
                  } catch (err: any) {
                    if (err.code === 'auth/operation-not-allowed') {
                      setError('O login com Google não está habilitado no Console do Firebase. Por favor, habilite-o em Authentication > Sign-in method.');
                    } else {
                      setError('Falha no login com Google: ' + err.message);
                    }
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest hover:bg-slate-100 active:scale-95 cursor-pointer"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin text-slate-950" /> : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                    Entrar com Google
                  </>
                )}
              </button>
              <p className="text-center text-[7px] text-slate-600 uppercase font-black tracking-widest mt-3">
                Acesso Seguro via Google ou E-mail
              </p>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-sky-400 transition-colors"
          >
            {isRegistering ? 'Já possui conta? Entrar' : 'Novo por aqui? Criar acesso'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
