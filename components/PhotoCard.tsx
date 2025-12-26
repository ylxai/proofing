import React, { memo } from 'react';
import { CONFIG } from '../config';
import { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onExpand: (id: string) => void;
}



const PhotoCard: React.FC<PhotoCardProps> = ({ photo, isSelected, onToggle, onExpand }) => {
  return (
    <div 
      className={`relative group aspect-[2/3] md:aspect-square overflow-hidden rounded-lg cursor-pointer transition-all duration-200 border-2 ${
        isSelected 
          ? 'border-brand-500 ring-2 ring-brand-500/50' 
          : 'border-transparent hover:border-white/30'
      }`}
    >
      {/* Click handler for selection */}
      <div className="absolute inset-0 z-10" onClick={() => onToggle(photo.id)} />

      {/* Selection Overlay - Always visible if selected, otherwise on hover */}
      <div className={`absolute inset-0 z-0 transition-colors duration-200 pointer-events-none ${
        isSelected ? 'bg-brand-900/40' : 'bg-black/0 group-hover:bg-black/10'
      }`} />

      {/* Checkmark Indicator */}
      <div className={`absolute top-2 right-2 z-20 flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-200 pointer-events-none ${
        isSelected 
          ? 'bg-brand-500 border-brand-500 text-white scale-100' 
          : 'bg-black/40 border-white/60 text-transparent scale-90 opacity-0 group-hover:opacity-100'
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Expand/Zoom Button */}
      {/* Expand/Zoom Button - Always visible now for better discoverability */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onExpand(photo.id);
        }}
        className="absolute bottom-2 right-2 z-30 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
        title="Lihat Ukuran Penuh"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>

      {/* Image */}
      <img
        src={photo.url}
        alt={photo.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
      />

      {/* Watermark Overlay (Repeated Pattern) */}
      {/* Watermark Overlay */}
      {CONFIG.WATERMARK.ENABLED && CONFIG.WATERMARK.SHOW_IN_GRID && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0" style={{ opacity: CONFIG.WATERMARK.OPACITY_GRID }}>
           <span 
             className="text-white font-bold border-2 border-white p-1"
             style={{ 
               transform: `rotate(${CONFIG.WATERMARK.ROTATION}deg)`,
               fontSize: CONFIG.WATERMARK.FONT_SIZE_GRID
             }}
           >
             {CONFIG.WATERMARK.TEXT}
           </span>
        </div>
      )}

      {/* Filename Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-10 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
        <p className="text-xs text-white truncate font-mono">{photo.name}</p>
      </div>
    </div>
  );
};

export default memo(PhotoCard);