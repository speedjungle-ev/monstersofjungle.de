import { renderMixList } from "../components/render-mix-list.ts";
import { html, render } from "lit-html";
import { ARTIST_META_MAP } from "../crate.ts";
import type { ArtistMetaData } from "../types/types";

const logos = import.meta.glob("/public/logos/*.png", { eager: true });
const artistImages = import.meta.glob("/public/artists/*.png", { eager: true });
/**
 * Artist Details
 *
 * Read the URL Search params for artist KEY
 */
const params = new URLSearchParams(window.location.search);
const artistParam = params.get("artist") || "Undefined Artist";
const artistMeta = ARTIST_META_MAP[artistParam] as ArtistMetaData;

const artistHeader = document.querySelector("header");
const artistKeyElement = document.getElementById("artist-key");
const mixLinksElement = document.getElementById("mix-links");
const attachmentElement = document.getElementById("attachments");

const artistImageCount = Object.keys(artistImages).filter((img) =>
  img.includes(artistParam),
).length;

if (artistHeader) {
  render(
    html`${Array.from({ length: artistImageCount }).map(
      (_item, index) =>
        html`<img
          src="${import.meta.env.BASE_URL}artists/${artistParam}${index +
          1}.png"
          alt="${artistParam}${index}"
        />`,
    )}`,
    artistHeader,
  );
}

if (artistKeyElement) {
  const logoPath = `${import.meta.env.BASE_URL}logos/${artistParam}_logo.png`;
  const logoExists = `/public/logos/${artistParam}_logo.png` in logos;

  artistKeyElement.innerHTML = logoExists
    ? `<img src="${logoPath}" alt="${artistMeta.artistNameLabel}" />`
    : `<span>${artistMeta.artistNameLabel}</span>`;
}
if (mixLinksElement) {
  mixLinksElement.textContent = "";
  renderMixList(artistMeta.mixLinks, mixLinksElement);
}
if (attachmentElement && artistMeta.attachment) {
  attachmentElement.textContent = artistMeta.attachment;
}
