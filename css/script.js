
/* Kemi~Shear: Theme switcher and photo viewer */

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

function setTheme(isLight) {
  document.body.classList.toggle("light-mode", isLight);

  themeIcon.textContent = isLight ? "☾" : "☀";
  themeLabel.textContent = isLight ? "Dark mode" : "Light mode";

  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode",
  );
}

themeToggle.addEventListener("click", () => {
  const isLight = !document.body.classList.contains("light-mode");
  setTheme(isLight);
});

/* Photo viewer */

const photoButtons = document.querySelectorAll(".photo-button");
const lightbox = document.getElementById("photo-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const closeLightbox = document.getElementById("close-lightbox");

let previousFocus = null;

function openPhoto(button) {
  const imagePath = button.dataset.fullImage;
  const imageAlt = button.dataset.photoAlt || "Enlarged photo";
  const figure = button.closest("figure");
  const caption = figure?.querySelector("figcaption")?.textContent || imageAlt;

  previousFocus = button;

  lightboxImage.src = imagePath;
  lightboxImage.alt = imageAlt;
  lightboxCaption.textContent = caption + " | Kemi~Shear";

  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  closeLightbox.focus();
}

function hidePhoto() {
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.removeAttribute("src");
  document.body.style.overflow = "";

  previousFocus?.focus();
}

photoButtons.forEach((button) => {
  button.addEventListener("click", () => openPhoto(button));
});

closeLightbox.addEventListener("click", hidePhoto);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    hidePhoto();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) {
    hidePhoto();
  }
});