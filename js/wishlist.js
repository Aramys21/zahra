import { createSupabaseClient } from "../supabase/client.js";
import { renderProductCard } from "./components.js";
import { toggleFavorite, isFavorite } from "./favorites.js";

async function loadWishlist() {
  const loadingEl = document.getElementById("wishlist-loading");
  const emptyEl = document.getElementById("wishlist-empty");
  const gridEl = document.getElementById("wishlist-grid");
  const loginEl = document.getElementById("login-required");

  const client = await createSupabaseClient();
  if (!client) {
    loadingEl?.classList.add("hidden");
    loginEl?.classList.remove("hidden");
    return;
  }

  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    loadingEl?.classList.add("hidden");
    loginEl?.classList.remove("hidden");
    return;
  }

  const { data: favorites, error } = await client
    .from("favorites")
    .select("product_id, products(*)")
    .eq("user_id", user.id);

  loadingEl?.classList.add("hidden");

  if (error || !favorites || favorites.length === 0) {
    emptyEl?.classList.remove("hidden");
    return;
  }

  gridEl?.classList.remove("hidden");
  const products = favorites.map(f => f.products).filter(p => p);
  
  gridEl.innerHTML = products.map(renderProductCard).join("");
  
  // Setup favorite buttons
  gridEl.querySelectorAll(".favorite-btn").forEach((button) => {
    const productId = Number(button.dataset.id);
    
    // All items in wishlist are favorited
    button.classList.add("text-red-500");
    button.classList.remove("text-gray-400");

    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      const isFav = await toggleFavorite(productId);
      if (!isFav) {
        // Remove from DOM
        const card = button.closest("article");
        card?.remove();
        
        // Check if empty
        if (gridEl.children.length === 0) {
          gridEl.classList.add("hidden");
          emptyEl.classList.remove("hidden");
        }
      }
    });
  });

  // Setup add to cart buttons
  gridEl.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = Number(event.currentTarget.dataset.id);
      const { addToCart } = await import("./cart.js");
      await addToCart(productId, 1);
      event.currentTarget.classList.add("cart-bounce");
      setTimeout(() => event.currentTarget.classList.remove("cart-bounce"), 450);
    });
  });
}

loadWishlist();
