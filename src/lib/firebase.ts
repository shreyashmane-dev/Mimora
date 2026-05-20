import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  deleteDoc,
  orderBy
} from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if firebase configuration is provided
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
);

let app;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

// User representation interface
export interface MemoraUser {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  preferredLanguage?: 'en' | 'hi' | 'mr';
}

// Project database schema
export interface MemoraProject {
  id: string;
  ownerId: string;
  recipientName: string;
  nickname: string;
  age: number;
  relationship: string;
  templateId: 'midnight_luxury' | 'memory_lane' | 'neon_party' | 'minimal_love' | 'golden_glimmer' | 'retro_pop' | 'cyber_punk' | 'classic' | 'sweet_sakura' | 'midnight_forest' | 'galactic_odyssey' | 'sunset_boulevard' | 'royal_velvet' | 'ocean_breeze' | 'disco_fever' | 'chalkboard_memories' | 'comic_pop' | 'dreamy_clouds' | 'aurora_borealis' | 'rose_gold_glam' | 'vintage_rose' | 'midnight_blue' | 'vibrant_rainbow' | 'marble_luxury' | 'emerald_aurum' | 'velvet_wine' | 'cyber_sunset';
  photos: Array<{ url: string; caption: string }>;
  customMessage: string;
  aiWish: {
    intro: string;
    wishes: string;
    quote: string;
  };
  captions: string[];
  music: 'emotional_piano' | 'chill_lofi' | 'party_beats' | 'cinematic_ambient' | 'golden_hour' | 'romantic_acoustic' | 'epic_cinematic' | 'chillwave';
  slug: string;
  published: boolean;
  createdAt: string;
  creatorPhone?: string;
  customCss?: string;
  unlockAt?: string;
  timezone?: string;
  language?: 'en' | 'hi' | 'mr';
}

// --- MOCK STORAGE FALLBACK SYSTEM ---
const MOCK_USERS_KEY = "memora_mock_users";
const MOCK_PROJECTS_KEY = "memora_mock_projects";
const MOCK_CURRENT_USER_KEY = "memora_mock_current_user";

// Helper helper functions
const getMockUsers = (): MemoraUser[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MOCK_USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMockUsers = (users: MemoraUser[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const getMockProjects = (): MemoraProject[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MOCK_PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMockProjects = (projects: MemoraProject[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(projects));
};

const getMockCurrentUser = (): MemoraUser | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(MOCK_CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

const saveMockCurrentUser = (user: MemoraUser | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
  }
};

// --- CLIENT AUTH EXPORTS ---

export const getAuthStatus = (callback: (user: MemoraUser | null) => void) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch or create user record in firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        let memoraUser: MemoraUser;
        
        if (userSnap.exists()) {
          memoraUser = userSnap.data() as MemoraUser;
        } else {
          memoraUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || "",
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, memoraUser);
        }
        callback(memoraUser);
      } else {
        callback(null);
      }
    });
  } else {
    // Mock Auth state listener emulation
    const checkAuth = () => {
      const user = getMockCurrentUser();
      callback(user);
    };
    // Call immediately
    checkAuth();
    // Watch for storage changes (simplistic listener)
    if (typeof window !== "undefined") {
      window.addEventListener("storage", checkAuth);
      // Custom event for same-window updates
      window.addEventListener("mock-auth-changed", checkAuth);
      return () => {
        window.removeEventListener("storage", checkAuth);
        window.removeEventListener("mock-auth-changed", checkAuth);
      };
    }
    return () => {};
  }
};

export const signInWithGoogle = async (): Promise<MemoraUser> => {
  if (isFirebaseConfigured && auth) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    let memoraUser: MemoraUser;

    if (userSnap.exists()) {
      memoraUser = userSnap.data() as MemoraUser;
    } else {
      memoraUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email || "",
        avatar: firebaseUser.photoURL || "",
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, memoraUser);
    }
    return memoraUser;
  } else {
    // Mock Google sign in
    const mockUser: MemoraUser = {
      uid: "mock-google-uid-123",
      name: "Alex Mercer",
      email: "alex@memora.io",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex",
      createdAt: new Date().toISOString(),
    };
    
    const users = getMockUsers();
    if (!users.some(u => u.uid === mockUser.uid)) {
      users.push(mockUser);
      saveMockUsers(users);
    }
    saveMockCurrentUser(mockUser);
    window.dispatchEvent(new Event("mock-auth-changed"));
    return mockUser;
  }
};

