/* Portfolio — Cody Lai Tham */
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Hauteur de l'en-tête (pour la sous-navigation collante) ---------- */
  const header = document.querySelector(".site-header");
  const setHeaderH = () => header && document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  setHeaderH();
  window.addEventListener("resize", setHeaderH);

  /* ---------- Apparition au défilement ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Sous-navigation : section courante ---------- */
  const subLinks = document.querySelectorAll(".subnav a[href^='#']");
  if (subLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    subLinks.forEach((a) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) map.set(target, a);
    });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        subLinks.forEach((a) => a.classList.remove("is-current"));
        const link = map.get(e.target);
        link.classList.add("is-current");
        link.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((_, section) => spy.observe(section));
  }

  /* ---------- Visionneuse d'images ---------- */
  const shots = [...document.querySelectorAll(".shot button[data-full]")];
  if (shots.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Visionneuse d'images");
    lb.innerHTML = `
      <div class="lightbox__bar">
        <span class="lightbox__count"></span>
        <button class="icon-btn" data-close aria-label="Fermer"><svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="lightbox__img"><img alt=""></div>
      <p class="lightbox__cap"></p>
      <button class="icon-btn lightbox__nav lightbox__nav--prev" data-prev aria-label="Image précédente"><svg class="ico" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>
      <button class="icon-btn lightbox__nav lightbox__nav--next" data-next aria-label="Image suivante"><svg class="ico" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`;
    document.body.appendChild(lb);

    const img = lb.querySelector("img");
    const cap = lb.querySelector(".lightbox__cap");
    const count = lb.querySelector(".lightbox__count");
    let group = [], index = 0, opener = null;

    const show = (i) => {
      index = (i + group.length) % group.length;
      const btn = group[index];
      const thumb = btn.querySelector("img");
      img.src = btn.dataset.full;
      img.alt = thumb ? thumb.alt : "";
      const fc = btn.closest("figure")?.querySelector("figcaption");
      cap.textContent = fc ? fc.textContent : (thumb ? thumb.alt : "");
      count.textContent = `${index + 1} / ${group.length}`;
      lb.querySelectorAll("[data-prev],[data-next]").forEach((b) => (b.hidden = group.length < 2));
    };
    const open = (btn) => {
      const name = btn.dataset.group;
      group = name ? shots.filter((s) => s.dataset.group === name) : [btn];
      opener = btn;
      show(group.indexOf(btn));
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lb.querySelector("[data-close]").focus();
    };
    const close = () => {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      img.removeAttribute("src");
      opener?.focus();
    };

    shots.forEach((btn) => btn.addEventListener("click", () => open(btn)));
    lb.querySelector("[data-close]").addEventListener("click", close);
    lb.querySelector("[data-prev]").addEventListener("click", () => show(index - 1));
    lb.querySelector("[data-next]").addEventListener("click", () => show(index + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lightbox__img")) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  /* ---------- Petit message de confirmation ---------- */
  const toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("is-on"), 2200);
  };

  /* ---------- Copier l'adresse e-mail ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        toast("Adresse copiée ✓");
      } catch {
        window.prompt("Copiez l'adresse :", value);
      }
    });
  });

  /* ---------- Formulaire -> ouvre la messagerie ---------- */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const subject = `[Portfolio] ${d.get("sujet")} — ${d.get("nom")}`;
      const body = `${d.get("message")}\n\n—\n${d.get("nom")}\n${d.get("email")}`;
      window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast("Ouverture de votre messagerie…");
    });
  }

  /* ---------- Année du pied de page ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
