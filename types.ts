export interface Event {
  id: string;
  name: string; // e.g., "Pernikahan Budi & Ani"
  code: string; // e.g., "WEDDING24"
  createdAt: number;
}

export interface Photo {
  id: string;
  url: string;
  name: string;
  timestamp: number;
  eventId?: string; // Links photo to a specific event
}

export interface ClientSubmission {
  id: string;
  clientName: string;
  selectedPhotoIds: string[];
  notes: string;
  aiGeneratedMessage?: string;
  submittedAt: number;
  eventId?: string; // Track which event this submission is for
}

export enum AppView {
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  CLIENT_LOGIN = 'CLIENT_LOGIN',
  CLIENT_GALLERY = 'CLIENT_GALLERY',
  CLIENT_REVIEW = 'CLIENT_REVIEW'
}

export type SortOption = 'name_asc' | 'name_desc' | 'date_new' | 'date_old';