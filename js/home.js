import { products } from "./data.js";
import { renderProductCard } from "./components.js";
import { addToCart } from "./cart.js";
import { supabaseClient } from "../supabase/client.js";

const target = document.getElementById("popular-products");
if (target) {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  target.innerHTML = featured.map(renderProductCard).join("");
  target.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = Number(event.currentTarget.dataset.id);
      await addToCart(productId, 1);
      event.currentTarget.classList.add("cart-bounce");
      setTimeout(() => event.currentTarget.classList.remove("cart-bounce"), 450);
    });
  });
}

const blogPreview = document.getElementById("blog-preview");
if (blogPreview) {
  const fallbackBlogs = [
    { title: "Routine bien-être matinale", excerpt: "Nos gestes simples pour démarrer la journée." },
    { title: "Comment choisir vos produits maison", excerpt: "Guide pratique pour un intérieur sain." },
    { title: "Top tendances femme 2026", excerpt: "Découvrez les incontournables de la saison." }
  ];

  let blogs = fallbackBlogs;
  if (supabaseClient) {
    const { data } = await supabaseClient.from("blogs").select("title, excerpt").order("created_at", { ascending: false }).limit(3);
    if (data?.length) blogs = data;
  }

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
