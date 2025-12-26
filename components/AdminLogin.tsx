import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials as requested
    if (username === 'nandika' && password === 'klp123') {
      onLogin(true);
    } else {
      setError('Username atau Password salah!');
      onLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-600/20 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center text-brand-500 mx-auto mb-4 border border-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Login Super Admin</h1>
          <p className="text-slate-400 text-sm">Masuk untuk mengelola acara dan galeri.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all"
              placeholder="nandika"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-300 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Masuk Dashboard
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-700 pt-4">
          <button 
            onClick={onBack}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Kembali ke Halaman Klien
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;