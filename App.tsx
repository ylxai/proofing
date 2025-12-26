import React, { useState, useCallback } from 'react';
import { Photo, AppView, Event } from './types';
import ClientGallery from './components/ClientGallery';
import ClientLogin from './components/ClientLogin';
import * as api from './services/api';

import { CONFIG } from './config';

// Simple Review Component for Serverless Mode
const SimpleReview = ({ photos, selectedIds, onBack }: any) => {
  const selectedPhotos = photos.filter((p: Photo) => selectedIds.has(p.id));
  
  const handleCopy = () => {
    const text = selectedPhotos.map((p: Photo) => p.name).join('\n');
    navigator.clipboard.writeText(text);
    alert("Daftar file berhasil disalin! Silakan paste ke WhatsApp fotografer.");
  };

  const handleWhatsApp = () => {
     const text = selectedPhotos.map((p: Photo) => p.name).join('\n');
     const msg = encodeURIComponent(`Halo, ini daftar foto pilihan saya (${selectedPhotos.length} foto):\n\n${text}`);
     window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Review Pilihan ({selectedPhotos.length})</h2>
        <button onClick={onBack} className="text-gray-400 hover:text-white">✕ Tutup</button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {selectedPhotos.map((p: Photo) => (
            <div key={p.id} className="relative aspect-square group">
                <img src={p.url} className="object-cover w-full h-full rounded-lg shadow-lg" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate rounded-b-lg">
                    {p.name}
                </div>
            </div>
        ))}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700 flex flex-col sm:flex-row justify-center gap-4 z-20">
        <button onClick={onBack} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">
            Kembali
        </button>
        <button onClick={handleCopy} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold shadow-lg transition-colors flex items-center justify-center gap-2">
            <span>📋</span> Salin Daftar
        </button>
        <button onClick={handleWhatsApp} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold shadow-lg transition-colors flex items-center justify-center gap-2">
            <span>💬</span> Kirim WhatsApp
        </button>
      </div>
      <div className="h-20"></div> {/* Spacer for fixed footer */}
    </div>
  );
};

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<AppView>(AppView.CLIENT_LOGIN);
  
  // Data State
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Session State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loginError, setLoginError] = useState<string>('');

  // --- Handlers ---

  const handleLogin = async (code: string) => {
    // Code here is treated as Folder ID
    if (!code) return;
    
    setIsLoading(true);
    setLoginError('');
    
    try {
        // 1. Get Event Details (Folder Name)
        const event = await api.getEventDetails(code);
        setCurrentEvent(event);

        // 2. Get Photos
        const photos = await api.getPhotos(code);
        setPhotos(photos);
        
        setView(AppView.CLIENT_GALLERY);
    } catch (e: any) {
        console.error(e);
        setLoginError("Folder ID tidak ditemukan atau akses ditolak. Pastikan folder 'Anyone with the link'.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
      if (confirm('Keluar dari galeri?')) {
          setView(AppView.CLIENT_LOGIN);
          setPhotos([]);
          setCurrentEvent(null);
          setSelectedIds(new Set());
      }
  };

  const handleTogglePhoto = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = () => {
      setSelectedIds(new Set(photos.map(p => p.id)));
  };
  
  const handleDeselectAll = () => setSelectedIds(new Set());

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {isLoading && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <div className="text-xl font-medium">Memuat Galeri...</div>
          </div>
      )}

      {view === AppView.CLIENT_LOGIN ? (
        <ClientLogin 
          onLogin={handleLogin}
          loginError={loginError}
          // Hide Admin button in this mode
          onAdminClick={() => {}} 
        />
      ) : view === AppView.CLIENT_GALLERY ? (
        <ClientGallery 
          photos={photos}
          selectedIds={selectedIds}
          onTogglePhoto={handleTogglePhoto}
          onReview={() => setView(AppView.CLIENT_REVIEW)}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onLogout={handleLogout}
          eventName={currentEvent?.name}
          eventId={currentEvent?.id}
        />
      ) : (
        <SimpleReview 
          photos={photos} 
          selectedIds={selectedIds} 
          onBack={() => setView(AppView.CLIENT_GALLERY)} 
        />
      )}
    </div>
  );
};

export default App;