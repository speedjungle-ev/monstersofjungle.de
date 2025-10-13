// import {mixLinks, nextRadioEvent} from "./artist-data/elektrikearliner.ts";

const artistDataMap: Record<string, string> = {
    elektrikearliner: "Elektrik Earliner",
    tforce: "T-Force",
}

const params = new URLSearchParams(window.location.search);
const artistParam = params.get("artist")
const artist = artistParam && artistDataMap[artistParam]
    ? artistDataMap[artistParam]
    : "Undefined Artist";

const attachmentElement = document.getElementById("attachments")
const mixLinksElement = document.getElementById("mix-links")
const targetElement = document.getElementById("artist-key")

if (attachmentElement && targetElement && mixLinksElement) {
    targetElement.innerHTML = artist
    // const pElement = document.createElement("p");
    // pElement.innerHTML = `Next Radio Show: ${nextRadioEvent}`
    // targetElement.appendChild(pElement);

    // mixLinksElement.forEach(linkObj => {
    //     const liElement = document.createElement("li");
    //     liElement.innerHTML = `<a href="${linkObj.link}" target="_blank" rel="noopener">${linkObj.label}</a>`;
    //     // const aElement = document.createElement("a");
    //     // liElement.appendChild(aElement);
    //     mixListElement.appendChild(liElement);
    // });

    console.log(`${artist} - monstahz!!!`)
}