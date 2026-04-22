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
  const cart = getLocalCart();
  const existing = cart.find((item) => item.product_id === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ product_id: productId, quantity });
  setLocalCart(cart);
  
  // Sync with Supabase if logged in
  const client = await createSupabaseClient();
  if (client) {
    const { data: { user } } = await client.auth.getUser();
    if (user) {
      await syncCartWithSupabase(cart, user.id, client);
    }
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

export function getCartDetailed() {
  return getLocalCart().map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return { ...item, product };
  });
}

export function getCartTotal() {
  return getCartDetailed().reduce((sum, item) => sum + item.quantity * item.product.price, 0);
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

export function showCartNotification() {
  const notification = document.createElement("div");
  notification.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce";
  notification.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Produit ajouté au panier';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}
