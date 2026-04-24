import { createSupabaseClient } from "../supabase/client.js";

const ADMIN_EMAILS = ["bouachar37@gmail.com"];

document.addEventListener('DOMContentLoaded', async () => {
  const blogForm = document.getElementById("blog-form");
  const blogsTable = document.getElementById("blogs-table");
  const formTitle = document.getElementById("form-title");
  const cancelEditBtn = document.getElementById("cancel-edit");
  
  await checkAuthAndLoadAdmin(blogForm, blogsTable, formTitle, cancelEditBtn);
});

async function checkAuthAndLoadAdmin(blogForm, blogsTable, formTitle, cancelEditBtn) {
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
    await loadBlogs(client, blogsTable);
    bindBlogForm(client, blogForm, blogsTable, formTitle, cancelEditBtn);
  }
}

async function loadBlogs(client, blogsTable) {
  const { data: dbBlogs } = await client.from("blogs").select("*").order("created_at", { ascending: false });
  
  if (blogsTable) {
    blogsTable.innerHTML = dbBlogs && dbBlogs.length > 0 
      ? dbBlogs.map(
        (blog) => `
        <div class="flex flex-wrap items-center justify-between rounded-lg border border-sky-100 p-3">
          <div>
            <p class="font-semibold">${blog.title}</p>
            <p class="text-sm text-gray-500">${blog.excerpt}</p>
            <p class="text-xs text-gray-400 mt-1">Auteur: ${blog.author || 'Non spécifié'}</p>
          </div>
          <div class="flex gap-2">
            <button class="edit-blog-btn bg-sky-500 text-white px-3 py-1 rounded text-sm hover:bg-sky-600" data-id="${blog.id}">
              <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="delete-blog-btn bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600" data-id="${blog.id}">
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      `
      ).join("")
      : '<p class="text-sm text-gray-500">Aucun article</p>';

    document.querySelectorAll(".delete-blog-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const id = Number(event.currentTarget.dataset.id);
        if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
          await client.from("blogs").delete().eq("id", id);
          await loadBlogs(client, blogsTable);
        }
      });
    });

    document.querySelectorAll(".edit-blog-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const id = Number(event.currentTarget.dataset.id);
        const { data: blogs } = await client.from("blogs").select("*").eq("id", id);
        const blog = blogs[0];
        
        if (blog) {
          document.getElementById("b-title").value = blog.title;
          document.getElementById("b-excerpt").value = blog.excerpt;
          document.getElementById("b-content").value = blog.content || "";
          document.getElementById("b-author").value = blog.author || "";
          
          document.getElementById("blog-form").dataset.editId = id;
          formTitle.textContent = "Modifier l'article";
          const submitBtn = document.querySelector("#blog-form button[type='submit']");
          submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Mettre à jour l\'article';
          cancelEditBtn.classList.remove("hidden");
          
          document.getElementById("blog-form").scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}

function bindBlogForm(client, blogForm, blogsTable, formTitle, cancelEditBtn) {
  if (!blogForm) return;
  
  blogForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const payload = {
      title: document.getElementById("b-title").value.trim(),
      excerpt: document.getElementById("b-excerpt").value.trim(),
      content: document.getElementById("b-content").value.trim(),
      author: document.getElementById("b-author").value.trim()
    };
    
    const editId = blogForm.dataset.editId;
    
    let error;
    if (editId) {
      const result = await client.from("blogs").update(payload).eq("id", Number(editId));
      error = result.error;
      if (!error) {
        alert("Article mis à jour avec succès !");
        delete blogForm.dataset.editId;
        formTitle.textContent = "Ajouter un article blog";
        const submitBtn = document.querySelector("#blog-form button[type='submit']");
        submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Publier article';
        cancelEditBtn.classList.add("hidden");
      }
    } else {
      const result = await client.from("blogs").insert([payload]);
      error = result.error;
      if (!error) {
        alert("Article publié avec succès !");
      }
    }
    
    if (error) {
      alert("Erreur: " + error.message);
    } else {
      blogForm.reset();
      await loadBlogs(client, blogsTable);
    }
  });

  cancelEditBtn.addEventListener("click", () => {
    delete blogForm.dataset.editId;
    formTitle.textContent = "Ajouter un article blog";
    const submitBtn = document.querySelector("#blog-form button[type='submit']");
    submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Publier article';
    cancelEditBtn.classList.add("hidden");
    blogForm.reset();
  });
}
