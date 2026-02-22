import { Capitacao, Empreendimento, UserProfile } from '../types';

// O sistema opera usando LocalStorage para persistência de dados e autenticação local.
const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }
};

const KEYS = {
  CAPITACOES: 'ix_capitacoes',
  EMPREENDIMENTOS: 'ix_empreendimentos',
  USERS: 'ix_users',
  CURRENT_USER_ID: 'ix_current_uid'
};

const seedInitialUser = () => {
  const users = storage.get<UserProfile[]>(KEYS.USERS, []);
  if (users.length === 0) {
    const defaultUser: UserProfile = {
      id: 'admin_123',
      nome: 'Administrador',
      email: 'admin@impacto.com',
      cargo: 'Diretor de Operações',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=0ea5e9',
      cor: 'from-sky-500 to-blue-700'
    };
    storage.set(KEYS.USERS, [defaultUser]);
  }
};
seedInitialUser();

const authListeners: ((user: any | null) => void)[] = [];
const notifyAuthChange = (user: any | null) => {
  authListeners.forEach(cb => cb(user));
};

export const db = {
  capitacoes: {
    getAll: async (userId: string): Promise<Capitacao[]> => {
      const all = storage.get<Capitacao[]>(KEYS.CAPITACOES, []);
      return all.filter(c => c.userId === userId);
    },
    save: async (item: any) => {
      const all = storage.get<Capitacao[]>(KEYS.CAPITACOES, []);
      if (item.id) {
        const index = all.findIndex(c => c.id.toString() === item.id.toString());
        if (index !== -1) all[index] = { ...all[index], ...item };
      } else {
        all.push({ ...item, id: Date.now().toString() });
      }
      storage.set(KEYS.CAPITACOES, all);
    },
    delete: async (id: string) => {
      const all = storage.get<Capitacao[]>(KEYS.CAPITACOES, []);
      storage.set(KEYS.CAPITACOES, all.filter(c => c.id.toString() !== id.toString()));
    },
    clearInactives: async (userId: string) => {
      const all = storage.get<Capitacao[]>(KEYS.CAPITACOES, []);
      storage.set(KEYS.CAPITACOES, all.filter(c => !(c.userId === userId && c.status === 'inativo')));
    }
  },
  empreendimentos: {
    getAll: async (userId: string): Promise<Empreendimento[]> => {
      const all = storage.get<Empreendimento[]>(KEYS.EMPREENDIMENTOS, []);
      return all.filter(e => e.userId === userId);
    },
    save: async (item: any) => {
      const all = storage.get<Empreendimento[]>(KEYS.EMPREENDIMENTOS, []);
      if (item.id) {
        const index = all.findIndex(e => e.id.toString() === item.id.toString());
        if (index !== -1) all[index] = { ...all[index], ...item };
      } else {
        all.push({ ...item, id: Date.now().toString() });
      }
      storage.set(KEYS.EMPREENDIMENTOS, all);
    },
    delete: async (id: string) => {
      const all = storage.get<Empreendimento[]>(KEYS.EMPREENDIMENTOS, []);
      storage.set(KEYS.EMPREENDIMENTOS, all.filter(e => e.id.toString() !== id.toString()));
    }
  },
  users: {
    getProfile: async (uid: string): Promise<UserProfile | null> => {
      const users = storage.get<UserProfile[]>(KEYS.USERS, []);
      return users.find(u => u.id === uid) || null;
    },
    setProfile: async (uid: string, profile: UserProfile) => {
      const users = storage.get<UserProfile[]>(KEYS.USERS, []);
      const index = users.findIndex(u => u.id === uid);
      if (index !== -1) users[index] = profile;
      else users.push(profile);
      storage.set(KEYS.USERS, users);
    },
    getAll: async (): Promise<UserProfile[]> => {
      return storage.get<UserProfile[]>(KEYS.USERS, []);
    }
  },
  auth: {
    login: async (email: string, pass: string) => {
      await new Promise(r => setTimeout(r, 400));
      const users = storage.get<UserProfile[]>(KEYS.USERS, []);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error("Credenciais inválidas no banco local.");
      storage.set(KEYS.CURRENT_USER_ID, user.id);
      notifyAuthChange({ uid: user.id });
      return { user: { uid: user.id } };
    },
    signup: async (email: string, pass: string) => {
      const uid = 'u_' + Math.random().toString(36).substr(2, 9);
      storage.set(KEYS.CURRENT_USER_ID, uid);
      notifyAuthChange({ uid });
      return { user: { uid } };
    },
    logout: async () => {
      storage.set(KEYS.CURRENT_USER_ID, null);
      notifyAuthChange(null);
    },
    onAuthStateChanged: (cb: (user: any | null) => void) => {
      const uid = storage.get<string | null>(KEYS.CURRENT_USER_ID, null);
      setTimeout(() => cb(uid ? { uid } : null), 50);
      authListeners.push(cb);
      return () => {
        const index = authListeners.indexOf(cb);
        if (index !== -1) authListeners.splice(index, 1);
      };
    }
  }
};