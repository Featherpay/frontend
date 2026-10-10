// Featherpay embed script — creators paste this into their sites.
// Usage: <script src="https://featherpay.io/embed.js" data-creator="creatorname"></script>

(function () {
  "use strict";

  // Find the script tag that loaded this script
  const scriptTag = document.currentScript;
  if (!scriptTag) {
    console.error("Featherpay embed: Could not find script tag");
    return;
  }

  // Read creator handle from data-creator attribute
  const creatorHandle = scriptTag.getAttribute("data-creator");
  if (!creatorHandle) {
    console.error("Featherpay embed: Missing data-creator attribute");
    return;
  }

  // Get base URL (production: featherpay.io, dev: localhost:3000)
  const baseUrl = scriptTag.src.replace("/embed.js", "").replace(/\/+$/, "");

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = `${baseUrl}/embed?creator=${encodeURIComponent(creatorHandle)}`;
  iframe.title = `Tip ${creatorHandle}`;
  iframe.style.width = "100%";
  iframe.style.maxWidth = "420px";
  iframe.style.minHeight = "500px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.08)";
  iframe.style.background = "transparent";
  iframe.style.display = "block";
  iframe.style.margin = "0 auto";

  // Prevent layout shift by setting initial height
  iframe.setAttribute("loading", "lazy");

  // Insert iframe adjacent to script tag
  scriptTag.parentNode?.insertBefore(iframe, scriptTag.nextSibling);
})();