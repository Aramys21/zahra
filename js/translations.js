// Système de traduction pour Zahra Diffusion
export const translations = {
  fr: {
    // Navigation
    home: "Accueil",
    boutique: "Boutique", 
    panier: "Panier",
    compte: "Compte",
    menu: "Menu",
    
    // Authentification
    connexion: "Connexion",
    inscription: "Inscription",
    email: "Email",
    password: "Mot de passe",
    nom: "Nom",
    prenom: "Prénom",
    telephone: "Numéro de téléphone",
    wilaya: "Wilaya",
    adresse: "Adresse",
    se_connecter: "Se connecter",
    creer_compte: "Créer mon compte",
    deconnexion: "Déconnexion",
    non_connecte: "Non connecté",
    connecte: "Connecté",
    
    // Messages
    compte_client: "Compte client",
    connexion_inscription: "Connexion ou création de compte sécurisée",
    renseignez_champs: "Renseignez le nom, le prénom, le téléphone, la wilaya et l'adresse complète.",
    compte_cree: "Compte créé. Vous êtes connecté.",
    compte_cree_verif: "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
    connexion_reussie: "Connexion réussie.",
    configurez_supabase: "Configurez vos clés Supabase dans supabase/client.js."
  },
  en: {
    // Navigation
    home: "Home",
    boutique: "Shop",
    panier: "Cart", 
    compte: "Account",
    menu: "Menu",
    
    // Authentification
    connexion: "Login",
    inscription: "Register",
    email: "Email",
    password: "Password",
    nom: "Last Name",
    prenom: "First Name",
    telephone: "Phone Number",
    wilaya: "Province",
    adresse: "Address",
    se_connecter: "Sign In",
    creer_compte: "Create Account",
    deconnexion: "Logout",
    non_connecte: "Not connected",
    connecte: "Connected",
    
    // Messages
    compte_client: "Customer Account",
    connexion_inscription: "Secure login or account creation",
    renseignez_champs: "Please fill in name, first name, phone, province and complete address.",
    compte_cree: "Account created. You are logged in.",
    compte_cree_verif: "Account created. Check your email to confirm your address, then log in.",
    connexion_reussie: "Login successful.",
    configurez_supabase: "Configure your Supabase keys in supabase/client.js.",
    
    // Page d'accueil
    collection_femme: "Women Collection",
    titre_accueil: "The premium e-commerce inspired by Zahra Diffusion",
    description_accueil: "An elegant selection of women, home and wellness products for a modern daily life.",
    decouvrir_produits: "Discover our products",
    creer_compte_accueil: "Create an account",
    produits_populaires: "Popular products",
    voir_tout: "See all",
    categories: "Categories",
    
    // Boutique
    filtres: "Filters",
    categorie: "Category",
    toutes: "All",
    prix_max: "Max price",
    tri: "Sort",
    pertinence: "Relevance",
    prix_croissant: "Price ascending",
    prix_decroissant: "Price descending",
    ajouter_au_panier: "Add to cart",
    
    // Panier
    votre_panier: "Your cart",
    panier_vide: "Your cart is empty.",
    recapitulatif: "Summary",
    total: "Total",
    commander: "Checkout",
    supprimer: "Remove"
  }
};

let currentLang = localStorage.getItem('lang') || 'fr';

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  updateLanguageUI();
}

export function getCurrentLanguage() {
  return currentLang;
}

export function t(key) {
  return translations[currentLang][key] || translations.fr[key] || key;
}

export function updateLanguageUI() {
  // Mettre à jour le bouton de langue
  const langToggle = document.getElementById('lang-toggle');
  const currentLangSpan = document.getElementById('current-lang');
  if (langToggle && currentLangSpan) {
    currentLangSpan.textContent = currentLang.toUpperCase();
  }

  // Mettre à jour les éléments avec data-translate
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    const translation = t(key);
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else if (element.tagName === 'OPTION') {
      element.textContent = translation;
    } else if (element.tagName === 'A' && element.textContent.trim()) {
      // Garder le href mais changer le texte
      element.textContent = translation;
    } else {
      element.textContent = translation;
    }
  });

  // Mettre à jour les labels
  document.querySelectorAll('label[for]').forEach(label => {
    const inputId = label.getAttribute('for');
    const input = document.getElementById(inputId);
    if (input && input.hasAttribute('data-translate-key')) {
      const key = input.getAttribute('data-translate-key');
      label.textContent = t(key);
    }
  });

  // Mettre à jour les boutons "Ajouter au panier" générés dynamiquement
  document.querySelectorAll('.add-to-cart').forEach(button => {
    if (currentLang === 'en') {
      button.textContent = 'Add to cart';
    } else {
      button.textContent = 'Ajouter au panier';
    }
  });

  // Mettre à jour les messages panier vide
  document.querySelectorAll('#cart-list').forEach(cartList => {
    if (cartList.textContent.includes('vide') || cartList.textContent.includes('empty')) {
      cartList.innerHTML = `<p class="text-gray-500">${t('panier_vide')}</p>`;
    }
  });
}

// Initialiser le système de langue
export function initLanguageSystem() {
  updateLanguageUI();
  
  // Ajouter l'écouteur d'événement pour le bouton de langue
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const newLang = currentLang === 'fr' ? 'en' : 'fr';
      setLanguage(newLang);
    });
  }
}
