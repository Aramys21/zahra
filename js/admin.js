import { products } from "./data.js";
import { createSupabaseClient } from "../supabase/client.js";

const ADMIN_ALLOWED_HOSTS = ["admin.zahradiffusion.com", "localhost", "127.0.0.1", "www.zahra.dz", "zahra.dz"];
const ADMIN_EMAILS = ["bouachar37@gmail.com"];

const ordersKpi = document.getElementById("kpi-orders");
const customersKpi = document.getElementById("kpi-customers");
const productsKpi = document.getElementById("kpi-products");
const ordersTable = document.getElementById("orders-table");
const accessStatus = document.getElementById("admin-access-status");
const productForm = document.getElementById("product-form");
const blogForm = document.getElementById("blog-form");

productsKpi.textContent = String(products.length);

const currentHost = window.location.hostname.toLowerCase();
const isAllowedHost = ADMIN_ALLOWED_HOSTS.includes(currentHost);

if (!isAllowedHost) {
  accessStatus.textContent = `Acces refuse: domaine non autorise (${currentHost}).`;
  document.querySelectorAll("main section:not(#admin-access), main .grid").forEach((el) => {
    if (!el.closest("#admin-access")) el.classList.add("hidden");
  });
} else {
  // Vérifier l'authentification avec Supabase
  checkAuthAndLoadAdmin();
}

async function checkAuthAndLoadAdmin() {
  const client = await createSupabaseClient();
  if (!client) {
    accessStatus.textContent = "Supabase non disponible";
    return;
  }
  
  const {
    data: { user }
  } = await client.auth.getUser();
  
  if (!user) {
    accessStatus.textContent = "Vous devez vous connecter pour accéder à l'admin.";
    window.location.href = "../pages/auth.html";
  } else if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    accessStatus.textContent = "Accès refusé. Compte non autorisé pour l'entreprise.";
    document.querySelectorAll("main section:not(#admin-access), main .grid").forEach((el) => {
      if (!el.closest("#admin-access")) el.classList.add("hidden");
    });
  } else {
    accessStatus.textContent = `Accès autorisé pour ${user.email}`;
    await loadAdminData(client);
    bindProductForm(client);
    bindBlogForm(client);
  }
}

async function loadAdminData(client) {
  const { data: orders } = await client.from("orders").select("*").order("created_at", { ascending: false });
  const { data: users } = await client.from("users").select("id");
  const { data: dbProducts } = await client.from("products").select("*");
  
  ordersKpi.textContent = String(orders?.length || 0);
  customersKpi.textContent = String(users?.length || 0);
  productsKpi.textContent = String(dbProducts?.length || products.length);

  ordersTable.innerHTML = orders && orders.length > 0 
    ? orders.map(
      (order) => `
      <div class="flex flex-wrap items-center justify-between rounded-lg border border-sky-100 p-3">
        <div>
          <p class="font-semibold">Commande #${order.id}</p>
          <p class="text-sm text-gray-500">Total: ${order.total} DA</p>
        </div>
        <select class="status-select rounded border border-sky-200 p-2 text-sm" data-id="${order.id}">
          <option ${order.status === "en attente" ? "selected" : ""}>en attente</option>
          <option ${order.status === "confirme" ? "selected" : ""}>confirme</option>
          <option ${order.status === "en cours" ? "selected" : ""}>en cours</option>
        </select>
      </div>
    `
    ).join("")
    : '<p class="text-sm text-gray-500">Aucune commande</p>';

  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async (event) => {
      const id = Number(event.currentTarget.dataset.id);
      await client.from("orders").update({ status: event.currentTarget.value }).eq("id", id);
    });
  });
}

// Variables globales pour les images
let uploadedImages = [];

// Initialiser l'upload d'images
function initImageUpload() {
  const uploadZone = document.getElementById('image-upload-zone');
  const fileInput = document.getElementById('p-images');
  const previewContainer = document.getElementById('image-preview');

  if (!uploadZone || !fileInput) return;

  // Clic sur la zone d'upload
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('border-sky-500', 'bg-sky-50');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('border-sky-500', 'bg-sky-50');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('border-sky-500', 'bg-sky-50');
    handleFiles(e.dataTransfer.files);
  });

  // Sélection de fichiers
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });
}

// Gérer les fichiers uploadés
function handleFiles(files) {
  const previewContainer = document.getElementById('image-preview');
  if (!previewContainer) return;

  Array.from(files).forEach(file => {
    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner uniquement des images');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Lire et prévisualiser l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        file: file,
        base64: e.target.result,
        name: file.name
      };
      uploadedImages.push(imageData);
      renderImagePreview(imageData, previewContainer);
    };
    reader.readAsDataURL(file);
  });
}

// Afficher la prévisualisation d'une image
function renderImagePreview(imageData, container) {
  const previewDiv = document.createElement('div');
  previewDiv.className = 'relative group';
  previewDiv.innerHTML = `
    <img src="${imageData.base64}" alt="${imageData.name}" class="w-full h-24 object-cover rounded-lg border border-sky-200" />
    <button type="button" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" onclick="removeImage(${uploadedImages.length - 1})">
      <i class="fas fa-times text-xs"></i>
    </button>
  `;
  container.appendChild(previewDiv);
}

// Supprimer une image de la prévisualisation
window.removeImage = function(index) {
  uploadedImages.splice(index, 1);
  renderAllPreviews();
};

// Réafficher toutes les prévisualisations
function renderAllPreviews() {
  const previewContainer = document.getElementById('image-preview');
  if (!previewContainer) return;
  
  previewContainer.innerHTML = '';
  uploadedImages.forEach((imageData, index) => {
    renderImagePreview(imageData, previewContainer);
  });
}

function bindProductForm(client) {
  initImageUpload();
  
  productForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    // Convertir les images en base64 pour stockage
    const imagesBase64 = uploadedImages.map(img => img.base64);
    const primaryImage = imagesBase64.length > 0 ? imagesBase64[0] : '';
    
    const payload = {
      name: document.getElementById("p-name").value.trim(),
      category: document.getElementById("p-category").value,
      price: Number(document.getElementById("p-price").value || 0),
      image: primaryImage,
      images: imagesBase64,
      description: document.getElementById("p-description").value.trim()
    };
    
    // Sauvegarder dans Supabase
    const { error } = await client.from("products").insert([payload]);
    
    if (error) {
      alert("Erreur lors de l'ajout: " + error.message);
    } else {
      alert("Produit ajouté avec succès !");
      productForm.reset();
      uploadedImages = [];
      renderAllPreviews();
      await loadAdminData(client);
    }
  });
}

function bindBlogForm(client) {
  blogForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      title: document.getElementById("b-title").value.trim(),
      excerpt: document.getElementById("b-excerpt").value.trim()
    };
    
    // Sauvegarder dans Supabase
    const { error } = await client.from("blogs").insert([payload]);
    
    if (error) {
      alert("Erreur lors de la publication: " + error.message);
    } else {
      alert("Article publié.");
      blogForm.reset();
    }
  });
}
