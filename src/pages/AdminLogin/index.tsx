import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase/config";
import { verifyIsAdmin } from "../../features/auth/adminAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await verifyIsAdmin(user);
        if (isAdmin) {
          navigate("/admin/dashboard");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Strict verification via Firestore roles / claims / env - NO hardcoded credentials in source code
      const isAdmin = await verifyIsAdmin(userCredential.user);
      if (!isAdmin) {
        await signOut(auth);
        setError("Unauthorized: This account is not an authorized administrator.");
        setIsLoading(false);
        return;
      }

      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error("Login Error:", err);
      
      if (err.code === 'auth/invalid-email') {
        setError(`Format email tidak valid. (${err.code})`);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(`Email atau password salah. Silakan periksa kembali akun admin Anda. (${err.code})`);
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain '${window.location.hostname}' belum didaftarkan di Firebase Console -> Authentication -> Settings -> Authorized Domains. (${err.code})`);
      } else if (err.code === 'auth/too-many-requests') {
        setError(`Terlalu banyak percobaan gagal. Silakan coba lagi beberapa saat lagi. (${err.code})`);
      } else if (err.code === 'auth/network-request-failed') {
        setError(`Gagal terhubung ke server Firebase. Periksa koneksi internet Anda. (${err.code})`);
      } else if (err.code === 'auth/user-disabled') {
        setError(`Akun ini telah dinonaktifkan. (${err.code})`);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(`Metode login Email/Password belum diaktifkan di Firebase Console. (${err.code})`);
      } else {
        setError(`Gagal login: ${err.message || err.code || 'Terjadi kesalahan'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] pb-24">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-medium mb-2">Restricted Access</h1>
          <p className="text-text-secondary">Administrative login.</p>
        </div>
        
        <div className="glass-card p-8 rounded-2xl flex flex-col gap-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <p className="text-sm text-text-secondary text-center mb-2">
            Sign in with your authorized credentials.
          </p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-widest uppercase text-text-secondary pl-1">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input px-4 py-3 rounded-lg w-full text-sm"
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-xs tracking-widest uppercase text-text-secondary pl-1">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input px-4 py-3 rounded-lg w-full text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className="ios-glass-btn ios-glass-primary w-full py-3.5 text-sm font-semibold mt-3 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              disabled={isLoading}
            >
              <span>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In →"
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
