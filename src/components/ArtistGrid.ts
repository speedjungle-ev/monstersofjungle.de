import { html, render } from "lit-html";
import { normalizeArtistMetaDataKeys } from "../utils/normalize-artist-meta-data-keys.ts";

type ArtistMetaData = {
  artistNameLabel: string;
  mixLinks: { label: string; link: string }[];
  nextRadioEvent: string;
};

function renderArtistGrid(
  artists: Record<string, ArtistMetaData>,
  targetElement: HTMLElement,
) {
  render(
    Object.keys(artists).map(
      (artistKey) =>
        html`<a href="./artist-profile.html?artist=${artistKey}">
          <img
            src="/talent-photo-${artistKey}.png"
            alt="${artists[artistKey].artistNameLabel}"
          />
        </a>`,
    ),
    targetElement,
  );
}

const artistsMetaData: Record<string, ArtistMetaData> = import.meta.glob(
  "/src/artist-data/*.ts",
  {
    eager: true,
    import: "default",
  },
);

const artists = normalizeArtistMetaDataKeys(artistsMetaData);
const targetElement = document.querySelector("#artist-grid") as HTMLElement;
if (targetElement) {
  renderArtistGrid(artists, targetElement);
}
