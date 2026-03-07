import { html, render } from "lit-html";
import { normalizeArtistMetaDataKeys } from "../utils/normalize-artist-meta-data-keys.ts";
import { ARTIST_PAGE_GRID_ORDER, ARTIST_PAGE_ROUTE } from "../constants.ts";
import { createArtistMetadataEntries } from "../utils/create-artist-metadata-entries.ts";

type ArtistMetaData = {
  artistNameLabel: string;
  mixLinks: { label: string; link: string }[];
  nextRadioEvent: string;
};

const artistDataFiles: Record<string, ArtistMetaData> = import.meta.glob(
  "/src/data-sources/*.ts",
  {
    eager: true,
    import: "default",
  },
);

function renderArtistGrid(
  artists: Record<string, ArtistMetaData>,
  targetElement: HTMLElement,
) {
  render(
    Object.keys(artists).map(
      (artistKey) =>
        html`<a href="${ARTIST_PAGE_ROUTE}?artist=${artistKey}">
          <img
            src="/talent-photo-${artistKey}.png"
            alt="${artists[artistKey].artistNameLabel}"
          />
        </a>`,
    ),
    targetElement,
  );
}

const artistMetaData = createArtistMetadataEntries(artistDataFiles);
const artists = normalizeArtistMetaDataKeys(
  artistMetaData,
  ARTIST_PAGE_GRID_ORDER,
);

const targetElement = document.querySelector("#artist-grid") as HTMLElement;
if (targetElement) {
  renderArtistGrid(artists, targetElement);
}
