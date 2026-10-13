/* ISP SAHEL — interactions de la version HTML (sans dépendance). */
(function () {
  "use strict";
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var params = new URLSearchParams(location.search);
  var norm = function (s) { return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };

  /* ─── Lien actif du menu (selon l'adresse de la page) ─────────────── */
  var here = location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "") || "/";
  $$("header nav a, #menu-mobile a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split(/[?#]/)[0].replace(/\/$/, "") || "/";
    var active = href === "/" ? here === "/" : here === href || here.indexOf(href + "/") === 0;
    if (href.charAt(0) !== "/" || a.closest("ol")) return;
    if (active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  var strip = $("header nav[aria-label='Navigation rapide'] ul");
  var current = strip && $("[aria-current='page']", strip);
  if (current) strip.scrollLeft = current.offsetLeft - strip.clientWidth / 2 + current.clientWidth / 2;

  /* ─── Mode sombre ──────────────────────────────────────────────────── */
  var themeBtn = $("header button[aria-pressed]");
  function syncTheme() {
    var dark = document.documentElement.dataset.theme === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.setAttribute("aria-label", dark ? "Activer le mode clair" : "Activer le mode sombre");
    themeBtn.innerHTML = dark
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
  }
  if (themeBtn) {
    syncTheme();
    themeBtn.addEventListener("click", function () {
      var dark = document.documentElement.dataset.theme !== "dark";
      if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme;
      try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
      syncTheme();
    });
  }

  /* ─── Menu burger ──────────────────────────────────────────────────── */
  var burger = $("button[aria-controls='menu-mobile']");
  var panel = $("#menu-mobile");
  var iconMenu = burger ? burger.innerHTML : "";
  var iconClose = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  function setMenu(open) {
    panel.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    burger.innerHTML = open ? iconClose : iconMenu;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var first = $("a", panel); if (first) first.focus(); }
  }
  if (burger && panel) {
    burger.addEventListener("click", function () { setMenu(panel.hidden); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { setMenu(false); burger.focus(); } });
  }

  /* ─── Galerie : visionneuse ────────────────────────────────────────── */
  $$("ul").forEach(function (list) {
    var buttons = $$("button[aria-label^='Agrandir la photo']", list);
    if (!buttons.length) return;
    var dialog = $("dialog[aria-label='Visionneuse de photos']");
    if (!dialog) return;
    var photos = buttons.map(function (b) {
      var img = $("img", b), cap = b.parentNode.querySelector("figcaption");
      return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "", legende: cap ? cap.textContent : "" };
    });
    var index = 0, opener = null, startX = null;
    function render() {
      var p = photos[index];
      dialog.innerHTML =
        '<div class="flex h-full flex-col">' +
        '<div class="flex items-center justify-between p-3"><p class="text-sm text-white/80" aria-live="polite">' + (index + 1) + " / " + photos.length + "</p>" +
        '<button type="button" data-act="close" class="inline-flex h-12 w-12 items-center justify-center rounded-full hover:bg-white/10" aria-label="Fermer la visionneuse">✕</button></div>' +
        '<div class="relative flex-1"><img src="' + p.src + '" alt="" class="absolute inset-0 h-full w-full object-contain"/></div>' +
        '<div class="flex items-center gap-3 p-3"><button type="button" data-act="prev" class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Photo précédente">‹</button>' +
        '<p class="flex-1 text-center text-sm sm:text-base"></p>' +
        '<button type="button" data-act="next" class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Photo suivante">›</button></div></div>';
      $("img", dialog).alt = p.alt;
      $("p.flex-1", dialog).textContent = p.legende;
      $("[data-act=close]", dialog).focus();
    }
    function go(d) { index = (index + d + photos.length) % photos.length; render(); }
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () { opener = b; index = i; render(); dialog.showModal(); $("[data-act=close]", dialog).focus(); });
    });
    dialog.addEventListener("click", function (e) {
      var act = e.target.closest && e.target.closest("[data-act]");
      if (e.target === dialog || (act && act.dataset.act === "close")) dialog.close();
      else if (act) go(act.dataset.act === "next" ? 1 : -1);
    });
    dialog.addEventListener("close", function () { if (opener) opener.focus(); });
    dialog.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); });
    dialog.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    });
  });

  /* ─── Documents : recherche et filtre ──────────────────────────────── */
  var search = $("#doc-recherche"), rubrique = $("#doc-rubrique");
  if (search && rubrique) {
    var count = $("p[aria-live='polite']", search.closest("div.flex").parentNode);
    var sections = $$("section[aria-labelledby^='rub-']");
    var empty = document.createElement("p");
    empty.className = "mt-6 rounded-2xl bg-surface p-8 text-center text-muted ring-1 ring-line";
    empty.textContent = "Aucun document ne correspond à votre recherche.";
    empty.hidden = true;
    sections[sections.length - 1].after(empty);
    var filter = function () {
      var q = norm(search.value.trim()), r = rubrique.value, n = 0;
      sections.forEach(function (s) {
        var okRub = r === "toutes" || s.getAttribute("aria-labelledby") === "rub-" + r, visible = 0;
        $$("li", s).forEach(function (li) {
          var show = okRub && (!q || norm(li.textContent).indexOf(q) !== -1);
          li.hidden = !show;
          if (show) visible++;
        });
        s.hidden = visible === 0;
        n += visible;
      });
      if (count) count.textContent = n + " document" + (n > 1 ? "s" : "");
      empty.hidden = n !== 0;
    };
    search.addEventListener("input", filter);
    rubrique.addEventListener("change", filter);
    if (params.get("indisponible")) {
      var note = document.createElement("p");
      note.className = "mb-4 rounded-xl bg-surface-2 p-3 font-semibold";
      note.textContent = "Ce document n'est pas encore disponible en téléchargement.";
      search.closest("div.flex").before(note);
    }
  }

  /* ─── Actualités : filtre par catégorie (?categorie=…) ─────────────── */
  var catNav = $("nav[aria-label='Catégories']");
  if (catNav) {
    var cat = params.get("categorie");
    var links = $$("a", catNav), label = null;
    links.forEach(function (a) {
      var c = new URL(a.href, location.href).searchParams.get("categorie");
      var active = (c || null) === (cat || null);
      if (active) { a.setAttribute("aria-current", "page"); if (c) label = a.textContent.trim(); } else a.removeAttribute("aria-current");
    });
    if (label) {
      var cards = $$("main article.card");
      var shown = 0;
      cards.forEach(function (c) {
        var b = $(".badge-gold", c), ok = b && b.textContent.trim() === label;
        c.hidden = !ok;
        if (ok) shown++;
      });
      if (!shown && cards.length) {
        var msg = document.createElement("p");
        msg.className = "mt-10 rounded-2xl bg-surface p-8 text-center text-muted ring-1 ring-line";
        msg.textContent = "Aucun article dans cette rubrique pour le moment.";
        cards[0].parentNode.before(msg);
      }
    }
  }

  /* ─── Formulaires (pré-inscription et contact) ─────────────────────── */
  var waLink = $("a[href^='https://wa.me/']");
  var waNumber = waLink ? waLink.getAttribute("href").replace(/^https:\/\/wa\.me\/(\d+).*$/, "$1") : "22650393333";
  var waHref = function (msg) { return "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(msg); };
  var PHONE = /^[+(\d][\d\s()+.-]{6,24}$/;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

  function rules(type) {
    var r = {
      nom: function (v) { return v.length >= 2 && v.length <= 120 ? "" : type === "contact" ? "Indiquez votre nom" : "Indiquez votre nom complet"; },
      email: function (v) { return !v && type !== "contact" ? "" : EMAIL.test(v) ? "" : "Adresse e-mail invalide"; },
      telephone: function (v) {
        if (!v && type === "contact") return "";
        var n = v.replace(/\D/g, "").length;
        return PHONE.test(v) && n >= 8 && n <= 15 ? "" : "Numéro de téléphone invalide";
      },
    };
    if (type === "preinscription") {
      r.niveau = function (v) { return v ? "" : "Choisissez un niveau"; };
      r.filiere = function (v) { return v ? "" : "Choisissez une filière"; };
    } else {
      r.message = function (v) { return v.length >= 5 ? "" : "Votre message est trop court"; };
    }
    return r;
  }

  function showErrors(form, errors) {
    $$(".field-error[data-js]", form).forEach(function (e) { e.remove(); });
    $$("[aria-invalid]", form).forEach(function (e) { e.removeAttribute("aria-invalid"); });
    var first = null;
    Object.keys(errors).forEach(function (name) {
      var input = form.elements[name];
      if (!input || !errors[name]) return;
      input.setAttribute("aria-invalid", "true");
      var p = document.createElement("p");
      p.className = "field-error";
      p.setAttribute("data-js", "");
      p.setAttribute("role", "alert");
      p.id = "err-" + name;
      p.textContent = errors[name];
      input.setAttribute("aria-describedby", p.id);
      input.parentNode.appendChild(p);
      if (!first) first = input;
    });
    return first;
  }

  function status(form, ok, message, wa) {
    var box = $("[aria-live]", form);
    box.innerHTML = ok
      ? '<div class="rounded-xl border border-success/40 bg-success/10 p-4"><p class="font-semibold text-success">✓ ' + esc(message) + "</p></div>"
      : '<div class="rounded-xl border border-[#b42318]/40 bg-[#b42318]/10 p-4 font-semibold text-[#b42318]">' + esc(message) +
        (wa ? ' <a class="underline" target="_blank" rel="noopener noreferrer" href="' + wa + '">Envoyer via WhatsApp</a>' : "") + "</div>";
    box.focus();
  }

  function waMessage(form) {
    var g = function (k) { return form.elements[k] ? form.elements[k].value.trim() : ""; };
    return ["Bonjour ISP SAHEL, je souhaite me pré-inscrire.",
      g("nom") && "Nom : " + g("nom"), g("telephone") && "Téléphone : " + g("telephone"), g("email") && "E-mail : " + g("email"),
      g("filiere") && "Filière : " + g("filiere"), g("niveau") && "Niveau : " + g("niveau")].filter(Boolean).join("\n");
  }

  $$("form[data-form]").forEach(function (form) {
    var type = form.getAttribute("data-form");
    var t = form.elements._t;
    if (t) t.value = String(Date.now());

    // Pré-remplissages depuis l'adresse (?filiere=slug, ?sujet=…)
    if (type === "preinscription" && params.get("filiere")) {
      var opt = form.elements.filiere.querySelector("option[data-slug='" + CSS.escape(params.get("filiere")) + "']");
      if (opt) form.elements.filiere.value = opt.value;
    }
    if (type === "contact" && params.get("sujet") && form.elements.sujet) form.elements.sujet.value = params.get("sujet").slice(0, 150);

    var waBtn = $$("button[type=button]", form).filter(function (b) { return /WhatsApp/.test(b.textContent); })[0];
    if (waBtn) waBtn.addEventListener("click", function () { window.open(waHref(waMessage(form)), "_blank", "noopener,noreferrer"); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = rules(type), errors = {}, has = false;
      Object.keys(r).forEach(function (k) {
        var el = form.elements[k];
        var msg = r[k](el ? el.value.trim() : "");
        if (msg) { errors[k] = msg; has = true; }
      });
      var first = showErrors(form, errors);
      if (has) { status(form, false, "Merci de corriger les champs indiqués."); if (first) first.focus(); return; }

      var btn = $("button[type=submit]", form), label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Envoi en cours…";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.ok) {
            form.reset();
            if (t) t.value = String(Date.now());
            status(form, true, data.message);
          } else {
            if (data.errors) showErrors(form, data.errors);
            status(form, false, data.message, type === "preinscription" ? waHref(waMessage(form)) : null);
          }
        })
        .catch(function () {
          status(form, false, "L'envoi n'a pas abouti. Vous pouvez nous écrire sur WhatsApp ou nous appeler.", type === "preinscription" ? waHref(waMessage(form)) : null);
        })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });
})();

