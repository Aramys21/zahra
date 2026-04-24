export async function loadComponents() {
  const componentTargets = document.querySelectorAll("[data-component]");
  const isInSubdir =
    window.location.pathname.includes("/pages/") || window.location.pathname.includes("/admin/");

  for (const target of componentTargets) {
    const name = target.getAttribute("data-component");
    const relativePath = isInSubdir ? `../components/${name}.html` : `./components/${name}.html`;
    try {
      const response = await fetch(relativePath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      target.innerHTML = await response.text();
    } catch (_error) {
      // Fallback si ouverture en file:// ou si fetch bloque.
      target.innerHTML = getInlineFallback(name, isInSubdir);
    }
  }

  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.contains("hidden");
      
      if (isHidden) {
        mobileMenu.classList.remove("hidden");
        mobileBtn.classList.add("active");
        // Animation slide down
        setTimeout(() => {
          mobileMenu.classList.remove("-translate-y-full", "opacity-0");
          mobileMenu.classList.add("translate-y-0", "opacity-100");
        }, 10);
      } else {
        mobileMenu.classList.add("-translate-y-full", "opacity-0");
        mobileMenu.classList.remove("translate-y-0", "opacity-100");
        mobileBtn.classList.remove("active");
        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300);
      }
      
      // Animation hamburger -> X
      const lines = mobileBtn.querySelectorAll("div");
      if (mobileBtn.classList.contains("active")) {
        lines[0].style.transform = "rotate(45deg) translate(5px, 5px)";
        lines[1].style.opacity = "0";
        lines[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
      } else {
        lines[0].style.transform = "";
        lines[1].style.opacity = "1";
        lines[2].style.transform = "";
      }
    });
  }
}

function getInlineFallback(name, isInSubdir) {
  const isAdminPage = window.location.pathname.includes("/admin/");
  const base = isAdminPage ? "../pages" : isInSubdir ? "." : "./pages";
  const logoSrc =
    "../assets/logo.png";
  if (name === "navbar") {
    return `
      <header class="sticky top-0 z-50 border-b border-sky-100 bg-white/95 backdrop-blur">
        <div class="container-zahra flex items-center justify-between py-4">
          <a href="${base}/home.html" class="flex items-center gap-3"><img src="${logoSrc}" alt="Logo Zahra Diffusion" class="h-11 w-auto" /></a>
          <nav class="hidden gap-6 text-sm font-medium md:flex">
            <a class="transition hover:text-sky-600" href="${base}/home.html">Accueil</a>
            <a class="transition hover:text-sky-600" href="${base}/boutique.html">Boutique</a>
            <a class="inline-flex items-center gap-2 transition hover:text-sky-600" href="${base}/wishlist.html"><i class="fa-solid fa-heart"></i><span>Favoris</span></a>
            <a class="inline-flex items-center gap-2 transition hover:text-sky-600" href="${base}/panier.html"><i class="fa-solid fa-cart-shopping"></i><span>Panier</span></a>
            <div id="auth-nav-desktop" class="inline-flex items-center gap-2">
              <a class="inline-flex items-center gap-2 transition hover:text-sky-600" href="${base}/auth.html"><i class="fa-regular fa-user"></i><span>Compte</span></a>
            </div>
          </nav>
          <button id="mobile-menu-btn" class="relative rounded-lg border border-sky-200 p-2 md:hidden group">
            <div class="h-0.5 w-6 bg-sky-700 transition-all duration-300 group-hover:bg-sky-900"></div>
            <div class="h-0.5 w-6 bg-sky-700 mt-1.5 transition-all duration-300 group-hover:bg-sky-900"></div>
            <div class="h-0.5 w-6 bg-sky-700 mt-1.5 transition-all duration-300 group-hover:bg-sky-900"></div>
          </button>
        </div>
        <div id="mobile-menu" class="hidden border-t border-sky-100 bg-white md:hidden">
          <div class="container-zahra grid gap-3 py-3 text-sm">
            <a href="${base}/home.html">Accueil</a>
            <a href="${base}/boutique.html">Boutique</a>
            <a class="inline-flex items-center gap-2" href="${base}/wishlist.html"><i class="fa-solid fa-heart"></i><span>Favoris</span></a>
            <a class="inline-flex items-center gap-2" href="${base}/panier.html"><i class="fa-solid fa-cart-shopping"></i><span>Panier</span></a>
            <div id="auth-nav-mobile">
              <a class="inline-flex items-center gap-2" href="${base}/auth.html"><i class="fa-regular fa-user"></i><span>Compte</span></a>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  if (name === "footer") {
    return `
      <footer class="mt-20 border-t border-sky-100 bg-sky-50">
        <div class="container-zahra grid gap-10 py-12 md:grid-cols-3">
          <div><h3 class="text-lg font-bold text-sky-700">Zahra Diffusion</h3></div>
          <div><p class="text-sm text-gray-600">Produits premium pour la femme, la maison et le quotidien.</p></div>
          <div>
            <p class="text-sm text-gray-600">support@zahradiffusion.com</p>
            <div class="mt-4 flex items-center gap-4 text-lg text-sky-700">
              <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a>
              <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
              <a href="#" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
  return "";
}

export function getCategoryTheme(category) {
  const isFemme = String(category).toLowerCase() === "femme";
  return isFemme
    ? {
        badge: "bg-rose-100 text-rose-700",
        price: "text-rose-700",
        button: "bg-rose-600 hover:bg-rose-700"
      }
    : {
        badge: "bg-sky-100 text-sky-700",
        price: "text-sky-700",
        button: "bg-sky-600 hover:bg-sky-700"
      };
}

export function renderProductCard(product) {
  const theme = getCategoryTheme(product.category);
  const isInSubdir = window.location.pathname.includes("/pages/");
  const productPath = isInSubdir ? `product.html?id=${product.id}` : `pages/product.html?id=${product.id}`;
  
  return `
    <article class="premium-card overflow-hidden group">
      <div class="relative h-56 overflow-hidden">
        <img src="${product.image}" alt="${product.name}" class="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <button class="favorite-btn absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 text-gray-400 hover:text-red-500 transition-colors shadow" data-id="${product.id}">
          <i class="fas fa-heart"></i>
        </button>
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <div class="text-center text-white">
            <p class="text-sm font-medium">${product.name}</p>
            <p class="mt-2 text-xs text-gray-200">${product.description}</p>
          </div>
        </div>
      </div>
      <div class="p-4">
        <p class="inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase ${theme.badge}">${product.category}</p>
        <h3 class="mt-2 font-semibold">${product.name}</h3>
        <div class="mt-4 flex items-center justify-between">
          <p class="font-bold ${theme.price}">${product.price} DA</p>
          <div class="flex gap-2">
            <a class="rounded-lg border border-sky-200 px-3 py-2 text-xs" href="${productPath}">Détails</a>
            <button class="add-to-cart rounded-lg px-3 py-2 text-xs font-semibold text-white ${theme.button}" data-id="${product.id}">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}
