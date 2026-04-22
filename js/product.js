import { products } from "./data.js";
import { addToCart } from "./cart.js";
import { getCategoryTheme } from "./components.js";

const target = document.getElementById("product-view");
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id")) || 1;
const product = products.find((p) => p.id === productId);

if (target && product) {
  const theme = getCategoryTheme(product.category);
  target.innerHTML = `
    <div class="premium-card overflow-hidden">
      <img src="${product.image}" alt="${product.name}" class="h-full w-full object-cover" />
    </div>
    <div>
      <p class="inline-flex rounded-full px-2 py-1 text-sm uppercase ${theme.badge}">${product.category}</p>
      <h1 class="mt-2 text-3xl font-bold">${product.name}</h1>
      <p class="mt-4 text-gray-600">${product.description}</p>
      <p class="mt-5 text-2xl font-black ${theme.price}">${product.price} DA</p>
      <div class="mt-5 flex items-center gap-3">
        <input id="quantity" type="number" min="1" value="1" class="w-24 rounded-lg border border-sky-200 p-2" />
        <button id="add-product-cart" class="rounded-full px-5 py-3 font-semibold text-white ${theme.button}">Ajouter au panier</button>
      </div>
    </div>
  `;

  const addButton = document.getElementById("add-product-cart");
  addButton?.addEventListener("click", async () => {
    const quantity = Number(document.getElementById("quantity").value || 1);
    await addToCart(product.id, quantity);
    addButton.classList.add("cart-bounce");
    setTimeout(() => addButton.classList.remove("cart-bounce"), 450);
  });
}
