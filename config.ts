export const CONFIG = {
  // GOOGLE DRIVE CONFIGURATION
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',

  // WATERMARK CONFIGURATION
  WATERMARK: {
    ENABLED: true,
    TEXT: "Hafiportrait",
    SHOW_IN_GRID: true,      // Show on small thumbnails
    SHOW_IN_LIGHTBOX: true,  // Show on full screen view
    OPACITY_GRID: 0.2,
    OPACITY_LIGHTBOX: 0.3,
    
    // STYLE CONFIGURATION
    ROTATION: -45,           // Rotation in degrees (e.g., -45, 0, 45, 90)
    FONT_SIZE_GRID: "1.125rem",    // CSS font-size for grid (e.g., "1rem", "18px", "1.5rem")
    FONT_SIZE_LIGHTBOX: "4rem",    // CSS font-size for lightbox (e.g., "4rem", "80px")
  },

  // CONTACT CONFIGURATION
  WHATSAPP_NUMBER: "62895700503193", // Format: 628xxx (without + or 0)
};