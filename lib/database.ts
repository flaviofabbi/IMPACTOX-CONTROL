import { Capitacao, Empreendimento, UserProfile } from '../types';
import { auth, firestore } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  addDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

// Utility to remove undefined fields before saving to Firestore
const cleanData = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';

export const db = {
  capitacoes: {
    getAll: async (): Promise<Capitacao[]> => {
      const q = query(collection(firestore, 'capitacoes'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Capitacao));
    },
    subscribe: (callback: (items: Capitacao[]) => void): Unsubscribe => {
      const q = query(collection(firestore, 'capitacoes'));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Capitacao));
        callback(items);
      });
    },
    save: async (item: any) => {
      const cleaned = cleanData(item);
      if (cleaned.id) {
        const { id, ...data } = cleaned;
        const docRef = doc(firestore, 'capitacoes', id.toString());
        await setDoc(docRef, data, { merge: true });
      } else {
        const { id, ...data } = cleaned;
        await addDoc(collection(firestore, 'capitacoes'), data);
      }
    },
    delete: async (id: string) => {
      await deleteDoc(doc(firestore, 'capitacoes', id));
    },
    clearInactives: async (userId: string) => {
      const q = query(
        collection(firestore, 'capitacoes'), 
        where('userId', '==', userId), 
        where('status', '==', 'inativo')
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    },
    updateAvisoEnviado: async (id: string) => {
      const docRef = doc(firestore, 'capitacoes', id);
      await updateDoc(docRef, { aviso5DiasEnviado: true });
    }
  },
  empreendimentos: {
    getAll: async (): Promise<Empreendimento[]> => {
      const q = query(collection(firestore, 'empreendimentos'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Empreendimento));
    },
    subscribe: (callback: (items: Empreendimento[]) => void): Unsubscribe => {
      const q = query(collection(firestore, 'empreendimentos'));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Empreendimento));
        callback(items);
      });
    },
    save: async (item: any) => {
      const cleaned = cleanData(item);
      if (cleaned.id) {
        const { id, ...data } = cleaned;
        const docRef = doc(firestore, 'empreendimentos', id.toString());
        await setDoc(docRef, data, { merge: true });
      } else {
        const { id, ...data } = cleaned;
        await addDoc(collection(firestore, 'empreendimentos'), data);
      }
    },
    delete: async (id: string) => {
      await deleteDoc(doc(firestore, 'empreendimentos', id));
    }
  },
  users: {
    getProfile: async (uid: string): Promise<UserProfile | null> => {
      const docRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    },
    setProfile: async (uid: string, profile: UserProfile) => {
      await setDoc(doc(firestore, 'users', uid), cleanData(profile), { merge: true });
    },
    getAll: async (): Promise<UserProfile[]> => {
      const snapshot = await getDocs(collection(firestore, 'users'));
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    },
    delete: async (uid: string) => {
      await deleteDoc(doc(firestore, 'users', uid));
    },
    updatePresence: async (uid: string, isOnline: boolean) => {
      await setDoc(doc(firestore, 'presence', uid), {
        uid,
        isOnline,
        lastSeen: new Date().toISOString()
      }, { merge: true });
    },
    subscribePresence: (callback: (users: any[]) => void): Unsubscribe => {
      const q = query(collection(firestore, 'presence'), where('isOnline', '==', true));
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => d.data()));
      });
    }
  },
  settings: {
    get: async () => {
      const docRef = doc(firestore, 'settings', 'global');
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    },
    save: async (data: any) => {
      const docRef = doc(firestore, 'settings', 'global');
      await setDoc(docRef, data, { merge: true });
    },
    subscribe: (callback: (data: any) => void): Unsubscribe => {
      const docRef = doc(firestore, 'settings', 'global');
      return onSnapshot(docRef, (snap) => {
        if (snap.exists()) callback(snap.data());
      });
    }
  },
  auth: {
    login: async (email: string, pass: string) => {
      return await signInWithEmailAndPassword(auth, email, pass);
    },
    signup: async (email: string, pass: string) => {
      return await createUserWithEmailAndPassword(auth, email, pass);
    },
    logout: async () => {
      await signOut(auth);
    },
    onAuthStateChanged: (cb: (user: User | null) => void) => {
      return onAuthStateChanged(auth, cb);
    }
  }
};
