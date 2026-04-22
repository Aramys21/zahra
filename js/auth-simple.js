// Système d'authentification simplifié pour fonctionnement immédiat
// Stockage local pour éviter les problèmes Supabase

const AUTH_STORAGE_KEY = 'zahra_auth_user';
const ADMIN_EMAILS = ['bouachar37@gmail.com'];

function setAuthUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  return user;
}

function getAuthUser() {
  const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

function clearAuthUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
}

function login(email, password) {
  // Pour le moment, accepter n'importe quel mot de passe pour le test
  // En production, vérifier avec une vraie base de données
  if (!email || !password) {
    return { success: false, error: 'Email et mot de passe requis' };
  }
  
  const user = {
    id: Date.now(),
    email: email.toLowerCase(),
    firstName: email.split('@')[0],
    lastName: '',
    isAdmin: isAdmin(email)
  };
  
  setAuthUser(user);
  return { success: true, user };
}

function register(userData) {
  if (!userData.email || !userData.password) {
    return { success: false, error: 'Email et mot de passe requis' };
  }
  
  const user = {
    id: Date.now(),
    email: userData.email.toLowerCase(),
    firstName: userData.firstName || userData.email.split('@')[0],
    lastName: userData.lastName || '',
    phone: userData.phone || '',
    address: userData.address || '',
    wilaya: userData.wilaya || '',
    isAdmin: isAdmin(userData.email)
  };
  
  setAuthUser(user);
  return { success: true, user };
}

function logout() {
  clearAuthUser();
  return { success: true };
}

function checkAuth() {
  return getAuthUser();
}

// Exporter les fonctions pour utilisation globale
window.zahraAuth = {
  login,
  register,
  logout,
  checkAuth,
  isAdmin,
  getAuthUser
};

console.log('Auth simplifié initialisé');
