export function initScrollAnimations() {
  // Animations fade-in
  const fadeElements = document.querySelectorAll(".fade-in");
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );
  fadeElements.forEach((el) => fadeObserver.observe(el));

  // Animations slide-up
  const slideElements = document.querySelectorAll(".slide-up");
  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );
  slideElements.forEach((el) => slideObserver.observe(el));

  // Animations scale-in
  const scaleElements = document.querySelectorAll(".scale-in");
  const scaleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );
  scaleElements.forEach((el) => scaleObserver.observe(el));

  // Animations pour les cartes produits
  const productCards = document.querySelectorAll(".premium-card");
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("card-animate");
          }, index * 100);
        }
      });
    },
    { threshold: 0.1 }
  );
  productCards.forEach((el) => cardObserver.observe(el));
}

export function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  const hideLoader = () => {
    loader.classList.add("opacity-0");
    setTimeout(() => loader.classList.add("hidden"), 300);
  };

  // Fallback anti-blocage: on masque toujours le loader apres un delai max.
  const safetyTimeout = setTimeout(hideLoader, 2200);
  window.addEventListener("load", () => {
    clearTimeout(safetyTimeout);
    setTimeout(hideLoader, 300);
  });
}

export function addHoverAnimations() {
  // Animations pour les boutons
  const buttons = document.querySelectorAll(".btn-primary, .btn-secondary");
  buttons.forEach(button => {
    button.addEventListener("mouseenter", () => {
      button.style.transform = "translateY(-2px)";
      button.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
      button.style.boxShadow = "";
    });
  });

  // Animations pour les cartes
  const cards = document.querySelectorAll(".premium-card");
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-5px)";
      card.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "";
    });
  });

  // Animations pour les images
  const images = document.querySelectorAll("img");
  images.forEach(img => {
    img.addEventListener("mouseenter", () => {
      img.style.transform = "scale(1.05)";
      img.style.transition = "transform 0.3s ease";
    });
    img.addEventListener("mouseleave", () => {
      img.style.transform = "scale(1)";
    });
  });
}

export function addMicroInteractions() {
  // Animation pour les liens de navigation
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      link.style.transform = "scale(0.95)";
      setTimeout(() => {
        link.style.transform = "";
      }, 150);
    });
  });

  // Animation pour les inputs
  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach(input => {
    input.addEventListener("focus", () => {
      input.parentElement.style.transform = "scale(1.02)";
      input.style.transition = "all 0.3s ease";
    });
    input.addEventListener("blur", () => {
      input.parentElement.style.transform = "";
    });
  });

  // Animation pour les ajouts au panier
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  addToCartButtons.forEach(button => {
    button.addEventListener("click", () => {
      button.style.transform = "scale(0.9)";
      setTimeout(() => {
        button.style.transform = "";
      }, 200);
    });
  });
}

export function initAllAnimations() {
  initLoader();
  initScrollAnimations();
  addHoverAnimations();
  addMicroInteractions();
}
