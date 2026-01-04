import React, { useState, useMemo } from 'react';
import { Photo, SortOption } from '../types';
import PhotoCard from './PhotoCard';
import Lightbox from './Lightbox';

interface ClientGalleryProps {
  photos: Photo[];
  selectedIds: Set<string>;
  onTogglePhoto: (id: string) => void;
  onReview: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onLogout: () => void;
  eventName?: string;
  eventId?: string;
}

const ClientGallery: React.FC<ClientGalleryProps> = ({
  photos,
  selectedIds,
  onTogglePhoto,
  onReview,
  onSelectAll,
  onDeselectAll,
  onLogout,
  eventName,
  eventId
}) => {
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 40;

  const sortedPhotos = useMemo(() => {
    const p = [...photos];
    switch (sortOption) {
      case 'name_asc': return p.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc': return p.sort((a, b) => b.name.localeCompare(a.name));
      case 'date_new': return p.sort((a, b) => b.timestamp - a.timestamp);
      case 'date_old': return p.sort((a, b) => a.timestamp - b.timestamp);
      default: return p;
    }
  }, [photos, sortOption]);

  // Reset page when sort changes or photos change
  useMemo(() => {
    setCurrentPage(1);
  }, [sortOption, photos.length]);

  const totalPages = Math.ceil(sortedPhotos.length / ITEMS_PER_PAGE);

  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPhotos.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedPhotos, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenLightbox = (id: string) => {
    // Find index in the FULL sorted list, not just the current page
    const index = sortedPhotos.findIndex(p => p.id === id);
    if (index !== -1) setLightboxIndex(index);
  };

  const handleNext = () => {
    setLightboxIndex(prev => (prev + 1) % sortedPhotos.length);
  };

  const handlePrev = () => {
    setLightboxIndex(prev => (prev - 1 + sortedPhotos.length) % sortedPhotos.length);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/r.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg font-semibold text-white hidden sm:block">{eventName || "Galeri Foto"}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <select
              className="bg-slate-800 text-slate-300 text-sm rounded-lg border-none focus:ring-1 focus:ring-brand-500 py-1.5 px-3 max-w-[100px] sm:max-w-none"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="name_asc">Nama (A-Z)</option>
              <option value="name_desc">Nama (Z-A)</option>
              <option value="date_new">Terbaru</option>
              <option value="date_old">Terlama</option>
            </select>

            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-2">
              <button onClick={onSelectAll} className="text-xs font-medium text-slate-400 hover:text-white px-2">
                Pilih Semua
              </button>
              <button onClick={onDeselectAll} className="text-xs font-medium text-slate-400 hover:text-white px-2">
                Hapus
              </button>
            </div>

            <div className="h-6 w-px bg-slate-700 mx-1"></div>

            {eventId && (
              <a
                href={`https://drive.google.com/drive/folders/${eventId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/20 transition-colors text-xs font-medium"
                title="Buka di Google Drive"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Drive</span>
              </a>
            )}

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors text-xs font-medium"
              title="Keluar dari Event"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Counter */}
        <div className="mb-4 text-slate-400 text-sm flex justify-between items-center">
          <span>Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, photos.length)} dari {photos.length} foto</span>
          <span className="hidden sm:inline">Halaman {currentPage} dari {totalPages}</span>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-slate-500">Galeri kosong. Silakan minta fotografer untuk mengunggah foto.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
              {paginatedPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isSelected={selectedIds.has(photo.id)}
                  onToggle={onTogglePhoto}
                  onExpand={handleOpenLightbox}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                >
                  ← Sebelumnya
                </button>

                <span className="text-slate-300 font-medium">
                  Halaman {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="max-w-xl mx-auto bg-slate-800/90 backdrop-blur-lg border border-slate-600 rounded-2xl shadow-2xl p-4 flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Dipilih</span>
            <span className="text-2xl font-bold text-white leading-none">{selectedIds.size} <span className="text-sm font-normal text-slate-400">/ {photos.length}</span></span>
          </div>
          <button
            onClick={onReview}
            disabled={selectedIds.size === 0}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${selectedIds.size > 0
              ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25 translate-y-0'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
          >
            Tinjau & Kirim
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== -1 && (
        <Lightbox
          photos={sortedPhotos}
          currentIndex={lightboxIndex}
          selectedIds={selectedIds}
          onClose={() => setLightboxIndex(-1)}
          onToggle={onTogglePhoto}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};

export default ClientGallery;