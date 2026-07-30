import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Subject, StudyPlan, ProgressStats } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Firestore
export { onAuthStateChanged };
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Helper: Convert FirebaseUser to our App User type
export function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student User',
    email: fbUser.email || '',
    avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    provider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
    createdAt: fbUser.metadata.creationTime || new Date().toISOString()
  };
}

// Google Sign-In with popup (and clear error handling)
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const user = mapFirebaseUser(fbUser);
    
    // Save/update user profile doc in Firestore
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
    
    return user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by browser. Please allow popups or try again.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled by user.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in request was cancelled.');
    }
    throw new Error(error.message || 'Failed to sign in with Google.');
  }
}

// Email/Password Sign-In
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const user = mapFirebaseUser(result.user);
  await setDoc(doc(db, 'users', user.id), user, { merge: true });
  return user;
}

// Email/Password Sign-Up
export async function signUpWithEmail(name: string, email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && result.user) {
    await updateProfile(result.user, { displayName: name });
  }
  const user = mapFirebaseUser({ ...result.user, displayName: name || result.user.displayName });
  await setDoc(doc(db, 'users', user.id), user, { merge: true });
  return user;
}

// Sign-Out
export async function logoutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

// Firestore User Study Data Sync (Subjects, Study Plan, Progress Stats)
export async function getUserStudyData(userId: string) {
  try {
    const userDocRef = doc(db, 'user_data', userId);
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
  } catch (err) {
    console.error('Error fetching user study data:', err);
  }
  return null;
}

export async function saveUserStudyData(userId: string, data: { subjects?: Subject[]; studyPlan?: StudyPlan; progress?: ProgressStats }) {
  if (!userId) return;
  try {
    const userDocRef = doc(db, 'user_data', userId);
    await setDoc(userDocRef, { userId, ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error saving user study data:', err);
  }
}
