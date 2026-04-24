import { createSupabaseClient } from "../supabase/client.js";

export async function toggleFavorite(productId) {
  const client = await createSupabaseClient();
  if (!client) {
    showLoginModal();
    return;
  }

  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    showLoginModal();
    return;
  }

  // Check if already favorited
  const { data: existing } = await client
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    // Remove from favorites
    await client.from("favorites").delete().eq("id", existing.id);
    return false;
  } else {
    // Add to favorites
    await client.from("favorites").insert([{
      user_id: user.id,
      product_id: productId
    }]);
    return true;
  }
}

export async function isFavorite(productId) {
  const client = await createSupabaseClient();
  if (!client) return false;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return false;

  const { data } = await client
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  return !!data;
}

export async function getFavorites() {
  const client = await createSupabaseClient();
  if (!client) return [];

  const { data: { user } } = await client.auth.getUser();
  if (!user) return [];

  const { data } = await client
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id);

  return data?.map(f => f.product_id) || [];
}

function showLoginModal() {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
      <h3 class="text-xl font-bold mb-4">Connexion requise</h3>
      <p class="text-gray-600 mb-6">Vous devez être connecté pour ajouter des favoris.</p>
      <div class="flex gap-3">
        <a href="auth.html" class="btn-primary flex-1 text-center py-2">Se connecter</a>
        <a href="auth.html?mode=register" class="btn-secondary flex-1 text-center py-2">S'inscrire</a>
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
