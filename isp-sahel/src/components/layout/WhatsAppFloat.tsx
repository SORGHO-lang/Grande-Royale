import { whatsappHref } from "@/lib/format";

export function WhatsAppFloat({ numero }: { numero: string }) {
  return (
    <a
      href={whatsappHref(numero, "Bonjour ISP SAHEL, je souhaite avoir des informations sur vos formations.")}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float fixed bottom-4 right-4 z-30 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#157a3a] px-5 font-semibold text-white shadow-lg shadow-black/20 hover:bg-[#0f6630] focus-visible:outline-offset-4"
      aria-label="Écrire à l'ISP SAHEL sur WhatsApp (nouvel onglet)"
    >
      <span aria-hidden="true">💬</span> WhatsApp
    </a>
  );
}
