import { loadComponents } from "./components.js";
import { initAllAnimations } from "./animations.js";
import { initLanguageSystem } from "./translations.js";
import { notifications } from "./notifications.js";
import { updateAuthUI } from "./auth-ui.js";

console.log("main.js chargé");

async function initApp() {
  console.log("initApp appelé");
  try {
    console.log("Chargement des composants...");
    await loadComponents();
    console.log("Composants chargés");
    initAllAnimations();
    initLanguageSystem();
    
    // Attendre que les éléments du navbar soient disponibles
    const checkElements = setInterval(() => {
      const desktopAuth = document.getElementById("auth-nav-desktop");
      const mobileAuth = document.getElementById("auth-nav-mobile");
      
      if (desktopAuth && mobileAuth) {
        clearInterval(checkElements);
        console.log("Elements auth-nav trouvés, appel de updateAuthUI");
        updateAuthUI();
      }
    }, 100);
    
    // Timeout après 5 secondes
    setTimeout(() => {
      clearInterval(checkElements);
      console.log("Timeout: éléments non trouvés après 5 secondes");
      updateAuthUI();
    }, 5000);
    
    // Rendre les notifications disponibles globalement
    window.notifications = notifications;
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
}

initApp();
