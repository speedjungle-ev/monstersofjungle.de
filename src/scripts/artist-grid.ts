import { ARTIST_META_MAP, ARTIST_PAGE_GRID_ORDER } from "../crate.ts";
import { renderArtistGrid } from "../components/render-artist-grid.ts";

const targetElement = document.querySelector("#artist-grid") as HTMLElement;
if (targetElement) {
  renderArtistGrid(ARTIST_META_MAP, ARTIST_PAGE_GRID_ORDER, targetElement);
}
