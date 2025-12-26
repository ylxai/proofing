import React, { useState } from 'react';

interface ClientLoginProps {
  onLogin: (code: string) => void;
  loginError?: string;
  onAdminClick: () => void;
}

const ClientLogin: React.FC<ClientLoginProps> = ({ onLogin, loginError, onAdminClick }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onLogin(code.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4 relative">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img src="/r.png" alt="Hafiportrait Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Selamat Datang di Hafiportrait</h1>
          <p className="text-slate-400">Silakan masukkan Kode Acara Anda untuk mengakses galeri.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="event-code" className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
              Kode Acara
            </label>
            <input
              id="event-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-4 text-center text-xl tracking-widest text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all uppercase"
              placeholder="CONTOH: WEDDING24"
              autoComplete="off"
            />
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-200">{loginError}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Buka Galeri
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-slate-500">
            Belum punya kode? Hubungi fotografer Anda.
          </p>
        </div>
      </div>

      {/* Admin Link */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <button 
          onClick={onAdminClick}
          className="text-xs text-slate-700 hover:text-slate-500 transition-colors uppercase tracking-widest font-semibold"
        >
          Super Admin Login
        </button>
      </div>
    </div>
  );
};

export default ClientLogin;