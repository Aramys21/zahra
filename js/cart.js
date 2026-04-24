import { products } from "./data.js";
import { createSupabaseClient } from "../supabase/client.js";

const CART_KEY = "zahra_cart_guest";

export function getLocalCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

export function setLocalCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export async function addToCart(productId, quantity = 1) {
  const client = await createSupabaseClient();
  let user = null;
  
  if (client) {
    const { data: { user: authUser } } = await client.auth.getUser();
    user = authUser;
    if (!user) {
      showLoginModal();
      return;
    }
  }

  const cart = getLocalCart();
  const existing = cart.find((item) => item.product_id === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ product_id: productId, quantity });
  setLocalCart(cart);
  
  // Sync with Supabase if logged in
  if (client && user) {
    await syncCartWithSupabase(cart, user.id, client);
  }
  
  showCartNotification();
}

export function removeFromCart(productId) {
  const next = getLocalCart().filter((item) => item.product_id !== productId);
  setLocalCart(next);
}

export function updateQuantity(productId, quantity) {
  const cart = getLocalCart().map((item) =>
    item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  setLocalCart(cart);
}

export async function getCartDetailed() {
  const cart = getLocalCart();
  const client = await createSupabaseClient();
  
  let detailedCart = [];
  
  if (client) {
    // Charger les produits depuis Supabase
    const { data: dbProducts } = await client.from("products").select("*");
    if (dbProducts) {
      detailedCart = cart.map((item) => {
        const product = dbProducts.find((p) => p.id === item.product_id);
        return { ...item, product };
      }).filter(item => item.product);
    }
  }
  
  // Fallback vers les produits locaux si nécessaire
  if (detailedCart.length === 0) {
    detailedCart = cart.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return { ...item, product };
    }).filter(item => item.product);
  }
  
  return detailedCart;
}

export async function getCartTotal() {
  const detailedCart = await getCartDetailed();
  if (!detailedCart || detailedCart.length === 0) {
    return 0;
  }
  return detailedCart.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.quantity * item.product.price;
  }, 0);
}

async function syncCartWithSupabase(cart, userId, client) {
  // Delete existing cart items for user
  await client.from("cart").delete().eq("user_id", userId);
  
  // Insert new cart items
  if (cart.length > 0) {
    const items = cart.map(item => ({
      user_id: userId,
      product_id: item.product_id,
      quantity: item.quantity
    }));
    await client.from("cart").insert(items);
  }
}

export async function mergeCartAfterLogin() {
  const client = await createSupabaseClient();
  if (!client) return;
  
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;

  const localCart = getLocalCart();
  const { data: serverCart } = await client.from("cart").select("*").eq("user_id", user.id);
  const mergedMap = new Map();

  [...(serverCart || []), ...localCart].forEach((item) => {
    const prev = mergedMap.get(item.product_id) || 0;
    mergedMap.set(item.product_id, prev + item.quantity);
  });

  const merged = [...mergedMap.entries()].map(([product_id, quantity]) => ({ product_id, quantity }));
  setLocalCart(merged);
  await syncCartWithSupabase(merged, user.id, client);
}

export function updateCartBadge() {
  const cart = getLocalCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = totalItems;
    badge.classList.toggle("hidden", totalItems === 0);
  }
}

export function showCartNotification() {
  const notification = document.createElement("div");
  notification.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce";
  notification.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Produit ajouté au panier';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
  
  updateCartBadge();
}

function showLoginModal() {
  const isInSubdir = window.location.pathname.includes("/pages/");
  const authPath = isInSubdir ? "auth.html" : "pages/auth.html";
  
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
      <h3 class="text-xl font-bold mb-4">Connexion requise</h3>
      <p class="text-gray-600 mb-6">Vous devez être connecté pour ajouter des produits au panier.</p>
      <div class="flex gap-3">
        <a href="${authPath}" class="btn-primary flex-1 text-center py-2">Se connecter</a>
        <a href="${authPath}?mode=register" class="btn-secondary flex-1 text-center py-2">S'inscrire</a>
      </div>
      <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}
