import { getCartDetailed, getCartTotal, removeFromCart, updateQuantity, getLocalCart, setLocalCart, mergeCartAfterLogin, updateCartBadge } from "./cart.js";
import { updateLanguageUI } from "./translations.js";
import { createSupabaseClient } from "../supabase/client.js";

const list = document.getElementById("cart-items");
const totalEl = document.getElementById("cart-total");
const subtotalEl = document.getElementById("subtotal");
const emptyCartEl = document.getElementById("empty-cart");
const checkoutButton = document.getElementById("checkout-btn");

async function renderCart() {
  const items = await getCartDetailed();
  
  if (!items.length) {
    list.innerHTML = "";
    emptyCartEl?.classList.remove("hidden");
  } else {
    emptyCartEl?.classList.add("hidden");
    list.innerHTML = items
      .map(
        (item) => `
      <article class="premium-card flex flex-wrap items-center gap-4 p-4">
        <img src="${item.product.image}" class="h-20 w-20 rounded-lg object-cover" alt="${item.product.name}" />
        <div class="flex-1">
          <h3 class="font-semibold">${item.product.name}</h3>
          <p class="text-sm text-gray-500">${item.product.price} DA</p>
        </div>
        <input class="qty-input w-16 rounded border border-sky-200 p-1" type="number" min="1" data-id="${item.product_id}" value="${item.quantity}" />
        <button class="remove-btn text-sm text-red-500" data-id="${item.product_id}">Supprimer</button>
      </article>`
      )
      .join("");
  }

  const total = await getCartTotal();
  totalEl.textContent = `${total.toLocaleString()} DA`;
  subtotalEl.textContent = `${total.toLocaleString()} DA`;
  bindCartActions();
}

function bindCartActions() {
  document.querySelectorAll(".remove-btn").forEach((btn) =>
    btn.addEventListener("click", async (event) => {
      removeFromCart(Number(event.currentTarget.dataset.id));
      await renderCart();
    })
  );
  document.querySelectorAll(".qty-input").forEach((input) =>
    input.addEventListener("input", async (event) => {
      const newQuantity = Number(event.currentTarget.value);
      if (newQuantity >= 1) {
        updateQuantity(Number(event.currentTarget.dataset.id), newQuantity);
        await renderCart();
      }
    })
  );
}

checkoutButton?.addEventListener("click", async () => {
  const cart = getLocalCart();
  if (!cart.length) {
    alert("Votre panier est vide.");
    return;
  }

  // Vérifier si l'utilisateur est connecté
  const client = await createSupabaseClient();
  if (client) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      alert("Vous devez vous connecter pour commander.");
      window.location.href = "./auth.html";
      return;
    }
  }

  // Rediriger vers la page de paiement
  window.location.href = "./paiement.html";
});

renderCart();
updateLanguageUI();
updateCartBadge();
