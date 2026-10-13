import sanitizeHtml from "sanitize-html";

/** Nettoie le HTML produit par l'éditeur riche (liste blanche stricte). */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "img", "hr", "code", "pre"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName: "a",
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : { href: attribs.href ?? "#", ...(attribs.title ? { title: attribs.title } : {}) },
        };
      },
      img: (tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy", alt: attribs.alt ?? "" } }),
    },
  });
}

/** Version texte brut (extraits, flux RSS). */
export function toPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}
