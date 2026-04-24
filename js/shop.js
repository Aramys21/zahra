import { products } from "./data.js";
import { renderProductCard } from "./components.js";
import { addToCart } from "./cart.js";
import { updateLanguageUI } from "./translations.js";
import { createSupabaseClient } from "../supabase/client.js";
import { toggleFavorite, isFavorite } from "./favorites.js";

const grid = document.getElementById("shop-grid");
const categoryInput = document.getElementById("filter-category");
const priceInput = document.getElementById("filter-price");
const sortInput = document.getElementById("sort-by");
const priceDisplay = document.getElementById("price-display");

let allProducts = products;

async function loadProducts() {
  console.log("Chargement des produits pour la boutique...");
  const client = await createSupabaseClient();
  if (client) {
    console.log("Client Supabase disponible pour la boutique");
    const { data, error } = await client.from("products").select("*").order("created_at", { ascending: false });
    
    if (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } else {
      console.log("Produits récupérés pour la boutique:", data);
      if (data?.length) {
        allProducts = data;
      }
    }
  } else {
    console.log("Client Supabase non disponible, utilisation des fallbacks");
  }
  
  renderShop();
}

function getFilteredProducts() {
  let result = [...allProducts];
  const selectedCategory = categoryInput?.value || "";
  const maxPrice = Number(priceInput?.value || 15000);
  const sort = sortInput?.value || "relevance";

  if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
  result = result.filter((p) => p.price <= maxPrice);

  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  return result;
}

function renderShop() {
  if (!grid) return;
  const list = getFilteredProducts();
  grid.innerHTML = list.map(renderProductCard).join("");
  grid.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = Number(event.currentTarget.dataset.id);
      await addToCart(productId, 1);
      event.currentTarget.classList.add("cart-bounce");
      setTimeout(() => event.currentTarget.classList.remove("cart-bounce"), 450);
    });
  });

  // Setup favorite buttons
  grid.querySelectorAll(".favorite-btn").forEach((button) => {
    const productId = Number(button.dataset.id);
    
    // Check if already favorited
    isFavorite(productId).then(fav => {
      if (fav) {
        button.classList.add("text-red-500");
        button.classList.remove("text-gray-400");
      }
    });

    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      const isFav = await toggleFavorite(productId);
      if (isFav) {
        button.classList.add("text-red-500");
        button.classList.remove("text-gray-400");
      } else {
        button.classList.remove("text-red-500");
        button.classList.add("text-gray-400");
      }
    });
  });
}

const params = new URLSearchParams(window.location.search);
if (params.get("category") && categoryInput) categoryInput.value = params.get("category");

[categoryInput, priceInput, sortInput].forEach((el) => el?.addEventListener("input", renderShop));
if (priceInput && priceDisplay) {
  priceInput.addEventListener("input", () => {
    priceDisplay.textContent = `${priceInput.value} DA`;
  });
}

loadProducts();
updateLanguageUI();
