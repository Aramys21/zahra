import { createSupabaseClient } from "../supabase/client.js";

const ADMIN_EMAILS = ["bouachar37@gmail.com"];

let uploadedImages = [];

document.addEventListener('DOMContentLoaded', async () => {
  const productForm = document.getElementById("product-form");
  const productsTable = document.getElementById("products-table");
  const formTitle = document.getElementById("form-title");
  const cancelEditBtn = document.getElementById("cancel-edit");
  
  await checkAuthAndLoadAdmin(productForm, productsTable, formTitle, cancelEditBtn);
});

async function checkAuthAndLoadAdmin(productForm, productsTable, formTitle, cancelEditBtn) {
  const client = await createSupabaseClient();
  if (!client) {
    alert("Supabase non disponible");
    return;
  }
  
  const {
    data: { user }
  } = await client.auth.getUser();
  
  if (!user) {
    alert("Vous devez vous connecter pour accéder à l'admin.");
    window.location.href = "../admin/login.html";
  } else if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    alert("Accès refusé. Compte non autorisé pour l'entreprise.");
    window.location.href = "../pages/home.html";
  } else {
    await loadProducts(client, productsTable);
    bindProductForm(client, productForm, productsTable, formTitle, cancelEditBtn);
  }
}

async function loadProducts(client, productsTable) {
  const { data: dbProducts } = await client.from("products").select("*").order("created_at", { ascending: false });
  
  if (productsTable) {
    productsTable.innerHTML = dbProducts && dbProducts.length > 0 
      ? dbProducts.map(
        (product) => `
        <div class="flex flex-wrap items-center justify-between rounded-lg border border-sky-100 p-3">
          <div class="flex items-center gap-3">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg" />` : '<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"><i class="fas fa-image"></i></div>'}
            <div>
              <p class="font-semibold">${product.name}</p>
              <p class="text-sm text-gray-500">${product.category} - ${product.price} DA</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="edit-product-btn bg-sky-500 text-white px-3 py-1 rounded text-sm hover:bg-sky-600" data-id="${product.id}">
              <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="delete-product-btn bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600" data-id="${product.id}">
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      `
      ).join("")
      : '<p class="text-sm text-gray-500">Aucun produit</p>';

    document.querySelectorAll(".delete-product-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const id = Number(event.currentTarget.dataset.id);
        if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
          await client.from("products").delete().eq("id", id);
          await loadProducts(client, productsTable);
        }
      });
    });

    document.querySelectorAll(".edit-product-btn").forEach((button) => {
      console.log("Attaching event listener to edit button", button);
      button.addEventListener("click", async (event) => {
        console.log("Edit button clicked", event.currentTarget.dataset.id);
        const id = Number(event.currentTarget.dataset.id);
        const { data: products, error } = await client.from("products").select("*").eq("id", id);
        
        if (error) {
          console.error("Error fetching product:", error);
          alert("Erreur lors du chargement du produit: " + error.message);
          return;
        }
        
        console.log("Product data:", products);
        const product = products[0];
        
        if (product) {
          document.getElementById("p-name").value = product.name;
          document.getElementById("p-category").value = product.category;
          document.getElementById("p-price").value = product.price;
          document.getElementById("p-description").value = product.description || "";
          
          document.getElementById("product-form").dataset.editId = id;
          formTitle.textContent = "Modifier le produit";
          const submitBtn = document.querySelector("#product-form button[type='submit']");
          submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Mettre à jour le produit';
          cancelEditBtn.classList.remove("hidden");
          
          document.getElementById("product-form").scrollIntoView({ behavior: 'smooth' });
        } else {
          alert("Produit non trouvé");
        }
      });
    });
  }
}

function initImageUpload() {
  const uploadZone = document.getElementById('image-upload-zone');
  const fileInput = document.getElementById('p-images');
  const previewContainer = document.getElementById('image-preview');

  if (!uploadZone || !fileInput) return;

  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

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

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });
}

function handleFiles(files) {
  const previewContainer = document.getElementById('image-preview');
  if (!previewContainer) return;

  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner uniquement des images');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

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

window.removeImage = function(index) {
  uploadedImages.splice(index, 1);
  renderAllPreviews();
};

function renderAllPreviews() {
  const previewContainer = document.getElementById('image-preview');
  if (!previewContainer) return;
  
  previewContainer.innerHTML = '';
  uploadedImages.forEach((imageData, index) => {
    renderImagePreview(imageData, previewContainer);
  });
}

function bindProductForm(client, productForm, productsTable, formTitle, cancelEditBtn) {
  if (!productForm) return;
  
  initImageUpload();
  
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Form submitted");
    
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
    
    console.log("Payload:", payload);
    
    const editId = productForm.dataset.editId;
    console.log("Edit ID:", editId);
    
    let error;
    if (editId) {
      console.log("Updating product with ID:", editId);
      const result = await client.from("products").update(payload).eq("id", Number(editId));
      error = result.error;
      if (!error) {
        alert("Produit mis à jour avec succès !");
        delete productForm.dataset.editId;
        formTitle.textContent = "Ajouter un produit";
        const submitBtn = document.querySelector("#product-form button[type='submit']");
        submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Ajouter produit';
        cancelEditBtn.classList.add("hidden");
      }
    } else {
      console.log("Inserting new product");
      const result = await client.from("products").insert([payload]);
      error = result.error;
      if (!error) {
        alert("Produit ajouté avec succès !");
      }
    }
    
    if (error) {
      console.error("Error:", error);
      alert("Erreur: " + error.message);
    } else {
      productForm.reset();
      uploadedImages = [];
      renderAllPreviews();
      await loadProducts(client, productsTable);
    }
  });

  cancelEditBtn.addEventListener("click", () => {
    delete productForm.dataset.editId;
    formTitle.textContent = "Ajouter un produit";
    const submitBtn = document.querySelector("#product-form button[type='submit']");
    submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Ajouter produit';
    cancelEditBtn.classList.add("hidden");
    productForm.reset();
    uploadedImages = [];
    renderAllPreviews();
  });
}
