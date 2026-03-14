import { renderTemplate } from "./utils/render-template.ts";

console.log("monstahz!!!");

const headerEl = document.querySelector("header");
const footerEl = document.querySelector("footer");

// Array are pages where the header will not be replaced
const hasCustomHeader = [
  `${import.meta.env.BASE_URL}/artist-details.html`,
].includes(window.location.pathname);
console.log(window.location);
if (headerEl && !hasCustomHeader)
  await renderTemplate("templates/header.html", headerEl);
if (footerEl) await renderTemplate("templates/footer.html", footerEl);
