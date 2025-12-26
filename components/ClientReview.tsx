import React, { useState } from 'react';
import { Photo } from '../types';
import { generateEmailDraft } from '../services/geminiService';

interface ClientReviewProps {
  photos: Photo[];
  selectedIds: Set<string>;
  onBack: () => void;
  onSubmit: (data: { name: string; notes: string; aiMessage?: string }) => void;
}

const ClientReview: React.FC<ClientReviewProps> = ({ photos, selectedIds, onBack, onSubmit }) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter only selected photos
  const selectedPhotos = photos.filter(p => selectedIds.has(p.id));

  const handleAiDraft = async () => {
    if (!name || !notes) {
      alert("Harap masukkan nama Anda dan beberapa catatan terlebih dahulu agar AI dapat membantu.");
      return;
    }
    setIsGenerating(true);
    const draft = await generateEmailDraft(name, selectedIds.size, notes);
    setGeneratedDraft(draft);
    setIsGenerating(false);
  };

  const handleWhatsApp = () => {
    if (!name) {
      alert("Mohon isi nama Anda terlebih dahulu.");
      return;
    }
    
    // Create WhatsApp message
    const selectedFileNames = selectedPhotos.map(p => p.name).join('\n- ');
    const message = `Halo, saya ${name}.\n\nSaya telah memilih ${selectedIds.size} foto:\n- ${selectedFileNames}\n\nCatatan:\n${notes}`;
    
    // Encode for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp (replace with actual phone number if needed, here just generic share)
    // Note: Usually you'd append ?phone=628123456789
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onSubmit({ name, notes, aiMessage: generatedDraft || undefined });
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pilihan Terkirim!</h2>
          <p className="text-slate-400 mb-8">
            Terima kasih, <strong>{name}</strong>. Fotografer telah menerima daftar foto pilihan dan catatan Anda.
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Kembali ke Galeri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      <button onClick={onBack} className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Galeri
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">Tinjau Pilihan</h1>
      <p className="text-slate-400 mb-8">Anda telah memilih {selectedIds.size} foto.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Form Column */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nama Anda</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="Budi Santoso"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300">Catatan Edit</label>
                <button 
                  type="button"
                  onClick={handleAiDraft}
                  disabled={isGenerating || !notes}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  {isGenerating ? 'Berpikir...' : '✨ Buat Draf Email AI'}
                </button>
              </div>
              <textarea 
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none h-32"
                placeholder="Contoh: Tolong buat jadi hitam putih, dan hapus objek di latar belakang DSC_004."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* AI Draft Preview */}
            {generatedDraft && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-lg p-4 relative animate-in fade-in slide-in-from-bottom-2">
                 <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Saran Email AI</h4>
                 <div className="text-sm text-indigo-100 whitespace-pre-wrap font-serif leading-relaxed">
                    {generatedDraft}
                 </div>
                 <button 
                    type="button"
                    onClick={() => setGeneratedDraft(null)}
                    className="absolute top-2 right-2 text-indigo-400 hover:text-white"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                 </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim ke Sistem'
                )}
              </button>

              <button 
                type="button"
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Kirim via WhatsApp
              </button>
            </div>
          </form>
        </div>

        {/* Preview Column */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 h-[600px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Foto Terpilih</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {selectedPhotos.length === 0 ? (
                <p className="text-slate-500 italic text-sm">Daftar foto telah dikirim.</p>
            ) : (
                selectedPhotos.map(photo => (
                <div key={photo.id} className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <img src={photo.url} alt={photo.name} className="w-16 h-16 object-cover rounded" />
                    <span className="text-slate-300 font-mono text-sm">{photo.name}</span>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientReview;