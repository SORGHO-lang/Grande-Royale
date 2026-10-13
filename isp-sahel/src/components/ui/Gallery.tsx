"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

type Photo = { id: string; image_url: string; legende: string; alt: string };

/** Grille de photos + visionneuse (clavier : ← → Échap ; tactile : glisser). */
export function Gallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) {
      d.close();
      opener.current?.focus();
    }
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, go]);

  const current = index !== null ? photos[index] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {photos.map((p, i) => (
          <li key={p.id}>
            <figure>
              <button
                type="button"
                onClick={(e) => {
                  opener.current = e.currentTarget;
                  setIndex(i);
                }}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2"
                aria-label={`Agrandir la photo : ${p.legende || p.alt}`}
              >
                <Image src={p.image_url} alt={p.alt || p.legende} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute bottom-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy/70 text-white" aria-hidden="true">
                  <Icon name="search" size={18} />
                </span>
              </button>
              {p.legende ? <figcaption className="mt-2 text-sm text-muted">{p.legende}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={close}
        onCancel={close}
        aria-label="Visionneuse de photos"
        className="m-0 h-full max-h-none w-full max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {current && (
          <div
            className="flex h-full flex-col"
            onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="flex items-center justify-between p-3">
              <p className="text-sm text-white/80" aria-live="polite">{index! + 1} / {photos.length}</p>
              <button type="button" onClick={close} className="inline-flex h-12 w-12 items-center justify-center rounded-full hover:bg-white/10" aria-label="Fermer la visionneuse" autoFocus>
                <Icon name="close" size={26} />
              </button>
            </div>
            <div className="relative flex-1">
              <Image src={current.image_url} alt={current.alt || current.legende} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center gap-3 p-3">
              <button type="button" onClick={() => go(-1)} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Photo précédente">
                <Icon name="chevronLeft" size={26} />
              </button>
              <p className="flex-1 text-center text-sm sm:text-base">{current.legende}</p>
              <button type="button" onClick={() => go(1)} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Photo suivante">
                <Icon name="chevronRight" size={26} />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
