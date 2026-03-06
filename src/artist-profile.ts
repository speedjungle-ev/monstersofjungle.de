import { type MixListLink, renderMixList } from "./components/MixList.ts";

import elektrikearlinerData from "./artist-data/elektrikearliner.ts";
import tforceData from "./artist-data/tforce.ts";
import { html, render } from "lit-html";

export type ArtistMeta = {
  artistNameLabel: string;
  mixLinks: MixListLink[];
  attachment?: string;
};

const artistDataMap: Record<string, ArtistMeta> = {
  elektrikearliner: elektrikearlinerData,
  tforce: tforceData,
};

const params = new URLSearchParams(window.location.search);
const artistParam = params.get("artist") || "Undefined Artist";
const artistMeta = artistDataMap[artistParam] as ArtistMeta;

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