export const emailSignUp = async (name: string, email: string, password: string): Promise<MemoraUser> => {
  if (isFirebaseConfigured && auth) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;
    const memoraUser: MemoraUser = {
      uid: firebaseUser.uid,
      name: name,
      email: email,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", firebaseUser.uid), memoraUser);
    return memoraUser;
  } else {
    // Mock Signup
    const users = getMockUsers();
    if (users.some(u => u.email === email)) {
      throw new Error("User with this email already exists");
    }
    const newUser: MemoraUser = {
      uid: `mock-uid-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      email: email,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveMockUsers(users);
    saveMockCurrentUser(newUser);
    window.dispatchEvent(new Event("mock-auth-changed"));
    return newUser;
  }
};

export const emailLogIn = async (email: string, password: string): Promise<MemoraUser> => {
  if (isFirebaseConfigured && auth) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      return userDoc.data() as MemoraUser;
    }
    return {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || email.split("@")[0],
      email: email,
      createdAt: new Date().toISOString(),
    };
  } else {
    // Mock Login
    const users = getMockUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      // Create a dummy user on the fly if it matches dummy credentials for testing
      const defaultUser: MemoraUser = {
        uid: "mock-default-uid",
        name: "Mock Designer",
        email: email,
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(email)}`,
        createdAt: new Date().toISOString(),
      };
      users.push(defaultUser);
      saveMockUsers(users);
      saveMockCurrentUser(defaultUser);
      window.dispatchEvent(new Event("mock-auth-changed"));
      return defaultUser;
    }
    saveMockCurrentUser(user);
    window.dispatchEvent(new Event("mock-auth-changed"));
    return user;
  }
};

export const logOut = async (): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  } else {
    saveMockCurrentUser(null);
    window.dispatchEvent(new Event("mock-auth-changed"));
  }
};

// --- FIRESTORE PROJECT EXPORTS ---

export const saveProject = async (project: Omit<MemoraProject, 'createdAt'> & { createdAt?: string }): Promise<void> => {
  const timestamp = project.createdAt || new Date().toISOString();
  const projectData: MemoraProject = {
    ...project,
    createdAt: timestamp
  } as MemoraProject;

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, "projects", projectData.id), projectData);
  } else {
    const projects = getMockProjects();
    const idx = projects.findIndex(p => p.id === projectData.id);
    if (idx >= 0) {
      projects[idx] = projectData;
    } else {
      projects.push(projectData);
    }
    saveMockProjects(projects);
  }
};

export const getProject = async (id: string): Promise<MemoraProject | null> => {
  if (isFirebaseConfigured && db) {
    const snap = await getDoc(doc(db, "projects", id));
    return snap.exists() ? (snap.data() as MemoraProject) : null;
  } else {
    const projects = getMockProjects();
    return projects.find(p => p.id === id) || null;
  }
};

export const getProjectBySlug = async (slug: string): Promise<MemoraProject | null> => {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "projects"), where("slug", "==", slug), where("published", "==", true));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as MemoraProject;
    }
    return null;
  } else {
    const projects = getMockProjects();
    // Allow slug match for both published=true or just return it for testing ease
    return projects.find(p => p.slug === slug) || null;
  }
};

export const getProjectsByOwner = async (ownerId: string): Promise<MemoraProject[]> => {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, "projects"), 
      where("ownerId", "==", ownerId)
    );
    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(doc => doc.data() as MemoraProject);
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    const projects = getMockProjects();
    return projects
      .filter(p => p.ownerId === ownerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, "projects", id));
  } else {
    const projects = getMockProjects();
    const filtered = projects.filter(p => p.id !== id);
    saveMockProjects(filtered);
  }
};

export const updateMemoraUser = async (userId: string, data: Partial<MemoraUser>): Promise<void> => {
  if (isFirebaseConfigured && db) {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, data, { merge: true });
  } else {
    // Mock Auth state update
    const current = getMockCurrentUser();
    if (current && current.uid === userId) {
      const updated = { ...current, ...data };
      saveMockCurrentUser(updated);
      
      const users = getMockUsers();
      const idx = users.findIndex(u => u.uid === userId);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        saveMockUsers(users);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mock-auth-changed"));
      }
    }
  }
};

export const getAllProjectsForCleanup = async (): Promise<MemoraProject[]> => {
  if (isFirebaseConfigured && db) {
    const querySnapshot = await getDocs(collection(db, "projects"));
    return querySnapshot.docs.map(doc => doc.data() as MemoraProject);
  } else {
    if (typeof window !== "undefined") {
      return getMockProjects();
    }
    return [];
  }
};
