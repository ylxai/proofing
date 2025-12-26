import { Photo, Event, ClientSubmission } from "../types";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = "https://www.googleapis.com/drive/v3";

// Helper to check API Key
const checkApiKey = () => {
  if (!API_KEY) throw new Error("VITE_GOOGLE_API_KEY is not set in .env");
};

// --- EVENTS (Mapped to Folders) ---

export const getEvents = async (): Promise<Event[]> => {
  // In this serverless version, we don't list events globally.
  // The user enters a specific Folder ID to access the gallery.
  return [];
};

export const getEventDetails = async (folderId: string): Promise<Event> => {
  checkApiKey();
  const url = `${BASE_URL}/files/${folderId}?fields=id,name,createdTime&key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) throw new Error("Folder not found");
    throw new Error("Failed to fetch folder details");
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    code: data.id, // Use ID as code
    createdAt: new Date(data.createdTime).getTime(),
  };
};

// --- PHOTOS ---

export const getPhotos = async (folderId: string): Promise<Photo[]> => {
  checkApiKey();
  // Query: Inside folder, not trashed, is image
  const q = `'${folderId}' in parents and trashed=false and mimeType contains 'image/'`;
  const fields = "files(id, name, createdTime, thumbnailLink)";
  const url = `${BASE_URL}/files?q=${encodeURIComponent(
    q
  )}&fields=${encodeURIComponent(fields)}&pageSize=1000&key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch photos from Drive");

  const data = await response.json();

  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    // Use the thumbnailLink provided by Drive API, but request a larger size
    // Default is usually small (s220), we replace it with s1920 for high res
    url: f.thumbnailLink ? f.thumbnailLink.replace('=s220', '=s1920') : `https://drive.google.com/thumbnail?id=${f.id}&sz=w1920`,
    timestamp: new Date(f.createdTime).getTime(),
    eventId: folderId,
  }));
};

// --- SUBMISSIONS (Client-side only) ---

export const createSubmission = async (submission: ClientSubmission) => {
  // In serverless mode, we can't save to DB.
  // We just return success, and the UI will handle "Copy to Clipboard"
  // or "Send via WhatsApp".
  return Promise.resolve();
};

// --- UNUSED / DEPRECATED ---

export const createEvent = async () => {
  throw new Error("Not supported in Serverless mode");
};
export const deleteEvent = async () => {
  throw new Error("Not supported in Serverless mode");
};
export const uploadPhotos = async () => {
  throw new Error("Not supported in Serverless mode");
};
export const deletePhoto = async () => {
  throw new Error("Not supported in Serverless mode");
};
export const deleteMultiplePhotos = async () => {
  throw new Error("Not supported in Serverless mode");
};
export const renamePhoto = async () => {
  throw new Error("Not supported in Serverless mode");
};
export const getSubmissions = async () => [];