/* ─── Documents déposés dans /documents/fichiers/ ──────────────────────
   documents/liste.php renvoie les fichiers présents ; si l'un porte le nom
   attendu (attribut data-fichier), « Bientôt disponible » devient « Télécharger ». */
(function () {
  "use strict";
  var targets = Array.prototype.slice.call(document.querySelectorAll("[data-fichier]"));
  if (!targets.length) return;
  var icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>';
  function taille(o) { return o < 1048576 ? Math.round(o / 1024) + " Ko" : (o / 1048576).toFixed(1).replace(".", ",") + " Mo"; }

  function activer(el, f) {
    var ligne = el.tagName === "LI";
    var span = ligne ? el.querySelector("span[aria-disabled]") : el;
    if (!span) return;
    var ext = f.ext.toUpperCase();
    var titre = ligne ? (el.querySelector("p.font-semibold") || {}).textContent : "le programme";
    var a = document.createElement("a");
    a.href = f.url;
    a.setAttribute("download", "");
    a.className = ligne ? "btn btn-primary shrink-0" : "btn btn-outline";
    a.setAttribute("aria-label", "Télécharger " + titre + " (" + ext + ", " + taille(f.taille) + ")");
    a.innerHTML = icon + (ligne ? " Télécharger" : " Télécharger le programme (" + ext + ")");
    span.replaceWith(a);
    if (!ligne) return;
    Array.prototype.forEach.call(el.querySelectorAll("p.mt-1 span"), function (s) {
      if (/^Type :/.test(s.textContent)) s.textContent = "Type : " + ext;
      if (/^Taille :/.test(s.textContent)) s.textContent = "Taille : " + taille(f.taille);
    });
  }

  fetch("/documents/liste.php", { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      targets.forEach(function (el) {
        var f = data.fichiers[el.getAttribute("data-fichier")];
        if (f) activer(el, f);
      });
    })
    .catch(function () { /* liste indisponible : les boutons restent « Bientôt disponible » */ });
})();
