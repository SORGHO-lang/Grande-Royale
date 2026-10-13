/* ISP SAHEL — animations (apparition au défilement, compteurs, onde des boutons,
   barre de progression, ombre de l'en-tête). Sans dépendance.
   La classe « anim » est posée sur <html> dans le <head> ; sans JavaScript,
   rien n'est masqué. Respecte le réglage « réduire les animations ». */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SELECTOR = "section h2, section .eyebrow, .card, ol > li, figure, table, details, .prose-content > *, blockquote, [data-count]";

  /* ─── Compteurs (chiffres clés) ─────────────────────────────────────── */
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    var final = el.textContent.trim();
    var target = parseInt(final.replace(/\D/g, ""), 10);
    if (!target || reduce) return;
    var isYear = el.dataset.count === "annee";
    var from = isYear ? target - 25 : 0;
    var start = null;
    var duration = 1600;
    var fmt = function (n) { return isYear || n < 1000 ? String(n) : n.toLocaleString("fr-FR"); };
    function step(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / duration);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(from + (target - from) * eased));
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = final;
    }
    el.textContent = fmt(from);
    requestAnimationFrame(step);
  }

  /* ─── Apparition au défilement ──────────────────────────────────────── */
  function reveal(el) {
    if (el.classList.contains("is-visible")) return;
    el.classList.add("is-visible");
    if (el.hasAttribute("data-count")) countUp(el);
    var done = function () {
      el.classList.add("reveal-done");
      el.style.removeProperty("--reveal-delay");
    };
    el.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 1600);
  }

  var observer = null;
  if (!reduce && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          reveal(e.target);
          observer.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  }

  function scan(scope) {
    var els = (scope || document).querySelectorAll("[data-reveal] :is(" + SELECTOR + ")");
    var groups = new Map();
    Array.prototype.forEach.call(els, function (el) {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = "1";
      // Décalage en cascade entre éléments frères (cartes d'une grille…)
      var parent = el.parentElement;
      var i = groups.get(parent) || 0;
      groups.set(parent, i + 1);
      if (i > 0) el.style.setProperty("--reveal-delay", Math.min(i, 6) * 90 + "ms");
      if (observer) observer.observe(el);
      else reveal(el);
    });
  }

  scan();
  // Contenu ajouté plus tard (navigation côté client, filtres…)
  if ("MutationObserver" in window) {
    new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++) if (muts[m].addedNodes.length) { scan(); break; }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ─── Onde au clic sur les boutons ──────────────────────────────────── */
  if (!reduce) {
    document.addEventListener("pointerdown", function (e) {
      var btn = e.target.closest && e.target.closest(".btn");
      if (!btn || btn.disabled || btn.getAttribute("aria-disabled") === "true") return;
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = e.clientX - r.left - size / 2 + "px";
      span.style.top = e.clientY - r.top - size / 2 + "px";
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 700);
    });
  }

  /* ─── Barre de progression + ombre de l'en-tête ─────────────────────── */
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var header = document.querySelector("header.sticky");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    bar.style.setProperty("--progress", max > 0 ? String(Math.min(1, window.scrollY / max)) : "0");
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
})();
