// import {mixLinks, nextRadioEvent} from "./artist-data/elektrikearliner.ts";

const attachmentElement = document.getElementById("attachments")
const mixListElement = document.getElementById("mix-list")
const targetElement = document.getElementById("artist-key")

const artistDataMap: Record<string, string> = {
    elektrikearliner: "Elektrik Earliner",
    tforce: "T-Force",
}

const params = new URLSearchParams(window.location.search);
const artist = params.get("artist") ?? "Unknown Artist";

if (attachmentElement && targetElement && mixListElement) {

    targetElement.innerHTML = artistDataMap[artist]

    // const pElement = document.createElement("p");
    // pElement.innerHTML = `Next Radio Show: ${nextRadioEvent}`
    // targetElement.appendChild(pElement);
    //
    // mixLinks.forEach(linkObj => {
    //     const liElement = document.createElement("li");
    //     liElement.innerHTML = `<a href="${linkObj.link}" target="_blank" rel="noopener">${linkObj.label}</a>`;
    //     // const aElement = document.createElement("a");
    //     // liElement.appendChild(aElement);
    //     mixListElement.appendChild(liElement);
    // });

    console.log("monstahz!!!")
}
