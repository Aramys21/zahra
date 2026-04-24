import { createSupabaseClient } from "../supabase/client.js";

export async function updateAuthUI() {
  console.log("updateAuthUI appelé");
  const client = await createSupabaseClient();
  if (!client) {
    console.error("Supabase client non disponible dans updateAuthUI");
    return;
  }

  const { data: { user } } = await client.auth.getUser();
  console.log("Utilisateur détecté:", user);
  
  const desktopAuth = document.getElementById("auth-nav-desktop");
  const mobileAuth = document.getElementById("auth-nav-mobile");
  
  console.log("Elements desktopAuth:", !!desktopAuth, "mobileAuth:", !!mobileAuth);
  
  if (!desktopAuth || !mobileAuth) {
    console.error("Elements auth-nav non trouvés");
    return;
  }

  if (user) {
    const meta = user.user_metadata || {};
    const firstName = meta.first_name || user.email?.split('@')[0] || "Utilisateur";
    console.log("Prénom de l'utilisateur:", firstName);
    
    // User is logged in - show dropdown menu
    const authHTML = `
      <div class="relative">
        <button id="account-menu-btn" class="inline-flex items-center gap-2 transition hover:text-sky-600">
          <i class="fa-solid fa-user"></i>
          <span>Bonjour, ${firstName}</span>
          <i class="fa-solid fa-chevron-down text-xs"></i>
        </button>
        <div id="account-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-sky-100 py-2 z-50">
          <div class="px-4 py-2 border-b border-sky-100">
            <p class="text-sm font-medium text-gray-900">${firstName}</p>
            <p class="text-xs text-gray-500">${user.email}</p>
          </div>
          <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2">
            <i class="fa-solid fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    `;
    desktopAuth.innerHTML = authHTML;
    mobileAuth.innerHTML = authHTML;
    console.log("UI mise à jour pour utilisateur connecté");
    
    // Toggle dropdown
    const menuBtn = document.getElementById("account-menu-btn");
    const dropdown = document.getElementById("account-dropdown");
    
    menuBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown?.classList.toggle("hidden");
    });
    
    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      dropdown?.classList.add("hidden");
    });
    
    // Add logout handler
    document.getElementById("logout-btn")?.addEventListener("click", async () => {
      await client.auth.signOut();
      window.location.href = "home.html";
    });
  } else {
    console.log("Utilisateur non connecté");
    // User is not logged in - show login/register
    const authHTML = `
      <a class="inline-flex items-center gap-2 transition hover:text-sky-600" href="auth.html">
        <i class="fa-regular fa-user"></i>
        <span>Compte</span>
      </a>
    `;
    desktopAuth.innerHTML = authHTML;
    mobileAuth.innerHTML = authHTML;
    console.log("UI mise à jour pour utilisateur non connecté");
  }
}
