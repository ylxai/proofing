import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

// Initialize the Supabase client
// We use the URL and Anon Key because the JS SDK interacts with the PostgREST API.
// We strictly define auth storage and fetch behavior to avoid Node.js fallbacks.
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Use local storage for session persistence
  },
  global: {
    // Force usage of the browser's native fetch
    fetch: (input, init) => fetch(input, init),
  },
});

/* 
  === REQUIRED DATABASE SCHEMA ===
  Run this SQL in your Supabase SQL Editor to make the app work:

  -- 1. Create Events Table
  create table events (
    id text primary key,
    name text not null,
    code text not null unique,
    created_at bigint not null
  );

  -- 2. Create Photos Table
  create table photos (
    id text primary key,
    event_id text references events(id) on delete cascade,
    url text not null,
    name text not null,
    timestamp bigint not null
  );

  -- 3. Create Submissions Table
  create table submissions (
    id text primary key,
    event_id text references events(id) on delete cascade,
    client_name text not null,
    selected_photo_ids text[] not null,
    notes text,
    ai_generated_message text,
    submitted_at bigint not null
  );

  -- 4. Enable Row Level Security (Optional for demo, recommended for prod)
  alter table events enable row level security;
  alter table photos enable row level security;
  alter table submissions enable row level security;

  -- 5. Open Access Policies (For demo simplicity - allow anyone to read/write)
  create policy "Public Access Events" on events for all using (true);
  create policy "Public Access Photos" on photos for all using (true);
  create policy "Public Access Submissions" on submissions for all using (true);
*/