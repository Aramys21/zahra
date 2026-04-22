import { createSupabaseClient } from "../supabase/client.js";

const ADMIN_EMAILS = ["bouachar37@gmail.com"];

let supabaseClient = null;

// Initialiser le client Supabase
async function initSupabase() {
  if (!supabaseClient) {
    supabaseClient = await createSupabaseClient();
  }
  return supabaseClient;
}

// Fonction pour initialiser les éléments du formulaire
function initializeAdminLoginElements() {
  const emailEl = document.getElementById("admin-email");
  const passwordEl = document.getElementById("admin-password");
  const loginForm = document.getElementById("admin-login-form");
  const status = document.getElementById("admin-login-status");

  if (!loginForm) {
    console.error("Formulaire de connexion admin non trouvé");
    return;
  }

  // Attacher l'event listener pour le formulaire
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const client = await initSupabase();
    if (!client) {
      if (status) {
        status.textContent = "Erreur: Supabase non disponible";
        status.classList.add("text-red-600");
      }
      return;
    }
    
    const email = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
      if (status) {
        status.textContent = "Veuillez remplir tous les champs";
        status.classList.add("text-red-600");
      }
      return;
    }

    // Vérifier si l'email est autorisé
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      if (status) {
        status.textContent = "Accès refusé. Email non autorisé pour l'admin.";
        status.classList.add("text-red-600");
      }
      return;
    }

    if (status) {
      status.textContent = "Connexion en cours...";
      status.classList.remove("text-red-600");
      status.classList.add("text-sky-600");
    }

    try {
      const { error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (status) {
          status.textContent = "Email ou mot de passe incorrect";
          status.classList.remove("text-sky-600");
          status.classList.add("text-red-600");
        }
      } else {
        const {
          data: { user }
        } = await client.auth.getUser();
        
        if (user) {
          await syncUserRow(user, client);
        }
        
        if (status) {
          status.textContent = "Connexion réussie ! Redirection vers le panel admin...";
          status.classList.remove("text-red-600");
          status.classList.add("text-green-600");
        }
        
        // Rediriger vers le panel admin après 1 seconde
        setTimeout(() => {
          window.location.href = "./index.html";
        }, 1000);
      }
    } catch (err) {
      console.error("Erreur de connexion admin:", err);
      if (status) {
        status.textContent = "Erreur lors de la connexion";
        status.classList.add("text-red-600");
      }
    }
  });

  // Vérifier si l'admin est déjà connecté
  checkAdminAuthStatus();
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

async function checkAdminAuthStatus() {
  const client = await initSupabase();
  if (!client) return;
  
  const {
    data: { user }
  } = await client.auth.getUser();
  
  const status = document.getElementById("admin-login-status");
  
  if (user) {
    // Vérifier si l'utilisateur est admin
    if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      if (status) {
        status.textContent = "Vous êtes déjà connecté en tant qu'admin. Redirection...";
        status.classList.add("text-green-600");
      }
      // Rediriger vers le panel admin
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1000);
    } else {
      if (status) {
        status.textContent = "Vous êtes connecté mais pas en tant qu'admin.";
        status.classList.add("text-yellow-600");
      }
    }
  }
}

// Initialiser quand le DOM est chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdminLoginElements);
} else {
  initializeAdminLoginElements();
}
