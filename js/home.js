import { products } from "./data.js";
import { renderProductCard } from "./components.js";
import { addToCart, updateCartBadge } from "./cart.js";
import { createSupabaseClient } from "../supabase/client.js";
import { toggleFavorite, isFavorite } from "./favorites.js";
import { updateAuthUI } from "./auth-ui.js";

const target = document.getElementById("popular-products");
if (target) {
  async function loadProducts() {
    console.log("Chargement des produits...");
    let displayProducts = products.filter((p) => p.featured).slice(0, 4);
    
    const client = await createSupabaseClient();
    if (client) {
      console.log("Client Supabase disponible pour les produits");
      const { data, error } = await client.from("products").select("*").order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erreur lors du chargement des produits:", error);
      } else {
        console.log("Produits récupérés:", data);
        if (data?.length) {
          displayProducts = data.slice(0, 4);
        }
      }
    } else {
      console.log("Client Supabase non disponible, utilisation des fallbacks");
    }

    console.log("Produits à afficher:", displayProducts);
    target.innerHTML = displayProducts.map(renderProductCard).join("");
    target.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const productId = Number(event.currentTarget.dataset.id);
        await addToCart(productId, 1);
        event.currentTarget.classList.add("cart-bounce");
        setTimeout(() => event.currentTarget.classList.remove("cart-bounce"), 450);
      });
    });

    // Setup favorite buttons
    target.querySelectorAll(".favorite-btn").forEach((button) => {
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

  loadProducts();
  
  // Initialiser le badge du panier
  updateCartBadge();
}

const blogPreview = document.getElementById("blog-preview");
if (blogPreview) {
  const fallbackBlogs = [
    { title: "Routine bien-être matinale", excerpt: "Nos gestes simples pour démarrer la journée." },
    { title: "Comment choisir vos produits maison", excerpt: "Guide pratique pour un intérieur sain." },
    { title: "Top tendances femme 2026", excerpt: "Découvrez les incontournables de la saison." }
  ];

  async function loadBlogs() {
    console.log("Chargement des blogs...");
    let blogs = fallbackBlogs;
    
    const client = await createSupabaseClient();
    if (client) {
      console.log("Client Supabase disponible");
      const { data, error } = await client.from("blogs").select("title, excerpt").order("created_at", { ascending: false }).limit(3);
      
      if (error) {
        console.error("Erreur lors du chargement des blogs:", error);
      } else {
        console.log("Blogs récupérés:", data);
        if (data?.length) blogs = data;
      }
    } else {
      console.log("Client Supabase non disponible, utilisation des fallbacks");
    }

    console.log("Blogs à afficher:", blogs);
    blogPreview.innerHTML = blogs
      .map(
        (post) => `
        <article class="premium-card p-5">
          <h3 class="font-semibold">${post.title}</h3>
          <p class="mt-3 text-sm text-gray-600">${post.excerpt}</p>
        </article>
      `
      )
      .join("");
  }

  loadBlogs();
}
