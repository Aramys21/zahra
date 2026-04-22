import { createSupabaseClient, isSupabaseAvailable } from "../supabase/client.js";
import { mergeCartAfterLogin } from "./cart.js";
import { t, updateLanguageUI } from "./translations.js";

let supabaseClient = null;

// Initialiser le client Supabase
async function initSupabase() {
  if (!supabaseClient) {
    supabaseClient = await createSupabaseClient();
  }
  return supabaseClient;
}

// Fonction pour initialiser les éléments du formulaire
function initializeLoginElements() {
  const emailEl = document.getElementById("login-email");
  const passwordEl = document.getElementById("login-password");
  const loginForm = document.getElementById("login-form");
  const status = document.getElementById("login-status");

  if (!loginForm) {
    console.error("Formulaire de connexion non trouvé");
    return;
  }

  // Attacher l'event listener pour le formulaire
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const client = await initSupabase();
    if (!client) {
      if (status) status.textContent = "Supabase n'est pas disponible";
      return;
    }
    
    const email = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
      if (status) status.textContent = "Veuillez remplir tous les champs";
      return;
    }

    if (status) status.textContent = "Connexion en cours...";

    try {
      const { error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (status) {
          status.textContent = error.message;
          status.classList.add("text-red-600");
        }
      } else {
        const {
          data: { user }
        } = await client.auth.getUser();
        
        if (user) {
          await syncUserRow(user, client);
          await mergeCartAfterLogin();
        }
        
        if (status) {
          status.textContent = "Connexion réussie ! Redirection...";
          status.classList.remove("text-red-600");
          status.classList.add("text-green-600");
        }
        
        // Rediriger vers la page d'accueil après 1 seconde
        setTimeout(() => {
          window.location.href = "./home.html";
        }, 1000);
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      if (status) {
        status.textContent = "Erreur lors de la connexion";
        status.classList.add("text-red-600");
      }
    }
  });

  // Vérifier si l'utilisateur est déjà connecté
  checkAuthStatus(client);
}

async function syncUserRow(user, client) {
  if (!client || !user) return;
  const meta = user.user_metadata || {};
  const first_name = meta.first_name?.trim() || null;
  const last_name = meta.last_name?.trim() || null;
  const phone = meta.phone?.trim() || null;
  const address = meta.address?.trim() || null;
  const wilaya = meta.wilaya?.trim() || null;
  const full_name = [first_name, last_name].filter(Boolean).join(" ").trim() || null;
  const { error } = await client.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      first_name,
      last_name,
      phone,
      address,
      wilaya,
      full_name
    },
    { onConflict: "id" }
  );
  if (error) console.warn("Sync profil utilisateur:", error.message);
}

async function checkAuthStatus() {
  const client = await initSupabase();
  if (!client) return;
  
  const {
    data: { user }
  } = await client.auth.getUser();
  
  const status = document.getElementById("login-status");
  
  if (user) {
    if (status) {
      status.textContent = "Vous êtes déjà connecté. Redirection...";
      status.classList.add("text-green-600");
    }
    // Rediriger vers la page d'accueil
    setTimeout(() => {
      window.location.href = "./home.html";
    }, 1000);
  }
}

// Initialiser quand le DOM est chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLoginElements);
} else {
  initializeLoginElements();
}

updateLanguageUI();
