# Hafiportrait | Photo Proofing

Web application for clients to view and select photos directly from Google Drive. Designed for **Hafiportrait** workflow.

## Features 🌟

- **Google Drive Integration**: Connects directly to Google Drive folders using an API Key. No backend database required.
- **Photo Selection**: Clients can select their favorite photos.
- **WhatsApp Integration**: Send the list of selected photos directly to the photographer via WhatsApp.
- **Watermark Protection**: Configurable watermark (Text, Rotation, Size, Opacity) to protect your work.
- **Responsive Design**: Optimized for both Desktop and Mobile devices.
- **Direct Drive Access**: "Open in Drive" button for quick access to high-res files (optional).

## Configuration ⚙️

### 1. Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### 2. App Configuration (`config.ts`)

You can customize the application settings in `src/config.ts`:

- **Watermark**: Enable/Disable, Text, Rotation, Size, Opacity.
- **Contact**: Update `WHATSAPP_NUMBER` to receive selections.

```typescript
export const CONFIG = {
  // ...
  WATERMARK: {
    ENABLED: true,
    TEXT: "Hafiportrait",
    // ...
  },
  WHATSAPP_NUMBER: "62895700503193",
};
```

## Development 💻

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Locally**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Deployment 🚀

This app is ready for deployment on **Vercel** or **Netlify**.

1. Push to GitHub.
2. Import project in Vercel.
3. Add `VITE_GOOGLE_API_KEY` in Vercel Environment Variables.
4. Deploy!
