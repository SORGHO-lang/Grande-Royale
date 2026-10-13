// Applique le thème mémorisé avant l'affichage (évite le flash).
try { if (localStorage.getItem("theme") === "dark") document.documentElement.dataset.theme = "dark"; } catch (e) {}
