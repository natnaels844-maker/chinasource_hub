import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDQ_72DkI_Jx4tUyerTc9RV-acSnc_FuyE',
  authDomain: 'gen-lang-client-0495910863.firebaseapp.com',
  projectId: 'gen-lang-client-0495910863',
  storageBucket: 'gen-lang-client-0495910863.firebasestorage.app',
  messagingSenderId: '242812226177',
  appId: '1:242812226177:web:12da1db1e243159fbc1b80',
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
