import { loadComponents } from "./components.js";
import { initAllAnimations } from "./animations.js";
import { initLanguageSystem } from "./translations.js";
import { notifications } from "./notifications.js";

async function initApp() {
  try {
    await loadComponents();
    initAllAnimations();
    initLanguageSystem();
    
    // Rendre les notifications disponibles globalement
    window.notifications = notifications;
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
}

initApp();
