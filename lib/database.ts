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
  Unsubscribe,
  getDocFromServer
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}

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
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';

export const db = {
  capitacoes: {
    getAll: async (): Promise<Capitacao[]> => {
      const path = 'capitacoes';
      try {
        const q = query(collection(firestore, path));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Capitacao));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
        return [];
      }
    },
    subscribe: (callback: (items: Capitacao[]) => void): Unsubscribe => {
      const path = 'capitacoes';
      const q = query(collection(firestore, path));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Capitacao));
        callback(items);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    },
    save: async (item: any) => {
      const path = 'capitacoes';
      const cleaned = cleanData(item);
      try {
        if (cleaned.id) {
          const { id, ...data } = cleaned;
          const docRef = doc(firestore, path, id.toString());
          await setDoc(docRef, data, { merge: true });
        } else {
          const { id, ...data } = cleaned;
          await addDoc(collection(firestore, path), data);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    delete: async (id: string) => {
      const path = `capitacoes/${id}`;
      try {
        await deleteDoc(doc(firestore, 'capitacoes', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    clearInactives: async (userId: string) => {
      const path = 'capitacoes';
      try {
        const q = query(
          collection(firestore, path), 
          where('userId', '==', userId), 
          where('status', '==', 'inativo')
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    updateAvisoEnviado: async (id: string) => {
      const path = `capitacoes/${id}`;
      try {
        const docRef = doc(firestore, 'capitacoes', id);
        await updateDoc(docRef, { aviso5DiasEnviado: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    updateStatus: async (id: string, status: 'ativo' | 'vencendo' | 'vencido' | 'inativo') => {
      const path = `capitacoes/${id}`;
      try {
        const docRef = doc(firestore, 'capitacoes', id);
        await updateDoc(docRef, { status });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  },
  empreendimentos: {
    getAll: async (): Promise<Empreendimento[]> => {
      const path = 'empreendimentos';
      try {
        const q = query(collection(firestore, path));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Empreendimento));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
        return [];
      }
    },
    subscribe: (callback: (items: Empreendimento[]) => void): Unsubscribe => {
      const path = 'empreendimentos';
      const q = query(collection(firestore, path));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Empreendimento));
        callback(items);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    },
    save: async (item: any) => {
      const path = 'empreendimentos';
      const cleaned = cleanData(item);
      try {
        if (cleaned.id) {
          const { id, ...data } = cleaned;
          const docRef = doc(firestore, path, id.toString());
          await setDoc(docRef, data, { merge: true });
        } else {
          const { id, ...data } = cleaned;
          await addDoc(collection(firestore, path), data);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    delete: async (id: string) => {
      const path = `empreendimentos/${id}`;
      try {
        await deleteDoc(doc(firestore, 'empreendimentos', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  },
  users: {
    getProfile: async (uid: string): Promise<UserProfile | null> => {
      const path = `users/${uid}`;
      try {
        const docRef = doc(firestore, 'users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
        return null;
      }
    },
    setProfile: async (uid: string, profile: UserProfile) => {
      const path = `users/${uid}`;
      try {
        await setDoc(doc(firestore, 'users', uid), cleanData(profile), { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    getAll: async (): Promise<UserProfile[]> => {
      const path = 'users';
      try {
        const snapshot = await getDocs(collection(firestore, path));
        return snapshot.docs.map(doc => doc.data() as UserProfile);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
        return [];
      }
    },
    delete: async (uid: string) => {
      const path = `users/${uid}`;
      try {
        await deleteDoc(doc(firestore, 'users', uid));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    updatePresence: async (uid: string, isOnline: boolean) => {
      const path = `presence/${uid}`;
      try {
        await setDoc(doc(firestore, 'presence', uid), {
          uid,
          isOnline,
          lastSeen: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    subscribePresence: (callback: (users: any[]) => void): Unsubscribe => {
      const path = 'presence';
      const q = query(collection(firestore, path), where('isOnline', '==', true));
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => d.data()));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    }
  },
  backups: {
    save: async (id: string, data: any) => {
      const path = `backups/${id}`;
      try {
        await setDoc(doc(firestore, 'backups', id), {
          ...data,
          id,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    get: async (id: string) => {
      const path = `backups/${id}`;
      try {
        const docRef = doc(firestore, 'backups', id);
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
        return null;
      }
    }
  },
  settings: {
    get: async () => {
      const path = 'settings/global';
      try {
        const docRef = doc(firestore, 'settings', 'global');
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
        return null;
      }
    },
    save: async (data: any) => {
      const path = 'settings/global';
      try {
        const docRef = doc(firestore, 'settings', 'global');
        await setDoc(docRef, data, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    subscribe: (callback: (data: any) => void): Unsubscribe => {
      const path = 'settings/global';
      const docRef = doc(firestore, 'settings', 'global');
      return onSnapshot(docRef, (snap) => {
        if (snap.exists()) callback(snap.data());
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
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
    loginWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    },
    logout: async () => {
      await signOut(auth);
    },
    resetPassword: async (email: string) => {
      return await sendPasswordResetEmail(auth, email);
    },
    onAuthStateChanged: (cb: (user: User | null) => void) => {
      return onAuthStateChanged(auth, cb);
    }
  }
};
