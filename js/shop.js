import { products } from "./data.js";
import { renderProductCard } from "./components.js";
import { addToCart } from "./cart.js";
import { updateLanguageUI } from "./translations.js";

const grid = document.getElementById("shop-grid");
const categoryInput = document.getElementById("filter-category");
const priceInput = document.getElementById("filter-price");
const sortInput = document.getElementById("sort-by");
const priceDisplay = document.getElementById("price-display");

function getFilteredProducts() {
  let result = [...products];
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
}

const params = new URLSearchParams(window.location.search);
if (params.get("category") && categoryInput) categoryInput.value = params.get("category");

[categoryInput, priceInput, sortInput].forEach((el) => el?.addEventListener("input", renderShop));
if (priceInput && priceDisplay) {
  priceInput.addEventListener("input", () => {
    priceDisplay.textContent = `${priceInput.value} DA`;
  });
}

renderShop();
updateLanguageUI();
