import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import logoData from './logoData';
import App from './App';

export default function AuthGate(){
  const [user,setUser]=useState<User|null>(null);
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>onAuthStateChanged(auth,setUser),[]);
  if(user) return <><div className="authUser"><span>Signed in as <b>{user.email}</b></span><button onClick={()=>signOut(auth)}>Sign out</button></div><App/></>;

  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{if(mode==='login')await signInWithEmailAndPassword(auth,email,password);else await createUserWithEmailAndPassword(auth,email,password)}catch(err:any){setError(err?.code==='auth/invalid-credential'?'Incorrect email or password.':err?.code==='auth/email-already-in-use'?'An account already exists with this email.':err?.code==='auth/weak-password'?'Password must be at least 6 characters.':err?.message||'Authentication failed.')}finally{setBusy(false)}};
  const google=async()=>{setBusy(true);setError('');try{await signInWithPopup(auth,googleProvider)}catch(err:any){setError(err?.message||'Google sign-in failed.')}finally{setBusy(false)}};

  return <main className="authPage"><section className="authCard"><div className="authBrand"><img src={logoData} alt="ChinaSource Hub"/><div><strong>ChinaSource Hub</strong><small>Global China Sourcing</small></div></div><h1>{mode==='login'?'Welcome back':'Create your account'}</h1><p className="authSub">{mode==='login'?'Sign in to access ChinaSource Hub.':'Create an account to browse and unlock supplier information.'}</p><button className="googleBtn" onClick={google} disabled={busy}><span className="googleG">G</span> Continue with Google</button><div className="divider"><span>or continue with email</span></div><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete={mode==='login'?'current-password':'new-password'}/></label>{error&&<div className="authError">{error}</div>}<button className="primary authSubmit" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'}</button></form><p className="switchAuth">{mode==='login'?"Don't have an account?":"Already have an account?"} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('')}}>{mode==='login'?'Sign up':'Sign in'}</button></p><small className="authLegal">By continuing, you agree to use ChinaSource Hub responsibly.</small></section></main>;
}
