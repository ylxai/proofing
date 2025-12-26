import React, { useEffect, useCallback } from 'react';
import { CONFIG } from '../config';
import { Photo } from '../types';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  selectedIds: Set<string>;
  onClose: () => void;
  onToggle: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}


const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentIndex,
  selectedIds,
  onClose,
  onToggle,
  onNext,
  onPrev
}) => {
  const photo = photos[currentIndex];
  const isSelected = selectedIds.has(photo.id);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(photo.id);
    }
  }, [onClose, onNext, onPrev, onToggle, photo.id]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Lock scroll
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto'; // Unlock scroll
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center">
      
      {/* Top Toolbar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="text-white/80 font-mono text-sm">
          {currentIndex + 1} / {photos.length} • {photo.name}
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
        <img 
          src={photo.url} 
          alt={photo.name} 
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain shadow-2xl"
        />
        
        {/* Watermark Overlay (Large) */}
        {/* Watermark Overlay (Large) */}
        {CONFIG.WATERMARK.ENABLED && CONFIG.WATERMARK.SHOW_IN_LIGHTBOX && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" style={{ opacity: CONFIG.WATERMARK.OPACITY_LIGHTBOX }}>
            <div 
              className="text-white/50 font-black whitespace-nowrap tracking-widest border-4 border-white/50 p-4"
              style={{ 
                transform: `rotate(${CONFIG.WATERMARK.ROTATION}deg)`,
                fontSize: CONFIG.WATERMARK.FONT_SIZE_LIGHTBOX
              }}
            >
               {CONFIG.WATERMARK.TEXT}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all hover:scale-110"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all hover:scale-110"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <button
          onClick={() => onToggle(photo.id)}
          className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl ${
            isSelected 
              ? 'bg-brand-600 text-white shadow-brand-500/30 ring-2 ring-brand-400' 
              : 'bg-white text-slate-900 hover:bg-slate-200'
          }`}
        >
          {isSelected ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Terpilih
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Pilih Foto Ini
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Lightbox;