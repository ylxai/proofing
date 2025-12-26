import React, { useState, useEffect } from 'react';
import { Photo, ClientSubmission, Event } from '../types';
import * as api from '../services/api';

interface AdminPanelProps {
  events: Event[];
  photos: Photo[];
  submissions: ClientSubmission[];
  onCreateEvent: (name: string, code: string) => void;
  onDeleteEvent: (id: string) => void;
  onUpload: (files: FileList | File[], eventId: string) => void;
  onDeletePhoto: (id: string) => void;
  onDeleteMultiplePhotos: (ids: string[]) => void;
  onRenamePhoto: (id: string, newName: string) => void;
  onClearGallery: () => void;
  onLogout: () => void;
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  previewUrl: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  events,
  photos, 
  submissions, 
  onCreateEvent,
  onDeleteEvent,
  onUpload, 
  onDeletePhoto,
  onDeleteMultiplePhotos,
  onRenamePhoto,
  onClearGallery,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'upload' | 'submissions'>('events');
  const [newEventName, setNewEventName] = useState('');
  const [newEventCode, setNewEventCode] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<string>>(new Set());
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editName, setEditName] = useState('');

  // Set initial event if available
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
        setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (!selectedEventId) {
        alert("Pilih acara terlebih dahulu!");
        return;
      }
      
      const newFiles: UploadItem[] = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending',
        previewUrl: URL.createObjectURL(file)
      }));

      setUploadQueue(prev => [...newFiles, ...prev]);
      
      // Process files one by one (or parallel depending on preference)
      newFiles.forEach(item => processUpload(item, selectedEventId));
      
      e.target.value = '';
    }
  };

  const processUpload = async (item: UploadItem, eventId: string) => {
    setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));

    try {
        // Upload via API Service (Handles R2 + DB)
        // We pass a single file array to the handler
        // Ideally we'd have a progress callback, but basic AWS SDK PutObject doesn't give granular progress easily 
        // in simulation without XHR. We'll fake progress while awaiting the promise.
        
        const progressInterval = setInterval(() => {
            setUploadQueue(prev => prev.map(i => {
                if (i.id === item.id && i.progress < 90) {
                    return { ...i, progress: i.progress + 10 };
                }
                return i;
            }));
        }, 300);

        await onUpload([item.file], eventId);

        clearInterval(progressInterval);
        setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, progress: 100, status: 'completed' } : i));

    } catch (error) {
        console.error(error);
        setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i));
    }
  };

  const handleClearCompleted = () => {
    uploadQueue.forEach(item => {
      if (item.status === 'completed') {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventName && newEventCode) {
      onCreateEvent(newEventName, newEventCode);
      setNewEventName('');
      setNewEventCode('');
    }
  };

  const downloadList = (sub: ClientSubmission) => {
    const selectedFiles = photos
      .filter(p => sub.selectedPhotoIds.includes(p.id))
      .map(p => p.name);
    
    const eventName = events.find(e => e.id === sub.eventId)?.name || 'Unknown Event';

    const content = `Event: ${eventName}\nKlien: ${sub.clientName}\nTanggal: ${new Date(sub.submittedAt).toLocaleDateString()}\n\nCatatan:\n${sub.notes}\n\nFile Terpilih (${selectedFiles.length}):\n${selectedFiles.join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sub.clientName.replace(/\s+/g, '_')}_pilihan.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditName(photo.name);
  };

  const saveEdit = () => {
    if (editingPhoto && editName.trim()) {
      onRenamePhoto(editingPhoto.id, editName.trim());
      setEditingPhoto(null);
    }
  };

  const toggleSelectForDelete = (id: string) => {
    setSelectedDeleteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedDeleteIds);
    if (ids.length > 0) {
      onDeleteMultiplePhotos(ids);
      setSelectedDeleteIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const filteredPhotos = selectedEventId 
    ? photos.filter(p => p.eventId === selectedEventId)
    : [];

  useEffect(() => {
    return () => {
      uploadQueue.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">
            A
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin</h1>
            <p className="text-slate-400 text-sm">Dashboard Pengelolaan (Mode R2 + Supabase)</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'events' 
              ? 'text-brand-500 border-b-2 border-brand-500' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Manajemen Acara
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'upload' 
              ? 'text-brand-500 border-b-2 border-brand-500' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Galeri & Unggahan
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'submissions' 
              ? 'text-brand-500 border-b-2 border-brand-500' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Kiriman Klien <span className="ml-1 bg-slate-700 px-2 py-0.5 rounded-full text-xs text-white">{submissions.length}</span>
        </button>
      </div>

      {/* --- EVENT MANAGEMENT TAB --- */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Buat Acara Baru
              </h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Acara</label>
                  <input 
                    type="text"
                    required
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                    placeholder="Contoh: Pernikahan Andi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Kode Akses (Unik)</label>
                  <input 
                    type="text"
                    required
                    value={newEventCode}
                    onChange={(e) => setNewEventCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 outline-none font-mono uppercase"
                    placeholder="WEDDING24"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-2 rounded-lg transition-colors shadow-lg shadow-brand-500/20"
                >
                  Tambah Acara
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Daftar Acara Aktif</h3>
            {events.length === 0 ? (
              <p className="text-slate-500 italic">Belum ada acara. Buat satu di sebelah kiri.</p>
            ) : (
              events.map(event => {
                const photoCount = photos.filter(p => p.eventId === event.id).length;
                return (
                  <div key={event.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between group hover:border-slate-500 transition-colors">
                    <div>
                      <h4 className="font-bold text-white text-lg">{event.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-mono border border-slate-600">
                          Kode: {event.code}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {photoCount} Foto
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Hapus Acara"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- UPLOAD TAB --- */}
      {activeTab === 'upload' && (
        <div className="space-y-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <label className="block text-sm font-medium text-slate-300 mb-2">Pilih Acara untuk Diunggah / Dikelola:</label>
            <select 
              value={selectedEventId}
              onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setIsSelectionMode(false);
                  setSelectedDeleteIds(new Set());
              }}
              className="w-full md:w-1/2 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {events.length === 0 && <option value="">Belum ada acara</option>}
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center hover:bg-slate-800/50 transition-colors">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Unggah Foto ke R2</h3>
                <p className="text-slate-400 mb-6">Pilih file untuk diunggah ke cloud.</p>
                <label className="inline-block">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <span className="cursor-pointer bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/20">
                    Pilih File
                  </span>
                </label>
              </div>

              {uploadQueue.length > 0 && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-semibold text-white">Antrean Unggahan ({uploadQueue.length})</h3>
                    {uploadQueue.some(i => i.status === 'completed') && (
                      <button 
                        onClick={handleClearCompleted}
                        className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Bersihkan yang Selesai
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {uploadQueue.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors">
                        <div className="w-10 h-10 bg-slate-900 rounded overflow-hidden flex-shrink-0">
                          <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-sm text-white truncate pr-4">{item.file.name}</p>
                            <span className="text-xs text-slate-400 tabular-nums">{Math.round(item.progress)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-100 ease-out ${
                                item.status === 'completed' ? 'bg-green-500' : 
                                item.status === 'error' ? 'bg-red-500' : 'bg-brand-500'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="w-6 flex justify-center">
                          {item.status === 'completed' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : item.status === 'error' ? (
                             <span className="text-red-500 font-bold">!</span>
                          ) : (
                             <div className="w-4 h-4 border-2 border-slate-600 border-t-brand-500 rounded-full animate-spin"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Grid */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Galeri Foto ({filteredPhotos.length})</h3>
                    <p className="text-slate-400 text-sm">Aset Cloudflare R2</p>
                  </div>
                  
                  {filteredPhotos.length > 0 && (
                    <div className="flex items-center gap-2">
                       {!isSelectionMode ? (
                          <>
                            <button 
                              onClick={() => setIsSelectionMode(true)}
                              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Pilih Banyak
                            </button>
                          </>
                       ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-300 mr-2 font-medium">
                              {selectedDeleteIds.size} dipilih
                            </span>
                            <button 
                              onClick={handleBulkDelete}
                              disabled={selectedDeleteIds.size === 0}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                selectedDeleteIds.size > 0 
                                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Hapus
                            </button>
                            <button 
                              onClick={() => {
                                setIsSelectionMode(false);
                                setSelectedDeleteIds(new Set());
                              }}
                              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                       )}
                    </div>
                  )}
                </div>

                {filteredPhotos.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
                    <p className="text-slate-500">Belum ada foto.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredPhotos.map(photo => {
                      const isSelectedForDelete = selectedDeleteIds.has(photo.id);
                      return (
                        <div 
                          key={photo.id} 
                          onClick={() => isSelectionMode && toggleSelectForDelete(photo.id)}
                          className={`relative group bg-slate-900 rounded-lg overflow-hidden border transition-all aspect-square cursor-pointer ${
                            isSelectedForDelete 
                              ? 'border-red-500 ring-2 ring-red-500/50' 
                              : 'border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <img 
                            src={photo.url} 
                            alt={photo.name} 
                            loading="lazy"
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              isSelectionMode && isSelectedForDelete ? 'scale-105 opacity-50' : 'group-hover:scale-110'
                            }`} 
                          />
                          
                          {isSelectionMode && (
                             <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                               isSelectedForDelete 
                                ? 'bg-red-500 border-red-500 text-white scale-100' 
                                : 'border-white/50 bg-black/40 scale-90'
                             }`}>
                               {isSelectedForDelete && (
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                               )}
                             </div>
                          )}

                          {!isSelectionMode && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                              <button 
                                onClick={(e) => { e.stopPropagation(); startEdit(photo); }}
                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeletePhoto(photo.id); }}
                                className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                            <p className="text-xs text-white truncate font-mono text-center">{photo.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* --- SUBMISSIONS TAB --- */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
              Belum ada kiriman klien.
            </div>
          ) : (
            submissions.map((sub) => {
              const event = events.find(e => e.id === sub.eventId);
              return (
                <div key={sub.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{sub.clientName}</h3>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                        {event ? event.name : 'Unknown Event'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                      {new Date(sub.submittedAt).toLocaleString('id-ID')} • <span className="text-brand-400">{sub.selectedPhotoIds.length} Foto Dipilih</span>
                    </p>
                    
                    {sub.notes && (
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-700 mb-4">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Catatan</p>
                        <p className="text-slate-300 text-sm">{sub.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 justify-center border-l border-slate-700 pl-0 md:pl-6">
                    <button 
                      onClick={() => downloadList(sub)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Unduh .txt
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Ubah Nama File</h3>
            <div className="mb-4">
              <img src={editingPhoto.url} className="w-full h-32 object-cover rounded-lg mb-3 bg-black" alt="preview" />
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                placeholder="Nama file baru..."
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setEditingPhoto(null)}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                onClick={saveEdit}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;