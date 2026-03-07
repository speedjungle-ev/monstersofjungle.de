import { renderMixList } from "../components/MixList.ts";
import { html, render } from "lit-html";
import type { ArtistMeta } from "../types/types";
import { ARTIST_META_MAP } from "../constants.ts";

const params = new URLSearchParams(window.location.search);
const artistParam = params.get("artist") || "Undefined Artist";
const artistMeta = ARTIST_META_MAP[artistParam] as ArtistMeta;

const artistHeader = document.querySelector("header");
const artistKeyElement = document.getElementById("artist-key");
const mixLinksElement = document.getElementById("mix-links");
const attachmentElement = document.getElementById("attachments");

if (artistHeader) {
  render(
    html`${Array.from({ length: 4 }).map(
      (_item, index) =>
        html`<img
          src="/artists/${artistParam}${index + 1}.png"
          alt="${artistParam}${index}"
        />`,
    )}`,
    artistHeader,
  );
}

if (artistKeyElement) {
  artistKeyElement.innerHTML = String(artistMeta.artistNameLabel);
}
if (mixLinksElement) {
  mixLinksElement.textContent = "";
  renderMixList(artistMeta.mixLinks, mixLinksElement);
}
if (attachmentElement && artistMeta.attachment) {
  attachmentElement.textContent = artistMeta.attachment;
}
