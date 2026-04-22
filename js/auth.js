import { createSupabaseClient, isSupabaseAvailable } from "../supabase/client.js";
import { mergeCartAfterLogin } from "./cart.js";
import { DZ_WILAYAS } from "./wilayas-dz.js";
import { t, updateLanguageUI } from "./translations.js";

let supabaseClient = null;

// Initialiser le client Supabase
async function initSupabase() {
  if (!supabaseClient) {
    supabaseClient = await createSupabaseClient();
  }
  return supabaseClient;
}

// Vérifier si Supabase est disponible
console.log("Supabase available:", isSupabaseAvailable());

// Fonction pour initialiser les éléments du formulaire
function initializeAuthElements() {
  const emailEl = document.getElementById("auth-email");
  const passwordEl = document.getElementById("auth-password");
  const firstNameEl = document.getElementById("auth-firstname");
  const lastNameEl = document.getElementById("auth-lastname");
  const phoneEl = document.getElementById("auth-phone");
  const addressEl = document.getElementById("auth-address");
  const wilayaEl = document.getElementById("auth-wilaya");

  // Sélectionner les boutons et autres éléments
  signUpBtn = document.getElementById("sign-up");
  signInBtn = document.getElementById("sign-in");
  signOutBtn = document.getElementById("sign-out");
  status = document.getElementById("auth-status");
  tabLogin = document.getElementById("tab-login");
  tabRegister = document.getElementById("tab-register");
  registerFields = document.getElementById("register-fields");
  actionsLogin = document.getElementById("actions-login");
  actionsRegister = document.getElementById("actions-register");

  // Charger les wilayas
  if (wilayaEl) {
    console.log("Chargement des wilayas...");
    // Vider d'abord le select
    wilayaEl.innerHTML = '<option value="">Sélectionnez une wilaya</option>';
    
    for (const line of DZ_WILAYAS) {
      const opt = document.createElement("option");
      opt.value = line;
      opt.textContent = line;
      wilayaEl.appendChild(opt);
    }
    console.log("Wilayas chargées:", DZ_WILAYAS.length, "wilayas");
  } else {
    console.error("Element auth-wilaya non trouvé");
  }
  
  // Stocker les éléments globalement
  authElements = { emailEl, passwordEl, firstNameEl, lastNameEl, phoneEl, addressEl, wilayaEl };
  
  // Attacher les event listeners
  if (tabLogin) tabLogin.addEventListener("click", () => setAuthMode("login"));
  if (tabRegister) tabRegister.addEventListener("click", () => setAuthMode("register"));
  
  if (signUpBtn) {
    signUpBtn.addEventListener("click", async () => {
      const client = await initSupabase();
      if (!client) {
        if (status) status.textContent = "Supabase n'est pas disponible";
        return;
      }
      
      const last_name = lastNameEl?.value.trim() || "";
      const first_name = firstNameEl?.value.trim() || "";
      const phone = phoneEl?.value.trim() || "";
      const address = addressEl?.value.trim() || "";
      const wilaya = wilayaEl?.value.trim() || "";
      const email = emailEl.value.trim();
      const password = passwordEl.value;

      if (!last_name || !first_name || !phone || !wilaya || !address) {
        if (status) status.textContent = t("renseignez_champs");
        return;
      }
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            last_name,
            phone,
            wilaya,
            address,
            full_name: `${first_name} ${last_name}`.trim()
          }
        }
      });
      if (error) {
        if (status) status.textContent = error.message;
        return;
      }
      if (data.user) await syncUserRow(data.user, client);
      if (status) status.textContent = data.session
        ? t("compte_cree")
        : t("compte_cree_verif");
      await refreshStatus();
    });
  }

  if (signInBtn) {
    signInBtn.addEventListener("click", async () => {
      const client = await initSupabase();
      if (!client) {
        if (status) status.textContent = "Supabase n'est pas disponible";
        return;
      }
      
      const { error } = await client.auth.signInWithPassword({
        email: emailEl.value.trim(),
        password: passwordEl.value
      });
      if (error) {
        if (status) status.textContent = error.message;
      } else {
        const {
          data: { user }
        } = await client.auth.getUser();
        if (user) await syncUserRow(user, client);
        await mergeCartAfterLogin();
        if (status) status.textContent = t("connexion_reussie");
      }
      refreshStatus();
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      const client = await initSupabase();
      if (!client) return;
      await client.auth.signOut();
      refreshStatus();
    });
  }
  
  if (!isSupabaseAvailable()) {
    if (status) status.textContent = t("configurez_supabase");
  }
  
  return authElements;
}

// Variables globales pour les éléments
let authElements = {};
let signUpBtn, signInBtn, signOutBtn, status, tabLogin, tabRegister, registerFields, actionsLogin, actionsRegister;

// Initialiser quand le DOM est chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuthElements);
} else {
  initializeAuthElements();
}

let mode = "login";

function setAuthMode(next) {
  mode = next;
  const isRegister = next === "register";
  const { emailEl, passwordEl, firstNameEl, lastNameEl, phoneEl, addressEl, wilayaEl } = authElements;
  
  registerFields?.classList.toggle("hidden", !isRegister);
  actionsLogin?.classList.toggle("hidden", isRegister);
  actionsRegister?.classList.toggle("hidden", !isRegister);
  tabLogin?.classList.toggle("bg-white", !isRegister);
  tabLogin?.classList.toggle("shadow-sm", !isRegister);
  tabLogin?.classList.toggle("text-sky-800", !isRegister);
  tabLogin?.classList.toggle("text-sky-700", isRegister);
  tabRegister?.classList.toggle("bg-white", isRegister);
  tabRegister?.classList.toggle("shadow-sm", isRegister);
  tabRegister?.classList.toggle("text-sky-800", isRegister);
  tabRegister?.classList.toggle("text-sky-700", !isRegister);
  passwordEl?.setAttribute("autocomplete", isRegister ? "new-password" : "current-password");
  if (firstNameEl) firstNameEl.required = isRegister;
  if (lastNameEl) lastNameEl.required = isRegister;
  if (phoneEl) phoneEl.required = isRegister;
  if (addressEl) addressEl.required = isRegister;
  if (wilayaEl) wilayaEl.required = isRegister;
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

async function refreshStatus() {
  const client = await initSupabase();
  if (!client) return;
  
  const {
    data: { user }
  } = await client.auth.getUser();
  if (!user) {
    status.textContent = t("non_connecte");
    return;
  }
  const meta = user.user_metadata || {};
  const label =
    [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() || user.email;
  status.textContent = `${t("connecte")} : ${label}${user.email ? ` (${user.email})` : ""}`;
}

// Appeler refreshStatus et updateLanguageUI après l'initialisation
setTimeout(() => {
  refreshStatus();
  updateLanguageUI();
}, 100);
