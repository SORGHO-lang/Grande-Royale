/* ==========================================================================
   LA GRANDE ROYALE — Scripts du site
   Vanilla JavaScript, aucune dépendance obligatoire.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Paramètres du site — à modifier en un seul endroit
     ------------------------------------------------------------------ */
  var CONFIG = {
    whatsapp: "22674038900",          // numéro international sans "+"
    messageWhatsapp: "Bonjour La Grande Royale, je souhaite commander le livre « Le Pouvoir de la Conviction ».",
    emails: ["azetadinga@yahoo.fr", "granderoyale99@gmail.com"]
  };

  var doc = document;
  var $  = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     1. En-tête : état au défilement + barre de progression
     ------------------------------------------------------------------ */
  function entete() {
    var header = $(".entete");
    var barre  = $(".progression");
    if (!header) return;

    var seuil = 60;
    var tick = false;

    function maj() {
      var y = window.pageYOffset || doc.documentElement.scrollTop;
      header.classList.toggle("defile", y > seuil);

      if (barre) {
        var hauteur = doc.documentElement.scrollHeight - window.innerHeight;
        barre.style.width = (hauteur > 0 ? (y / hauteur) * 100 : 0) + "%";
      }
      tick = false;
    }

    window.addEventListener("scroll", function () {
      if (!tick) { window.requestAnimationFrame(maj); tick = true; }
    }, { passive: true });

    maj();
  }

  /* ------------------------------------------------------------------
     2. Menu mobile
     ------------------------------------------------------------------ */
  function menuMobile() {
    var burger = $(".burger");
    var nav    = $(".nav");
    if (!burger || !nav) return;

    function basculer(forcer) {
      var ouvert = typeof forcer === "boolean" ? forcer : !nav.classList.contains("ouvert");
      nav.classList.toggle("ouvert", ouvert);
      burger.classList.toggle("ouvert", ouvert);
      doc.body.classList.toggle("menu-ouvert", ouvert);
      burger.setAttribute("aria-expanded", String(ouvert));
      burger.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
    }

    burger.addEventListener("click", function () { basculer(); });

    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { basculer(false); });
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") basculer(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 880) basculer(false);
    });
  }

  /* ------------------------------------------------------------------
     3. Animations à l'apparition
     ------------------------------------------------------------------ */
  function animations() {
    var cibles = $$("[data-anim]");
    if (!cibles.length) return;

    if (!("IntersectionObserver" in window)) {
      cibles.forEach(function (el) { el.classList.add("visible"); });
      return;
    }

    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        var el = entree.target;
        var delai = parseInt(el.getAttribute("data-delai") || "0", 10);
        setTimeout(function () { el.classList.add("visible"); }, delai);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    cibles.forEach(function (el) { obs.observe(el); });
  }

  /* ------------------------------------------------------------------
     4. Compteurs animés
     ------------------------------------------------------------------ */
  function compteurs() {
    var cibles = $$("[data-compteur]");
    if (!cibles.length || !("IntersectionObserver" in window)) {
      cibles.forEach(function (el) { el.textContent = el.getAttribute("data-compteur"); });
      return;
    }

    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        var el = entree.target;
        var fin = parseInt(el.getAttribute("data-compteur"), 10) || 0;
        var suffixe = el.getAttribute("data-suffixe") || "";
        var duree = 1600;
        var debut = null;

        function pas(t) {
          if (debut === null) debut = t;
          var p = Math.min((t - debut) / duree, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(fin * eased) + suffixe;
          if (p < 1) requestAnimationFrame(pas);
        }
        requestAnimationFrame(pas);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    cibles.forEach(function (el) { obs.observe(el); });
  }

  /* ------------------------------------------------------------------
     5. Carrousel de témoignages
     ------------------------------------------------------------------ */
  function carrousel() {
    var racine = $(".carrousel");
    if (!racine) return;

    var slides = $$(".carrousel__slide", racine);
    var points = $$(".point", racine);
    if (slides.length < 2) return;

    var actif = 0;
    var minuteur = null;

    function afficher(i) {
      actif = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("actif", k === actif); });
      points.forEach(function (p, k) {
        p.classList.toggle("actif", k === actif);
        p.setAttribute("aria-selected", String(k === actif));
      });
    }

    function demarrer() {
      arreter();
      minuteur = setInterval(function () { afficher(actif + 1); }, 7000);
    }
    function arreter() { if (minuteur) clearInterval(minuteur); }

    points.forEach(function (p, k) {
      p.addEventListener("click", function () { afficher(k); demarrer(); });
    });

    racine.addEventListener("mouseenter", arreter);
    racine.addEventListener("mouseleave", demarrer);

    // Glissement tactile
    var xDepart = null;
    racine.addEventListener("touchstart", function (e) { xDepart = e.touches[0].clientX; }, { passive: true });
    racine.addEventListener("touchend", function (e) {
      if (xDepart === null) return;
      var delta = e.changedTouches[0].clientX - xDepart;
      if (Math.abs(delta) > 45) afficher(actif + (delta < 0 ? 1 : -1));
      xDepart = null;
    }, { passive: true });

    afficher(0);
    demarrer();
  }

  /* ------------------------------------------------------------------
     6. Filtres de la galerie
     ------------------------------------------------------------------ */
  function filtresGalerie() {
    var boutons = $$(".filtre");
    var items   = $$(".item-galerie");
    if (!boutons.length || !items.length) return;

    boutons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filtre");

        boutons.forEach(function (b) {
          b.classList.toggle("actif", b === btn);
          b.setAttribute("aria-pressed", String(b === btn));
        });

        items.forEach(function (item) {
          var cats = (item.getAttribute("data-categorie") || "").split(" ");
          var montrer = cat === "tout" || cats.indexOf(cat) !== -1;
          item.classList.toggle("cache", !montrer);
        });

        indexerLightbox();
      });
    });
  }

  /* ------------------------------------------------------------------
     7. Lightbox
     ------------------------------------------------------------------ */
  var lightboxItems = [];
  var lightboxIndex = 0;

  function indexerLightbox() {
    lightboxItems = $$(".item-galerie").filter(function (el) {
      return !el.classList.contains("cache");
    });
  }

  function lightbox() {
    var boite = $(".lightbox");
    if (!boite) return;

    var img      = $(".lightbox__img", boite);
    var legende  = $(".lightbox__legende", boite);
    var fermer   = $(".lightbox__fermer", boite);
    var prec     = $(".lightbox__nav--prec", boite);
    var suiv     = $(".lightbox__nav--suiv", boite);

    function ouvrir(i) {
      if (!lightboxItems.length) return;
      lightboxIndex = (i + lightboxItems.length) % lightboxItems.length;
      var item = lightboxItems[lightboxIndex];
      var source = item.querySelector("img");
      img.src = source ? source.getAttribute("src") : "";
      img.alt = source ? source.getAttribute("alt") : "";

      var titre = item.querySelector(".item-galerie__titre");
      var lieu  = item.querySelector(".item-galerie__lieu");
      legende.textContent = [titre && titre.textContent, lieu && lieu.textContent]
        .filter(Boolean).join(" — ");

      boite.classList.add("ouverte");
      boite.setAttribute("aria-hidden", "false");
      doc.body.classList.add("menu-ouvert");
    }

    function fermerBoite() {
      boite.classList.remove("ouverte");
      boite.setAttribute("aria-hidden", "true");
      doc.body.classList.remove("menu-ouvert");
    }

    indexerLightbox();

    doc.addEventListener("click", function (e) {
      var item = e.target.closest && e.target.closest(".item-galerie");
      if (item) {
        indexerLightbox();
        ouvrir(lightboxItems.indexOf(item));
      }
    });

    if (fermer) fermer.addEventListener("click", fermerBoite);
    if (prec) prec.addEventListener("click", function () { ouvrir(lightboxIndex - 1); });
    if (suiv) suiv.addEventListener("click", function () { ouvrir(lightboxIndex + 1); });

    boite.addEventListener("click", function (e) {
      if (e.target === boite) fermerBoite();
    });

    doc.addEventListener("keydown", function (e) {
      if (!boite.classList.contains("ouverte")) return;
      if (e.key === "Escape") fermerBoite();
      if (e.key === "ArrowLeft") ouvrir(lightboxIndex - 1);
      if (e.key === "ArrowRight") ouvrir(lightboxIndex + 1);
    });
  }

  /* ------------------------------------------------------------------
     8. Accordéon
     ------------------------------------------------------------------ */
  function accordeon() {
    var items = $$(".accordeon__item");
    if (!items.length) return;

    items.forEach(function (item) {
      var tete  = $(".accordeon__tete", item);
      var corps = $(".accordeon__corps", item);
      if (!tete || !corps) return;

      tete.addEventListener("click", function () {
        var ouvert = item.classList.contains("ouvert");

        // Fermer les autres items du même accordéon
        var parent = item.parentElement;
        $$(".accordeon__item", parent).forEach(function (autre) {
          autre.classList.remove("ouvert");
          var c = $(".accordeon__corps", autre);
          if (c) c.style.maxHeight = null;
          var t = $(".accordeon__tete", autre);
          if (t) t.setAttribute("aria-expanded", "false");
        });

        if (!ouvert) {
          item.classList.add("ouvert");
          corps.style.maxHeight = corps.scrollHeight + "px";
          tete.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     9. Formulaire de contact
     ------------------------------------------------------------------ */
  function formulaire() {
    var form = $(".formulaire");
    if (!form) return;

    var message = $(".message-formulaire", form);

    function champParent(el) { return el.closest(".champ"); }

    function valider(el) {
      var parent = champParent(el);
      if (!parent) return true;
      var ok = true;
      var valeur = (el.value || "").trim();

      if (el.hasAttribute("required") && !valeur) ok = false;
      if (ok && el.type === "email" && valeur) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur);
      }
      if (ok && el.type === "tel" && valeur) {
        ok = valeur.replace(/[^0-9]/g, "").length >= 8;
      }

      parent.classList.toggle("erreur", !ok);
      return ok;
    }

    var champs = $$("input, select, textarea", form);
    champs.forEach(function (el) {
      el.addEventListener("blur", function () { valider(el); });
      el.addEventListener("input", function () {
        var p = champParent(el);
        if (p && p.classList.contains("erreur")) valider(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var valide = true;
      champs.forEach(function (el) { if (!valider(el)) valide = false; });

      if (!valide) {
        if (message) {
          message.textContent = "Merci de vérifier les champs signalés avant d'envoyer votre message.";
          message.classList.add("visible");
        }
        var premier = $(".champ.erreur input, .champ.erreur select, .champ.erreur textarea", form);
        if (premier) premier.focus();
        return;
      }

      // Aucune base de données côté serveur : on ouvre le client mail de l'utilisateur.
      var donnees = {};
      champs.forEach(function (el) { if (el.name) donnees[el.name] = el.value.trim(); });

      var sujet = "[La Grande Royale] " + (donnees.objet || "Nouveau message du site");
      var corps = [
        "Nom : " + (donnees.nom || ""),
        "Téléphone : " + (donnees.telephone || ""),
        "E-mail : " + (donnees.email || ""),
        "Objet : " + (donnees.objet || ""),
        "",
        "Message :",
        donnees.message || ""
      ].join("\n");

      if (message) {
        message.innerHTML = "Merci " + (donnees.nom ? donnees.nom.split(" ")[0] : "") +
          " ! Votre logiciel de messagerie va s'ouvrir pour finaliser l'envoi. " +
          "Vous pouvez aussi nous écrire directement à <strong>" + CONFIG.emails[0] + "</strong>.";
        message.classList.add("visible");
      }

      window.location.href = "mailto:" + CONFIG.emails.join(",") +
        "?subject=" + encodeURIComponent(sujet) +
        "&body=" + encodeURIComponent(corps);
    });
  }

  /* ------------------------------------------------------------------
     10. Liens WhatsApp
     ------------------------------------------------------------------ */
  function whatsapp() {
    $$("[data-whatsapp]").forEach(function (el) {
      var perso = el.getAttribute("data-whatsapp");
      var texte = perso && perso !== "true" ? perso : CONFIG.messageWhatsapp;
      el.setAttribute("href",
        "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texte));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  /* ------------------------------------------------------------------
     11. Lecture différée des vidéos (placeholder)
     ------------------------------------------------------------------ */
  function videos() {
    $$(".video").forEach(function (v) {
      v.addEventListener("click", function () {
        var id = v.getAttribute("data-video");
        if (!id) return;
        var iframe = doc.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
        iframe.title = v.getAttribute("data-titre") || "Vidéo";
        iframe.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;";
        v.innerHTML = "";
        v.appendChild(iframe);
      });
    });
  }

  /* ------------------------------------------------------------------
     12. Année courante dans le pied de page
     ------------------------------------------------------------------ */
  function annee() {
    $$("[data-annee]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------
     13. Pré-remplir l'objet du formulaire depuis un lien
     ------------------------------------------------------------------ */
  function objetDepuisUrl() {
    var select = doc.getElementById("objet");
    if (!select) return;
    var params = new URLSearchParams(window.location.search);
    var objet = params.get("objet");
    if (!objet) return;
    Array.prototype.forEach.call(select.options, function (opt) {
      if (opt.value === objet) select.value = objet;
    });
  }

  /* ------------------------------------------------------------------
     Initialisation
     ------------------------------------------------------------------ */
  function init() {
    entete();
    menuMobile();
    animations();
    compteurs();
    carrousel();
    filtresGalerie();
    lightbox();
    accordeon();
    formulaire();
    whatsapp();
    videos();
    annee();
    objetDepuisUrl();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
