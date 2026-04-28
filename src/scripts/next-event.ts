import { NEXT_EVENT_FLYER, NEXT_EVENT_MESSAGE } from "../crate.ts";

const nextEventTarget = document.querySelector("#next-event") as HTMLElement;

console.log({ NEXT_EVENT_FLYER });

if (nextEventTarget) {
  const img = document.createElement("img");
  img.setAttribute("src", `events/${NEXT_EVENT_FLYER}`);
  nextEventTarget.appendChild(img);

  const p = document.createElement("p");
  p.append(NEXT_EVENT_MESSAGE);
  nextEventTarget.append(p);
}
