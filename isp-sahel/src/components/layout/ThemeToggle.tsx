"use client";
import { useEffect, useState } from "react";
import { Icon } from "../Icon";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* stockage indisponible : le choix vaut pour la page en cours */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-fg hover:bg-surface-2"
      aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
      aria-pressed={dark}
    >
      <Icon name={dark ? "sun" : "moon"} />
    </button>
  );
}
