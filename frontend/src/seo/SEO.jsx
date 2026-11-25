import { useEffect } from "react";

const SITE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:5173";

function upsertMeta(attrName, attrValue, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function SEO({
  title = "GANESPACE — Ganesha Campus Space | Discover Campus Events",
  description = "Discover academic and non-academic events at Universitas Pendidikan Ganesha through GANESPACE.",
  canonical = "",
  image = "/assets/logo-ganespace.png",
  keywords = "GANESPACE, Undiksha, Event Kampus, Seminar Proposal, Sempro, Workshop, Universitas Pendidikan Ganesha",
  noIndex = false,
  jsonLd = null,
}) {
  useEffect(() => {
    document.title = title;

    const fullCanonical = canonical
      ? canonical.startsWith("http")
        ? canonical
        : `${SITE_URL}${canonical}`
      : window.location.href;

    const fullImage = image?.startsWith("http") ? image : `${SITE_URL}${image}`;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:image", fullImage);
    upsertMeta("property", "og:url", fullCanonical);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:locale", "id_ID");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", fullImage);

    let canonicalEl = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", fullCanonical);

    const scriptId = "ganespace-jsonld";
    let scriptEl = document.getElementById(scriptId);
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = scriptId;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, canonical, image, keywords, noIndex, jsonLd]);

  return null;
}