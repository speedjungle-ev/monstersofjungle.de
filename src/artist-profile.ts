import { getNextRadioShowDate } from "./utils/get-next-radio-show-date.ts";
import { type MixListLink, renderMixList } from "./components/MixList.ts";

import elektrikearlinerData from "./artist-data/elektrikearliner.ts";
import tforceData from "./artist-data/tforce.ts";

type ArtistMeta = {
  artistNameLabel: string;
  mixData: MixListLink[];
  nextRadioEvent?: Date;
};

const artistDataMap: Record<string, ArtistMeta> = {
  elektrikearliner: {
    artistNameLabel: elektrikearlinerData.artistNameLabel,
    mixData: elektrikearlinerData.mixLinks,
    nextRadioEvent: elektrikearlinerData.nextRadioEvent,
  },
  tforce: {
    artistNameLabel: tforceData.artistNameLabel,
    mixData: tforceData.mixLinks,
  },
};

const params = new URLSearchParams(window.location.search);
const artistParam = params.get("artist") || "Undefined Artist";
const artistMeta = artistDataMap[artistParam] as ArtistMeta;

// const attachmentElement = document.getElementById("attachments")
const mixLinksElement = document.getElementById("mix-links");
const artistKeyElement = document.getElementById("artist-key");

if (artistKeyElement) {
  artistKeyElement.innerHTML = String(artistMeta.artistNameLabel);
}
if (mixLinksElement) {
  renderMixList(artistMeta.mixData, mixLinksElement);
}

console.log(`${artistParam} - monstahz!!!`);
console.log(getNextRadioShowDate(Date.now()));
