// Client Supabase pour le site Zahra Diffusion
// Configuration pour le déploiement en production

const supabaseUrl = "https://tnnupnnlmkktadmqhzey.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubnVwbm5sbWtrdGFkbXFoemV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjAzODYsImV4cCI6MjA5MTQ5NjM4Nn0.NYfitpneLZOLZ4hFqU-2caVeokP1MDhU1ACFTPw6cUU";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubnVwbm5sbWtrdGFkbXFoemV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkyMDM4NiwiZXhwIjoyMDkxNDk2Mzg2fQ.dixR9rMHDA3HqT_OTj7yzokLzqnPYH6UWub5wbgtyWU";

// Charger Supabase depuis le CDN
export async function createSupabaseClient() {
  if (window.supabase) {
    return window.supabase.createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'zahra-auth-token'
      }
    });
  }
  
  // Si Supabase n'est pas chargé, le charger dynamiquement
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.defer = true;
  document.head.appendChild(script);
  
  return new Promise((resolve) => {
    script.onload = () => {
      if (window.supabase) {
        resolve(window.supabase.createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
            storageKey: 'zahra-auth-token'
          }
        }));
      }
    };
  });
}

export function isSupabaseAvailable() {
  return !!window.supabase;
}

export const supabaseUrlConfig = supabaseUrl;
export const supabaseKeyConfig = supabaseKey;
