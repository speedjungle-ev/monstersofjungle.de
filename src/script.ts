import { renderTemplate } from "./utils/render-template.ts";

console.log("monstahz!!!");

// console.log(window.location.search)
// const urlParms = new URLSearchParams(window.location.search)
// console.log(urlParms.get("artist"))

const headerEl = document.querySelector("header");
const footerEl = document.querySelector("footer");

if (headerEl) await renderTemplate("templates/header.html", headerEl);
if (footerEl) await renderTemplate("templates/footer.html", footerEl);
