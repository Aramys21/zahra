// Client Supabase pour le site Zahra Diffusion
// Configuration pour le déploiement en production

// Remplacez ces valeurs par vos propres clés Supabase
// Vous pouvez les obtenir depuis https://supabase.com/dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || "YOUR_SUPABASE_SERVICE_KEY";

// Charger Supabase depuis le CDN
export async function createSupabaseClient() {
  if (window.supabase) {
    return window.supabase.createClient(supabaseUrl, supabaseKey);
  }
  
  // Si Supabase n'est pas chargé, le charger dynamiquement
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.defer = true;
  document.head.appendChild(script);
  
  return new Promise((resolve) => {
    script.onload = () => {
      if (window.supabase) {
        resolve(window.supabase.createClient(supabaseUrl, supabaseKey));
      }
    };
  });
}

export function isSupabaseAvailable() {
  return !!window.supabase;
}

export const supabaseUrlConfig = supabaseUrl;
export const supabaseKeyConfig = supabaseKey;
