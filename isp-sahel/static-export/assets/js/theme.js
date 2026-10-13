// Applique le thème mémorisé et active les animations avant l'affichage (évite le flash).
document.documentElement.classList.add("anim");
try { if (localStorage.getItem("theme") === "dark") document.documentElement.dataset.theme = "dark"; } catch (e) {}
