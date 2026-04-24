import { products } from "./data.js";
import { addToCart } from "./cart.js";
import { getCategoryTheme } from "./components.js";
import { createSupabaseClient } from "../supabase/client.js";

const loadingEl = document.getElementById("product-loading");
const detailEl = document.getElementById("product-detail");
const errorEl = document.getElementById("product-error");

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

async function loadProduct() {
  if (!productId) {
    showError();
    return;
  }

  const client = await createSupabaseClient();
  if (!client) {
    // Fallback to local data
    const product = products.find((p) => p.id === productId);
    if (product) {
      await renderProduct(product);
    } else {
      showError();
    }
    return;
  }

  const { data, error } = await client.from("products").select("*").eq("id", productId).single();
  
  if (error || !data) {
    console.error("Error loading product:", error);
    showError();
  } else {
    await renderProduct(data);
  }
}

async function renderProduct(product) {
  loadingEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  detailEl.classList.remove("hidden");

  const theme = getCategoryTheme(product.category);
  
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-category").textContent = product.category;
  document.getElementById("product-price").textContent = `${product.price} DA`;
  document.getElementById("product-description").textContent = product.description || "";

  const imagesContainer = document.getElementById("product-images");
  if (product.images && product.images.length > 0) {
    imagesContainer.innerHTML = product.images.map(img => `
      <img src="${img}" alt="${product.name}" class="w-full h-96 object-cover rounded-lg" />
    `).join("");
  } else if (product.image) {
    imagesContainer.innerHTML = `<img src="${product.image}" alt="${product.name}" class="w-full h-96 object-cover rounded-lg" />`;
  } else {
    imagesContainer.innerHTML = `<div class="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"><i class="fas fa-image text-4xl"></i></div>`;
  }

  const qtyInput = document.getElementById("product-qty");
  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");
  const addToCartBtn = document.getElementById("add-to-cart-btn");

  qtyMinus.addEventListener("click", () => {
    const current = Number(qtyInput.value);
    if (current > 1) qtyInput.value = current - 1;
  });

  qtyPlus.addEventListener("click", () => {
    const current = Number(qtyInput.value);
    qtyInput.value = current + 1;
  });

  addToCartBtn.addEventListener("click", async () => {
    const quantity = Number(qtyInput.value || 1);
    await addToCart(product.id, quantity);
    addToCartBtn.classList.add("cart-bounce");
    setTimeout(() => addToCartBtn.classList.remove("cart-bounce"), 450);
  });

  // Load reviews
  await loadReviews(product.id);
  setupReviewForm(product.id);

  // Load similar products
  await loadSimilarProducts(product.category, product.id);
}

function showError() {
  loadingEl.classList.add("hidden");
  detailEl.classList.add("hidden");
  errorEl.classList.remove("hidden");
}

async function loadReviews(productId) {
  console.log("Chargement des commentaires pour le produit:", productId);
  const client = await createSupabaseClient();
  if (!client) {
    console.error("Client Supabase non disponible");
    return;
  }

  const { data: reviews, error } = await client
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  console.log("Résultat du chargement des commentaires:", { reviews, error });

  const reviewsList = document.getElementById("reviews-list");
  if (!reviewsList) {
    console.error("Element reviews-list non trouvé");
    return;
  }

  if (error || !reviews || reviews.length === 0) {
    console.log("Aucun avis trouvé ou erreur:", error);
    reviewsList.innerHTML = '<p class="text-sm text-gray-500">Aucun avis pour le moment</p>';
    return;
  }

  console.log("Affichage de", reviews.length, "avis");
  reviewsList.innerHTML = reviews.map((review) => `
    <div class="border-b border-sky-100 pb-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="text-yellow-400">
          ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
        </div>
        <span class="text-sm text-gray-500">Anonyme</span>
      </div>
      <p class="text-gray-600">${review.comment || ''}</p>
    </div>
  `).join("");
}

async function setupReviewForm(productId) {
  const client = await createSupabaseClient();
  if (!client) return;

  const { data: { user } } = await client.auth.getUser();
  const reviewFormContainer = document.getElementById("review-form-container");
  const loginToReview = document.getElementById("login-to-review");

  if (user) {
    reviewFormContainer?.classList.remove("hidden");
    loginToReview?.classList.add("hidden");
  } else {
    reviewFormContainer?.classList.add("hidden");
    loginToReview?.classList.remove("hidden");
  }

  // Setup star rating
  const stars = document.querySelectorAll(".star-btn");
  const ratingInput = document.getElementById("review-rating");
  
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = Number(star.dataset.rating);
      ratingInput.value = rating;
      updateStars(rating);
    });
  });

  // Setup submit
  const submitBtn = document.getElementById("submit-review");
  submitBtn?.addEventListener("click", async () => {
    const rating = Number(ratingInput.value);
    const comment = document.getElementById("review-comment").value.trim();

    console.log("Tentative d'ajout de commentaire:", { productId, userId: user.id, rating, comment });

    if (rating === 0) {
      alert("Veuillez sélectionner une note");
      return;
    }

    if (!comment) {
      alert("Veuillez ajouter un commentaire");
      return;
    }

    const { data, error } = await client.from("reviews").insert([{
      product_id: productId,
      user_id: user.id,
      rating,
      comment
    }]);

    console.log("Résultat de l'insertion:", { data, error });

    if (error) {
      console.error("Erreur lors de la publication:", error);
      alert("Erreur lors de la publication: " + error.message);
    } else {
      console.log("Avis publié avec succès, rechargement des commentaires...");
      alert("Avis publié !");
      document.getElementById("review-comment").value = "";
      ratingInput.value = "0";
      updateStars(0);
      await loadReviews(productId);
    }
  });
}

function updateStars(rating) {
  const stars = document.querySelectorAll(".star-btn");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("text-yellow-400");
      star.classList.remove("text-gray-300");
    } else {
      star.classList.remove("text-yellow-400");
      star.classList.add("text-gray-300");
    }
  });
}

async function loadSimilarProducts(category, currentProductId) {
  const client = await createSupabaseClient();
  if (!client) return;

  const { data: similarProducts, error } = await client
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", currentProductId)
    .limit(4);

  const similarContainer = document.getElementById("similar-products");
  if (!similarContainer) return;

  if (error || !similarProducts || similarProducts.length === 0) {
    similarContainer.innerHTML = '<p class="text-sm text-gray-500 col-span-full">Aucun produit similaire</p>';
    return;
  }

  const { renderProductCard } = await import("./components.js");
  similarContainer.innerHTML = similarProducts.map(renderProductCard).join("");
  
  // Setup favorite buttons for similar products
  similarContainer.querySelectorAll(".favorite-btn").forEach((button) => {
    const productId = Number(button.dataset.id);
    
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

  // Setup add to cart buttons for similar products
  similarContainer.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = Number(event.currentTarget.dataset.id);
      const { addToCart } = await import("./cart.js");
      await addToCart(productId, 1);
      event.currentTarget.classList.add("cart-bounce");
      setTimeout(() => event.currentTarget.classList.remove("cart-bounce"), 450);
    });
  });
}

loadProduct();
